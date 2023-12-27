const express = require("express");
const { App } = require("./services/ExpressApp");

const { dbConnection } = require("./services/Database");
const { startCronJob } = require("./utility/orderUtility");

const StartServer = async () => {
  const app = express();

  await dbConnection();

  await App(app);
  // Start the cron job using the utility function
  startCronJob();

  app.listen(process.env.PORT, () => {
    console.log(`Listening to port  ${process.env.PORT}`);
  });
};

StartServer();
