import { Request, Response, NextFunction } from "express";
import { UserCreateDTOSchema } from "@/schemas";
import prisma from "@/prisma";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const { success, error, data } = UserCreateDTOSchema.safeParse(req.body);
    console.log(error?.errors);
    if (!success) {
      res.status(400).json({
        error: error.errors,
        message: "Invalid request body!",
      });
      return;
    }
    // Check if the authUserId already exists

    const existingUser = await prisma.user.findFirst({
      where: { authUserId: data.authUserId },
    });
    if (existingUser) {
      res.status(400).json({
        message: "User already exists",
      });
      return;
    }
    // Create User
    const user = await prisma.user.create({
      data,
    });
    // const userId = user.id;
    // console.log(`Alhamdu lillah, user created Successfully`, userId);

    res.status(201).json({ code: 201, ...user });
  } catch (e) {
    next(e);
  }
};

export default createUser;
