const nodemailer = require("nodemailer");
const { nodemailerConfig } = require("../config");

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport(nodemailerConfig);

  return transporter.sendMail(
    {
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      html,
    },
    (error, info) => {
      console.log(error);
    },
  );
};

module.exports = sendEmail;
