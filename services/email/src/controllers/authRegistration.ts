import { Request, Response, NextFunction } from "express";
import { AuthRegistrationDTOSchema } from "@/schemas";
import prisma from "@/prisma";
import bcrypt from "bcrypt";
import axios from "axios";
import { USER_SERVICE } from "@/config";

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

    // TODO Generate verification code
    // TODO email sending

    res.status(201).json({ code: 201, ...auth });
  } catch (e) {
    next(e);
  }
};

export default authRegistration;
