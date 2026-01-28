const cron = require("node-cron");
const {subDays} = require("date-fns")
const connectionRequestModel = require("../model/connectionRequest");
const { startOfDay, endOfDay } = require("date-fns");
const { run } = require("./sendEmail");
// # ┌────────────── second (optional)
// # │ ┌──────────── minute
// # │ │ ┌────────── hour
// # │ │ │ ┌──────── day of month
// # │ │ │ │ ┌────── month
// # │ │ │ │ │ ┌──── day of week
// # │ │ │ │ │ │
// # │ │ │ │ │ │
// # * * * * * *

cron.schedule("* * * * * ", async () => {
  console.log("Cron job running" + " " + new Date().toDateString());
  // send email to al ppls who got requests prev day

  //yesterday date
  const yesterday = subDays(new Date(),0);

  // start and end of yesterday
 const yesterdayStart = startOfDay(yesterday);
 const yesterdayEnd = endOfDay(yesterday);

  try {
     const pendingRequests = await connectionRequestModel.find({
        status:"interested",
       createdAt:{
        $gte:yesterdayStart,
        $lte:yesterdayEnd
       }
    }).populate("fromUserId toUserId");

    // const listofUsers = new Set(pendingRequests.map((request)=>{
    //     return request.toUserId.email;
    // }));

    const listOfEmails = [
        ...new Set(pendingRequests.map((req) => req.toUserId.email))
    ]

    for(const email of listOfEmails){
        const subject = `You have new connection request from ${email} `;
        const message = "There are too many requests that are waiting for you , please login and give them some time.";
   //     const res = await run(subject,message);
        console.log(`Email sent to ${email}`);
    }

console.log("list of users",listOfEmails)
  } catch (error) {
    console.log('error',error.message)
  }
});

module.exports = { cron };  

// NEW CRON - JOBS //  CODE 

// const cron = require('node-cron');
// const ConnectionRequest = require('../model/connectionRequest');
// const User = require('../model/userSchema');
// const { sendEmail } = require('./sendEmail');

// // Run every day at 9 AM
// cron.schedule('0 9 * * *', async () => {
//   try {
//     console.log('Running daily notification cron...');
    
//     // Find all pending interested requests from today
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const pendingRequests = await ConnectionRequest.find({
//       status: 'interested',
//       createdAt: { $gte: today }
//     }).populate('toUserId', 'email firstName');
    
//     // Group by recipient
//     const emailMap = new Map();
//     pendingRequests.forEach(req => {
//       const email = req.toUserId.email;
//       if (!emailMap.has(email)) {
//         emailMap.set(email, {
//           name: req.toUserId.firstName,
//           count: 0
//         });
//       }
//       emailMap.get(email).count++;
//     });
    
//     // Send emails
//     for (const [email, data] of emailMap) {
//       await sendEmail({
//         to: email,
//         subject: 'New connection requests on DevTinder!',
//         body: `Hi ${data.name}, you have ${data.count} new connection request(s)!`
//       });
//     }
    
//     console.log(`✅ Sent notifications to ${emailMap.size} users`);
//   } catch (error) {
//     console.error('Cron job error:', error);
//   }
// });