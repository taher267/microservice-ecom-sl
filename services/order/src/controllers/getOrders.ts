import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";

const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      // where: {
      //   userId: req.params.id,
      // },
      // include: { orderItems: true },
    });

    res.status(200).json({ code: 200, data: orders });
  } catch (e) {
    next(e);
  }
};

export default getOrders;
