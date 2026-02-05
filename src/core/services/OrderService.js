const {
    validateWebhookSignature,
    validatePaymentVerification,
} = require("razorpay/dist/utils/razorpay-utils");

const { ERRORS } = require("../../utils/constants/Errors");
const { SUCCESS } = require("../../utils/constants/Success");
class OrderService {
    constructor(orderRepository, userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }


    async createOrder(orderData) {
        const user = await this.userRepository.findById(orderData.userId);
        if (!user) {
            throw new Error(ERRORS.USER_NOT_FOUND);
        }
        return await this.orderRepository.createOrder(orderData);
    }

    // async upgradeUserPlan(orderData) {
    //     const newOrder = await this.orderRepository.createOrder(orderData);
    //     return newOrder;
    // }
    async verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature, user }) {

        const secret = process.env.RAZOR_KEY_SECRET;

        // The SDK Helper Method
        const isValid = validatePaymentVerification(
            { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
            razorpay_signature,
            secret
        );

        if (!isValid) {
            throw new Error(ERRORS.INVALID_REQUEST);
        }
        // 3. Update the Order in MongoDB
        // We use findOneAndUpdate to ensure we get the order linked to this specific user
        const updatedOrder = await this.orderRepository.updateOneByQuery(
            { razorpayOrderId: razorpay_order_id },
            {
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: "succeeded",
            },
            { new: true }   // return the updated order
        );
        if (!updatedOrder) {
            throw new Error(ERRORS.ORDER_NOT_FOUND);
        }
        user.isPremium = true;
        user.membershipType = updatedOrder.notes.plan_name;
        await this.userRepository.updateById(user._id, { isPremium: true, membershipType: updatedOrder.notes.plan_name });
        return {
            order: updatedOrder,
            user: user
        };
    }

    async updateOrder({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
        const order = await this.orderRepository.findOne({ razorpayOrderId: razorpay_order_id });
        if (!order) {
            throw new Error(ERRORS.ORDER_NOT_FOUND);
        }
        return await this.orderRepository.updateById(order._id, { razorpay_payment_id, razorpay_signature });
    }


}
module.exports = OrderService;