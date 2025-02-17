import { Request, Response, NextFunction } from "express";
import { AuthRegistrationDTOSchema } from "@/schemas";
import prisma from "@/prisma";
import bcrypt from "bcrypt";
import axios from "axios";
import { EMAIL_SERVICE, USER_SERVICE } from "@/config";

const generateVerificationCode = () => {
  // Get current timestamp in milliseconds
  const timestamp = new Date().getTime().toString();

  // Generate a random 2-digit number
  const randomNuber = Math.floor(10 + Math.random() * 90);

  // Cobine timestamp and random bumber and extract last 5 degits
  let code = (timestamp + randomNuber).slice(-5);
  return code;
};

const authRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request body
    const { success, error, data } = AuthRegistrationDTOSchema.safeParse(
      req.body
    );

    if (!success) {
      res.status(400).json({
        error: error.errors,
        message: "Invalid request body!",
      });
      return;
    }
    // Check if the email already exists
    const existingAuth = await prisma.auth.findFirst({
      where: { email: data.email },
    });

    if (existingAuth) {
      res.status(400).json({
        message: "User already exists",
      });
      return;
    }
    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Create the auth user
    const auth = await prisma.auth.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        verified: true,
      },
    });
    console.log(`Alhamdu lillah, Auth created`, auth);
    // create the user profile by calling the user service

    await axios.post(`${USER_SERVICE}/users`, {
      authUserId: auth.id,
      name: auth.name,
      email: auth.email,
    });

    // Generate verification code
    const code = generateVerificationCode();
    await prisma.verificationCode.create({
      data: {
        authId: auth.id,
        code,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), //24 hrs
      },
    });
    //  email sending
    await axios.post(`${EMAIL_SERVICE}/emails/send`, {
      recipient: auth.email,
      subject: `Email verification`,
      body: `Your verification code is ${code}`,
      source: `user-registration`,
    });
    res.status(201).json({
      code: 201,
      auth,
      message: `User created. Check you email for verification code`,
    });
  } catch (e) {
    next(e);
  }
};

export default authRegistration;
