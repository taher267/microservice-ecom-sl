import { Request, Response, NextFunction } from "express";
import { AuthLoginDTOSchema } from "@/schemas";
import prisma from "@/prisma";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "@/config";
import { AccountStatus, LoginAttempt } from "@prisma/client";
import jwt from "jsonwebtoken";

interface LoginHistory {
  authId: string;
  userAgent: string | undefined;
  ipAddress: string | undefined;
  attempt: LoginAttempt;
}

const createLoginHistory = async ({
  authId,
  userAgent,
  ipAddress,
  attempt,
}: LoginHistory) => {
  await prisma.loginHistory.create({
    data: {
      userAgent,
      ipAddress,
      attempt,
      authId,
    },
  });
};

const authRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body, headers, ip } = req;

    const ipAddress = (headers["x-forwarded-for"] || ip || "") as string;
    const userAgent = headers["user-agent"] || "";

    // Validate request body
    const { success, error, data } = AuthLoginDTOSchema.safeParse(body);
    if (!success) {
      res.status(400).json({
        error: error.errors,
        message: "Invalid request body!",
      });
      return;
    }

    // Check if user exists by the email
    const auth = await prisma.auth.findFirst({
      where: { email: data.email },
    });

    if (!auth) {
      res.status(400).json({
        message: "Invalid credentials!",
        code: 400,
      });
      return;
    }
    const authId = auth.id;
    // compare password
    const isMatch = await bcrypt.compare(data.password, auth.password);
    if (!isMatch) {
      await createLoginHistory({
        authId,
        ipAddress,
        userAgent,
        attempt: LoginAttempt.FAILED,
      });
      res.status(400).json({
        code: 400,
        message: "Invalid credentials!",
      });
      return;
    }

    // if check the auth user is verified
    if (!auth.verified) {
      await createLoginHistory({
        authId,
        ipAddress,
        userAgent,
        attempt: LoginAttempt.FAILED,
      });
      res.status(400).json({
        code: 400,
        message: "User not verified!",
      });
      return;
    }

    // if check the account is active
    if (auth.status !== AccountStatus.ACTIVE) {
      await createLoginHistory({
        authId,
        ipAddress,
        userAgent,
        attempt: LoginAttempt.FAILED,
      });
      res.status(400).json({
        code: 400,
        message: `Your account is ${auth.status.toLocaleLowerCase()}`,
      });
      return;
    }

    // generate access token
    const accessToken = jwt.sign(
      {
        authId,
        name: auth.name,
        email: auth.email,
        role: auth.role,
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    await createLoginHistory({
      authId,
      ipAddress,
      userAgent,
      attempt: LoginAttempt.SUCCESS,
    });

    res.status(200).json({ code: 200, accessToken });
  } catch (e) {
    next(e);
  }
};

export default authRegistration;
