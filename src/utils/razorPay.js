const Razorpay = require('razorpay')

var RazorInstance = new Razorpay({
  key_id: process.env.RAZOR_KEY_ID,
  key_secret: process.env.RAZOR_KEY_SECRET,
});

module.exports={
    RazorInstance
}


// NEW IMPLEMENTATIONS
// const Razorpay = require('razorpay');
// const crypto = require('crypto');

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// const createOrder = async (amount, currency = 'INR') => {
//   const options = {
//     amount: amount * 100,  // Amount in paise
//     currency,
//     receipt: `order_${Date.now()}`
//   };
  
//   return await razorpay.orders.create(options);
// };

// const verifyPayment = (orderId, paymentId, signature) => {
//   const body = orderId + '|' + paymentId;
  
//   const expectedSignature = crypto
//     .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//     .update(body.toString())
//     .digest('hex');
  
//   return expectedSignature === signature;
// };

// module.exports = {
//   createOrder,
//   verifyPayment
// };