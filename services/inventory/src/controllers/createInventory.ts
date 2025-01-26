import { Request, Response, NextFunction } from "express";
import { InventoryCreateDTOSchema } from "@/schemas";
import prisma from "@/prisma";

const createInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request body
    const parsedBody = InventoryCreateDTOSchema.safeParse(req.body);
    const { success, error, data } = parsedBody;
    if (!parsedBody.success) {
      res.status(400).json({
        error: parsedBody.error.errors,
      });
    }
    // Create Inventory
    const inventory = await prisma.inventory.create({
      data: {
        ...parsedBody.data,
        // InventoryHistories: {
        //   create: {
        //     actionType: "IN",
        //     quantityChanged: 1,
        //     newQuantity: 1,
        //     lastQuantity: 0,
        //   },
        // },
      },
    });
  } catch (e) {
    next(e);
  }
};
