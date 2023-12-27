"use strict";
import nodemailer from "nodemailer";
import { emailTemplate } from "../utility/emailTemplate";

export async function sendMail(email: string, id: string) {
  //let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
      user: "pererahemal594@gmail.com", // generated ethereal user
      pass: "pshmmqeaubuektci", // generated ethereal password
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

  let info = await transporter.sendMail({
    from: "pererahemal594@gmail.com", // sender address
    to: email, // list of receivers
    subject: "Registration", // Subject line// plain text body
    html: emailTemplate(id), // html body
  });

  console.log("Message sent: %s", info.messageId);

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
