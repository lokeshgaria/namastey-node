const {
  validateWebhookSignature,
  validatePaymentVerification,
} = require('razorpay/dist/utils/razorpay-utils')
const { sendFailureEmailTemplated, sendSuccessEmailTemplated } = require('../../lib/sesUtils')

const { ERRORS } = require('../../utils/constants/Errors')
const { SUCCESS } = require('../../utils/constants/Success')

class OrderService {
  constructor(orderRepository, userRepository, cacheService) {
    this.orderRepository = orderRepository
    this.userRepository = userRepository
    this.cache = cacheService
  }

  async createOrder(orderData) {
    const user = await this.userRepository.findById(orderData.userId)
    if (!user) {
      throw new Error(ERRORS.USER_NOT_FOUND)
    }
    return await this.orderRepository.createOrder(orderData)
  }

  // async upgradeUserPlan(orderData) {
  //     const newOrder = await this.orderRepository.createOrder(orderData);
  //     return newOrder;
  // }
  async verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature, user }) {
    const secret = process.env.RAZOR_KEY_SECRET

    // The SDK Helper Method
    const isValid = validatePaymentVerification(
      { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
      razorpay_signature,
      secret,
    )

    if (!isValid) {
      throw new Error(ERRORS.INVALID_REQUEST)
    }
    // 3. Update the Order in MongoDB
    // We use findOneAndUpdate to ensure we get the order linked to this specific user
    const updatedOrder = await this.orderRepository.updateOneByQuery(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'succeeded',
      },
      { new: true }, // return the updated order
    )
    if (!updatedOrder) {
      throw new Error(ERRORS.ORDER_NOT_FOUND)
    }
    user.isPremium = true
    user.membershipType = updatedOrder.notes.plan_name
    await this.userRepository.updateById(user._id, {
      isPremium: true,
      membershipType: updatedOrder.notes.plan_name,
    })
    await this.cache.invalidateUserProfile(user._id)
    return {
      order: updatedOrder,
      user: user,
    }
  }

  async updateOrder({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    const order = await this.orderRepository.findOne({ razorpayOrderId: razorpay_order_id })
    if (!order) {
      throw new Error(ERRORS.ORDER_NOT_FOUND)
    }
    return await this.orderRepository.updateById(order._id, {
      razorpay_payment_id,
      razorpay_signature,
    })
  }

  async handleWebhook(req, res) {
    const webhookSecret = process.env.RAZOR_WEBHOOK_SECRET
    const signature = req.headers['x-razorpay-signature']

    console.log('Raw Body Captured:', !!req.rawBody)

    if (!signature || !webhookSecret || !req.rawBody) {
      console.error('Missing parameters for verification')
      return res.status(400).send('Missing parameters') // ← already has return ✅
    }

    const isValid = validateWebhookSignature(req.rawBody, signature, webhookSecret)

    if (!isValid) {
      console.error('Signature mismatch!')
      return res.status(400).send('Invalid signature') // ← already has return ✅
    }

    const { event, payload } = req.body
    const paymentEntity = payload.payment.entity
    const orderId = paymentEntity.order_id

    console.log('event__', event)

    if (event === 'payment.captured' || event === 'order.paid') {
      const order = await this.orderRepository.findOne({ razorpayOrderId: orderId })

      if (!order) {
        console.error('Order not found in DB for Webhook:', orderId)
        return res.status(200).json({ status: 'ok' }) // ← already has return ✅
      }

      if (order.status !== 'succeeded') {
        // ✅ Fixed: use updateById instead of save()
        await this.orderRepository.updateById(order._id, {
          status: 'succeeded',
          razorpayPaymentId: paymentEntity.id,
        })

        await this.userRepository.updateById(order.userId, {
          isPremium: true,
          membershipType: order.notes.plan_name,
        })
        await this.cache.invalidateUserProfile(order.userId)
        console.log(`[SUCCESS] Webhook processed for Order: ${orderId}`)
        // Send success email
        const emailUser = await this.userRepository.findById(order.userId)
        if (emailUser) {
          console.log(`Sending success email to ${emailUser.email} for Order ${orderId}`)
          await sendSuccessEmailTemplated(emailUser, '', orderId)
        }
      }
    } else if (event === 'payment.failed') {
      const order = await this.orderRepository.findOne({ razorpayOrderId: orderId })

      if (order) {
        // ✅ Fixed: use updateById instead of save()
        await this.orderRepository.updateById(order._id, {
          status: 'failed',
        })

        const errorCode = paymentEntity.error_code
        const errorDesc = paymentEntity.error_description

        console.error(
          `[FAILURE] Order ${orderId} failed. Reason: ${errorDesc} (Code: ${errorCode})`,
        )

        const emailUser = await this.userRepository.findById(order.userId)
        if (emailUser) {
          console.log(`Sending failure email to ${emailUser.email} for Order ${orderId}`)
          await sendFailureEmailTemplated(emailUser, errorDesc, orderId)
        } else {
          console.error(`User not found for Order ${orderId}, cannot send failure email.`)
        }
      } else {
        console.error('Order not found in DB for failed payment Webhook:', orderId)
      }
    }

    // ✅ Only ONE response at the end — no duplicates
    return res.sendStatus(200)
  }
}
module.exports = OrderService
