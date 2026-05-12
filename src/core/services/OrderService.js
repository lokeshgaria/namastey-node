const {
  validateWebhookSignature,
  validatePaymentVerification,
} = require('razorpay/dist/utils/razorpay-utils')
const { sendFailureEmailTemplated } = require('../../lib/sesUtils')

const { ERRORS } = require('../../utils/constants/Errors')
const { SUCCESS } = require('../../utils/constants/Success')

class OrderService {
  constructor(orderRepository, userRepository) {
    this.orderRepository = orderRepository
    this.userRepository = userRepository
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

    // DEBUGGING: Check if rawBody is captured
    console.log('Raw Body Captured:', !!req.rawBody)

    if (!signature || !webhookSecret || !req.rawBody) {
      console.error('Missing parameters for verification')
      return res.status(400).send('Missing parameters')
    }

    // Use the rawBody we captured in the middleware
    const isValid = validateWebhookSignature(req.rawBody, signature, webhookSecret)

    if (!isValid) {
      console.error('Signature mismatch! Check if the Webhook Secret is correct.')
      return res.status(400).send('Invalid signature')
    }

    // 3. Signature is valid - Extract Event
    const { event, payload } = req.body
    const paymentEntity = payload.payment.entity
    const orderId = paymentEntity.order_id

    // We mainly care about 'payment.captured' or 'order.paid'
    // --- CASE 1: SUCCESS ---
    console.log('event__', event)
    if (event === 'payment.captured' || event === 'order.paid') {
      // 4. Idempotency Check: Find the order in our DB
      const order = await this.orderRepository.findOne({ razorpayOrderId: orderId })

      if (!order) {
        console.error('Order not found in DB for Webhook:', orderId)
        return res.status(200).json({ status: 'ok' }) // Still return 200 to stop retries
      }
      console.log('orde__r', order)
      if (order.status !== 'succeeded') {
        // 5. Atomic Update: Order and User
        order.status = 'succeeded'
        order.razorpayPaymentId = paymentEntity.id
        await this.orderRepository.save()

        // Update User Premium Status
        await this.userRepository.updateById(order.userId, {
          isPremium: true,
          membershipType: order.notes.plan_name,
        })

        console.log(`[SUCCESS] Webhook processed for Order: ${orderId}`)
      }
    }
    //     // --- CASE 2: FAILURE (New Logic) ---
    else if (event === 'payment.failed') {
      const order = await this.orderRepository.findOne({ razorpayOrderId: orderId })

      if (order) {
        order.status = 'failed'
        await this.orderRepository.save(order)

        // LOGGING THE REASON
        const errorCode = paymentEntity.error_code
        const errorDesc = paymentEntity.error_description
        const errorSource = paymentEntity.error_source // e.g., 'bank' or 'customer'

        console.error(
          `[FAILURE] Order ${orderId} failed. Reason: ${errorDesc} (Code: ${errorCode})`,
        )

        // SENIOR DEV TIP: Trigger a "Recovery Email" here
        const emailUser = await this.userRepository.findById(order.userId)
        if (emailUser) {
          console.log(`Sending failure email to ${emailUser.email} for Order ${orderId}`)
          await sendFailureEmailTemplated(emailUser, errorDesc, orderId)
        } else {
          console.error(`User not found for Order ${orderId}, cannot send failure email.`)
        }

        // Alternative: If you want to use the non-templated email function
        // await this.sendFailureEmail(order.userId, errorDesc)

        // Optionally, you could also trigger a retry mechanism here
        // For example, you could create a "Retry Payment" link in the email that directs the user back to the payment page with pre-filled details.
        // This would require additional logic to generate a new Razorpay order and link it to the existing one.
      } else {
        console.error('Order not found in DB for failed payment Webhook:', orderId)
      }
    }
    // 6. Mandatory: Razorpay needs 200 OK within a few seconds
    res.sendStatus(200)
  }
}
module.exports = OrderService
