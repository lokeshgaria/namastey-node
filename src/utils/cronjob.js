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