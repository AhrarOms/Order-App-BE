"use strict";
import nodemailer from "nodemailer";
import { emailTemplate } from "../utility/emailTemplate";
import { emailTemplateAdmin } from "../utility/emailTemplateAdmin";
import { emailTemplateCron } from "../utility/emailTemplateCron";

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
      return emailTemplateAdmin(emailDetails);
    } else {
      return emailTemplate(emailDetails);
    }
  };

  let info = await transporter.sendMail({
    from: "pererahemal594@gmail.com", // sender address
    to: emailDetails?.email, // list of receivers
    subject: emailDetails?.subject, // Subject line// plain text body
    html: htmlType(), // html body
  });

  console.log("Message sent: %s", info.messageId);

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
