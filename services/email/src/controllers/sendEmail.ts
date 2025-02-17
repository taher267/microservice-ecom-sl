import { Request, Response, NextFunction } from "express";
import { EmailCreateDTOSchema } from "@/schemas";
import prisma from "@/prisma";
import { defaultSender, transport } from "@/config";

const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body: reqBody, headers, ip } = req;

    // Validate request body
    const { success, error, data } = EmailCreateDTOSchema.safeParse(reqBody);
    if (!success) {
      res.status(400).json({
        error: error.errors,
        message: "Invalid request body!",
      });
      return;
    }

    // Create mail Options
    const { sender, body, recipient, subject, source } = data;
    const from = sender || defaultSender;
    const emailOption = {
      from,
      to: recipient,
      text: body,
      subject,
    };
    const { rejected } = await transport.sendMail(emailOption);
    if (rejected.length) {
      console.log(`Email rejected`, rejected);
      res.status(500).json({
        code: 500,
        message: "Email sending Failed",
      });
      return;
    }

    await prisma.email.create({
      data: {
        body,
        recipient,
        sender: from,
        source,
        subject,
      },
    });
    res.status(200).json({ code: 200 });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

export default sendEmail;
