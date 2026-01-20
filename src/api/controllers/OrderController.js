const { ERRORS } = require("../../utils/constants/Errors");
const { plans } = require("../../utils/constants/Orger");
const { getRazorInstance } = require("../../utils/razorPay");
class OrderController {
    constructor(orderService) {
        this.orderService = orderService;
    }
    createOrder = async (req, res, next) => {
        try {

            const { notes } = req.body;
            const PLAN_NAME = notes.plan_name;
            const PLAN_DETAILS = plans[PLAN_NAME];
            // console.log("Plan ", PLAN_NAME);
            if (!PLAN_DETAILS) {
                throw new Error(ERRORS.INVALID_REQUEST);
            }
            const user = req.user;
            var options = {
                amount: PLAN_DETAILS.price * 100, // Amount is in currency subunits.
                currency: "INR",
                receipt: `receipt_${Date.now()}`,
                notes: {
                    plan_name: PLAN_DETAILS.name,
                    user: { name: `${user.firstName} ${user.lastName}`, email: user.email },
                },
            };


            const rzpOrder = await getRazorInstance().orders.create(options);

            const orderData = {
                userId: req.user._id,
                razorpayOrderId: rzpOrder.id,
                amount: rzpOrder.amount / 100,
                status: "created",

                notes: rzpOrder.notes,
            }
            await this.orderService.createOrder(orderData);
            res.status(201).send({
                success: true,
                order: rzpOrder,

            });
        } catch (error) {
            next(error);
        }
    }

    verifyPayment = async (req, res, next) => {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

            const paymentVerifiedData = await this.orderService.verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature, user: req.user });

            res.status(200).json({
                success: true,
                message: "Payment verified and Plan Upgraded successfully!",
                data: paymentVerifiedData
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = OrderController;