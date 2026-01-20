const express = require("express");
const { userAuth } = require("../middlewares/auth");
const {  getRazorInstance } = require("../utils/razorPay");
const { plans } = require("../utils/constants/Orger");
const { SUCCESS } = require("../utils/constants/Success");
const { ERRORS } = require("../utils/constants/Errors");
const OrderSchema = require("../model/Orders");
const {
  validateWebhookSignature,
  validatePaymentVerification,
} = require("razorpay/dist/utils/razorpay-utils");
const { User } = require("../model/userSchema"); // Import your User model
const upgradeRouter = express.Router();
const crypto = require("crypto");

// upgrade-plan
upgradeRouter.post("/upgrade-plan", userAuth, async (req, res) => {
  const { notes } = req.body;

  const PLAN_NAME = notes.plan_name;
  const PLAN_DETAILS = plans[PLAN_NAME];

  try {
    console.log("Plan ", PLAN_NAME);
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

    // USE THIS LINE TO CREATE ORDER

    // const rzpOrder = await RazorInstance.orders.create(options);
    const rzpOrder = await getRazorInstance().orders.create(options);
    console.log("rzpOrder", rzpOrder);
    const newOrder = await new OrderSchema({
      userId: req.user._id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount / 100,
      status: "created",

      notes: rzpOrder.notes,
    });

    await newOrder.save();

    res.status(201).send({
      // data: PLAN_DETAILS,
      order: rzpOrder,
      success: true,
    });
  } catch (error) {
    console.log("error", error);
    res.status(400).send({ message: error.message, success: false });
  }
});

// verify-payment
upgradeRouter.post("/verify-payment", userAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // 1. Generate the expected signature to compare with Razorpay's signature
    // Formula: SHA256(order_id + "|" + payment_id, key_secret)
    const secret = process.env.RAZOR_KEY_SECRET;

    // // 2. Compare signatures
    // const isSignatureValid = generated_signature === razorpay_signature;

    // The SDK Helper Method
    const isValid = validatePaymentVerification(
      { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
      razorpay_signature,
      secret
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Transaction verification failed. Invalid Signature.",
      });
    }

    // 3. Update the Order in MongoDB
    // We use findOneAndUpdate to ensure we get the order linked to this specific user
    const updatedOrder = await OrderSchema.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "succeeded",
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    console.log('updatedOrder',updatedOrder)
    const loggedInUser = req.user;
    loggedInUser.isPremium = true;
    // You can also add the plan name from the order
    loggedInUser.membershipType = updatedOrder.notes.plan_name;

    await loggedInUser.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified and Plan Upgraded successfully!",
    });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// WEBHOOK ROUTE
upgradeRouter.post("/razorpay-webhook", async (req, res) => {
  try {
    const webhookSecret = process.env.RAZOR_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    // DEBUGGING: Check if rawBody is captured
    console.log("Raw Body Captured:", !!req.rawBody);

    if (!signature || !webhookSecret || !req.rawBody) {
      console.error("Missing parameters for verification");
      return res.status(400).send("Missing parameters");
    }

    // Use the rawBody we captured in the middleware
    const isValid = validateWebhookSignature(
      req.rawBody,
      signature,
      webhookSecret
    );

    if (!isValid) {
      console.error(
        "Signature mismatch! Check if the Webhook Secret is correct."
      );
      return res.status(400).send("Invalid signature");
    } 

    // 3. Signature is valid - Extract Event
    const { event, payload } = req.body;
    const paymentEntity = payload.payment.entity;
    const orderId = paymentEntity.order_id;

    // We mainly care about 'payment.captured' or 'order.paid'
    // --- CASE 1: SUCCESS ---
    console.log("event__", event);
    if (event === "payment.captured" || event === "order.paid") {
      // 4. Idempotency Check: Find the order in our DB
      const order = await OrderSchema.findOne({ razorpayOrderId: orderId });

      if (!order) {
        console.error("Order not found in DB for Webhook:", orderId);
        return res.status(200).json({ status: "ok" }); // Still return 200 to stop retries
      }
      console.log("orde__r", order);
      if (order.status !== "succeeded") {
        // 5. Atomic Update: Order and User
        order.status = "succeeded";
        order.razorpayPaymentId = paymentEntity.id;
        await order.save();

        // Update User Premium Status
        await User.findByIdAndUpdate(order.userId, {
          isPremium: true,
          membershipType: order.notes.plan_name,
        });

        console.log(`[SUCCESS] Webhook processed for Order: ${orderId}`);
      }
    }

    // --- CASE 2: FAILURE (New Logic) ---
    else if (event === "payment.failed") {
      const order = await OrderSchema.findOne({ razorpayOrderId: orderId });

      if (order) {
        order.status = "failed";
        await order.save();

        // LOGGING THE REASON
        const errorCode = paymentEntity.error_code;
        const errorDesc = paymentEntity.error_description;
        const errorSource = paymentEntity.error_source; // e.g., 'bank' or 'customer'

        console.error(
          `[FAILURE] Order ${orderId} failed. Reason: ${errorDesc} (Code: ${errorCode})`
        );

        // SENIOR DEV TIP: Trigger a "Recovery Email" here
        // sendFailureEmail(order.userId, errorDesc);
      }
    }
    // 6. Mandatory: Razorpay needs 200 OK within a few seconds
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.status(500).send("Internal Server Error");
  }
});
// NOTE: Ensure this route is NOT affected by global body-parsers that change the raw body

module.exports = upgradeRouter;
