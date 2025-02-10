import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";

// uesrs/:id?field=id|authUserId
const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const field = req.query.field as string;
    const qry: { id?: string; authUserId?: string } = {};
    if (field === "authUserId") {
      qry.authUserId = id;
    } else {
      qry.id = id;
    }
    // Retrive user
    const user = await prisma.user.findFirst({
      where: qry,
    });
    if (!user) {
      res.status(404).json({
        messae: `User not found`,
        code: 404,
      });
      return;
    }
    res.status(200).json({
      code: 200,
      ...user,
    });
    return;
  } catch (e) {
    next(e);
  }
};

export default getUserById;
