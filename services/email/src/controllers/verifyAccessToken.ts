import { Request, Response, NextFunction } from "express";
import { accessTokenDTOSchema } from "@/schemas";
import prisma from "@/prisma";
import bcrypt from "bcrypt";
import axios from "axios";
import { JWT_SECRET, USER_SERVICE } from "@/config";
import jwt from "jsonwebtoken";

const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request body
    const { success, error, data } = accessTokenDTOSchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        error: error.errors,
        message: "Invalid request body!",
      });
      return;
    }

    // Check if the email already exists
    const decoded = jwt.verify(data.accessToken, JWT_SECRET);
    const auth = await prisma.auth.findUnique({
      where: { id: (decoded as any).authId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    if (!auth) {
      res.status(401).json({
        code: 401,
        message: "Unauthorized",
      });
      return;
    }
    res.status(200).json({ code: 200, message: "Authorized", ...auth });
  } catch (e) {
    next(e);
  }
};

export default verifyAccessToken;
