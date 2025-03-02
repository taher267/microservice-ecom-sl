import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";

const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Create order
    const order = await prisma.order.findUnique({
      where: {
        id: req.params.id,
      },
      include: { orderItems: true },
    });
    if (!order) {
      res.status(404).json({ code: 404, message: "Order not found." });
      return;
    }

    res.status(200).json({ code: 200, data: order });
  } catch (e) {
    next(e);
  }
};

export default getOrderById;
