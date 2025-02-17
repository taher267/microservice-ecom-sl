import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { EmailVerificationDTOSchema } from "@/schemas";
import axios from "axios";
import { EMAIL_SERVICE } from "@/config";

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = req;
    // Validate request body
    const { success, error, data } = EmailVerificationDTOSchema.safeParse(body);
    if (!success) {
      res.status(400).json({
        error: error.errors,
        message: "Invalid request body!",
      });
      return;
    }
    // Check if the user with email exists
    const auth = await prisma.auth.findUnique({
      where: {
        email: data.email,
      },
    });
    if (!auth) {
      res.status(404).json({
        message: "Email not found",
      });
      return;
    }
    // find the verification code
    const verificationCode = await prisma.verificationCode.findFirst({
      where: { code: data.code, authId: auth.id },
    });
    // console.log(verificationCode);
    if (!verificationCode) {
      res.status(400).json({
        message: "Invalid verification code.",
      });
      return;
    }
    const { status, expiresAt } = verificationCode;
    // if the code has expired
    if (status !== "PENDING") {
      res.status(400).json({
        message: `Verification code is ${status.toLocaleLowerCase()}.`,
      });
      return;
    }
    // if the code has expired
    if (expiresAt < new Date()) {
      res.status(400).json({
        message: "Verification code expired.",
      });
      return;
    }
    // update user status to verified
    await prisma.auth.update({
      where: { id: auth.id },
      data: {
        status: "ACTIVE",
        verified: true,
      },
    });

    // update verification code status
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: {
        verifiedAt: new Date(),
        status: "USED",
      },
    });

    // send success email
    await axios.post(`${EMAIL_SERVICE}/emails/send`, {
      recipient: auth.email,
      subject: `Email verified.`,
      body: `Your email has been verified successfully.`,
      source: `verify-email`,
    });
    res
      .status(200)
      .json({ code: 200, message: "Email verified successfully." });
  } catch (e) {
    next(e);
  }
};

export default verifyEmail;
