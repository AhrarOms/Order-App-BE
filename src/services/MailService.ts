"use strict";
import nodemailer from "nodemailer";
import { emailTemplate } from "../utility/emailTemplate";
import { emailTemplateAdmin } from "../utility/emailTemplateAdmin";
import { emailTemplateCron } from "../utility/emailTemplateCron";
import { Status } from "../utility/constants";

export async function sendMail(emailDetails: any, type: string) {
  console.log("Sending email...", emailDetails);
  //let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
      user: "pererahemal594@gmail.com", // generated ethereal user
      pass: "cykv vuhx eops ccyl", // generated ethereal password
    },
  });

  // let transporter = nodemailer.createTransport({
  //   host: "smtp.ethereal.email",
  //   port: 587,
  //   secure: false, // true for 465, false for other ports
  //   auth: {
  //     user: testAccount.user, // generated ethereal user
  //     pass: testAccount.pass, // generated ethereal password
  //   },
  // });

  const htmlType = () => {
    if (type === "cron") {
      return emailTemplateCron(emailDetails);
    } else if (type === "approveRejectRequest") {
      let description = "";
      if (emailDetails?.newStatus === Status.Approved) {
        description = `The order ID ${emailDetails?.reqId}. has been approved for purchase. `;
      }

      if (emailDetails?.newStatus === Status.Rejected) {
        description = `The order ID ${emailDetails?.reqId}. has been rejected`;
      }

      return emailTemplateAdmin(emailDetails, description);
    } else if (
      type === "changeRequestStatus" &&
      emailDetails?.newStatus === Status.Order_Placed
    ) {
      let description = `The request ${emailDetails?.reqId}, order was placed with the factory.`;

      return emailTemplate(emailDetails, description);
    } else if (
      type === "changeRequestStatus" &&
      emailDetails?.newStatus === Status.In_Production
    ) {
      let description = `The request ${emailDetails?.reqId}, the ordered product is currently in production.`;

      return emailTemplate(emailDetails, description);
    } else if (
      type === "changeRequestStatus" &&
      emailDetails?.newStatus === Status.In_Transit
    ) {
      let description = `The request ${emailDetails?.reqId} , the ordered product is currently in transit with an estimated time of arrival of ${emailDetails?.eta}(ETA)`;

      return emailTemplate(emailDetails, description);
    } else if (
      type === "changeRequestStatus" &&
      emailDetails?.newStatus === Status.Shipment_Arrived
    ) {
      let description = `The request ${emailDetails?.reqId} , ordered product shipment has arrived. Currently, it is in the process of clearance.`;

      return emailTemplate(emailDetails, description);
    } else if (
      type === "changeRequestStatus" &&
      emailDetails?.newStatus === Status.Goods_In_Warehouse
    ) {
      let description = `The request ${emailDetails?.reqId} , the ordered product shipment has arrived at the warehouse. Kindly proceed to invoice and arrange for delivery.`;

      return emailTemplate(emailDetails, description);
    }
  };

  let info = await transporter.sendMail({
    from: "pererahemal594@gmail.com", // sender address
    to: emailDetails?.email, // list of receivers
    subject: `Request ID ${emailDetails?.reqId}`, // Subject line// plain text body
    html: htmlType(), // html body
  });

  console.log("Message sent: %s", info.messageId);

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
