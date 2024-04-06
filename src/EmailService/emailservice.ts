import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmailBodyService } from "./emailBodyService";
const SendGrid = require("@sendgrid/mail");
import * as nodemailer from 'nodemailer';
@Injectable()
export class SendgridService {
  constructor(
    private readonly configService: ConfigService,
    private readonly emailBody: EmailBodyService
  ) {
    SendGrid.setApiKey(this.configService.get<string>("SEND_GRID_KEY"));
  }

  async sendEAccountVerificationEmail(to: string, verificationUrl: string): Promise<void> {
    const transporter = nodemailer.createTransport({

      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_ACCOUNT,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    let body = this.emailBody.verifyemail(to, verificationUrl);
    const mailOptions = {
      from: process.env.GMAIL_ACCOUNT,
      to,
      subject: 'Email Verification',
      html: body,
    };

    await transporter.sendMail(mailOptions);
  }

  async sendVerifyEmail(email: string, url: string) {
    let body = this.emailBody.verifyemail(email, url);
    var mgs = {
      from: "ibrargill1998@gmail.com",
      to: email, // Change to your recipient
      subject: "Email Verification",
      html: body,
    };
    const transport = await SendGrid.send(mgs);
    console.log(`Email successfully dispatched to ${email}`);
    return transport;
  }

  async sendPasswordRecoveryCode(email: string, url: string) {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_ACCOUNT,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    let body = this.emailBody.forgetPasswordEmailBody(email, url);
    const mailOptions = {
      from: process.env.GMAIL_ACCOUNT,
      to: email,
      subject: 'Reset Password Email',
      html: body,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email successfully dispatched to ${email}`);
  }

  async sendPasswordRecoveryCodeForUpbraineryApp(email: string, code: number) {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_ACCOUNT,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    let body = this.emailBody.forgetPasswordEmailBodywithverficationcode(email, code);
    const mailOptions = {
      from: process.env.GMAIL_ACCOUNT,
      to: email,
      subject: 'Reset Password Email',
      html: body,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email successfully dispatched to ${email}`);
  }

  async sendEmailWithBody(email: string, body: string) {
    var mgs = {
      from: "ibrargill1998@gmail.com",
      to: email, // Change to your recipient
      subject: "Welcome to 2Rare",
      text: "and easy to do anywhere, even with Node.js",
      html: body,
    };
  }
  async sendPassword(email: string, password: string) {
    let body = this.emailBody.sendPassword(email, password);
    var mgs = {
      from: "ibrargill1998@gmail.com",
      to: email, // Change to your recipient
      subject: "Welcome to Upbrainary",
      text: "and easy to do anywhere, even with Node.js",
      html: body,
    };
    const transport = await SendGrid.send(mgs);

    console.log(`Email successfully dispatched to ${email}`);
    return transport;
  }
  //===================share link with email
  async sharesessionlinkwithmail(mails: string[], avator: string, user_name: string, link: string): Promise<void> {
    for (const mail of mails) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_ACCOUNT,
          pass: process.env.GMAIL_PASSWORD,
        },
      });
      let body = this.emailBody.sessionjoiningrequestmail(avator, user_name, link)
      const mailOptions = {
        from: process.env.GMAIL_ACCOUNT,
        to: mail,
        subject: 'Upbrainery Shareable Session Link Email',
        html: body,
      };
      await transporter.sendMail(mailOptions);
    }

  }
}
