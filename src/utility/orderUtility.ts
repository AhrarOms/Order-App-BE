// orderUtility.ts

import nodemailer from "nodemailer";
import cron from "node-cron";

import { sendMail } from "../services/MailService";
import { RequestTicket } from "../models/Request"; // Replace with your actual model

export const updateOrderStatus = async (
  orderId: string,
  newStatus: string
): Promise<void> => {
  // Assuming an asynchronous database update operation
  await RequestTicket.findByIdAndUpdate(orderId, { status: newStatus });
};

export const checkAndNotify = async (): Promise<void> => {
  try {
    // Fetch pending orders from the database
    console.log("Checking for pending orders...");
    const pendingOrders = await RequestTicket.find({
      status: "pending",
    }).populate("requester");

    for (const order of pendingOrders) {
      const emailDetails = {
        email: order?.requester.email,
        subject: "Request Ticket Status has not been updated for 24 hours!",
        requester: `${order?.requester.firstName} ${order?.requester.lastName}`,
        date: new Date().toLocaleString(),
        productName: order?.productName,
        reqId: order?.reqId,
      };
      const currentTime = new Date();
      const timeDiff = currentTime.getTime() - order.createdAt.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff >= 24) {
        // Send email notification
        try {
          console.log("Sending email notification...");
          await sendMail(emailDetails, "cron"); // Assuming _id is the unique identifier for orders in your database
        } catch (err) {
          console.log(err);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};

export const startCronJob = (): void => {
  // Schedule cron job to run every hour
  cron.schedule("0 * * * *", () => {
    checkAndNotify();
  });
};
