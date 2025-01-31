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
    const { success, error, data } = InventoryCreateDTOSchema.safeParse(
      req.body
    );
    if (!success) {
      res.status(400).json({
        error: error.errors,
      });
      return;
    }
    // Create Inventory
    const inventory = await prisma.inventory.create({
      data: {
        ...data,
        inventoryHistories: {
          create: {
            actionType: "IN",
            quantityChanged: data.quantity,
            newQuantity: data.quantity,
            lastQuantity: 0,
          },
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });
    res.status(201).json(inventory);
  } catch (e) {
    next(e);
  }
};

export default createInventory;
