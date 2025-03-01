import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { InventoryUpdateDTOSchema } from "@/schemas";

const updateInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const inventory = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!inventory) {
      res.status(404).json({ message: "Inventory not found!" });
      return;
    }
    // update The inventory
    const { success, error, data } = InventoryUpdateDTOSchema.safeParse(
      req.body
    );
    if (!success) {
      res.status(400).json({
        error: error.errors,
      });
      return;
    }
    // find the last History
    const lastHistory = await prisma.inventoryHistory.findFirst({
      where: { inventoryId: id },
      orderBy: { createdAt: "desc" },
    });
    let newQuantity = inventory.quantity;
    if (data.actionType == "IN") {
      newQuantity += data.quantity;
    } else if (data.actionType === "OUT") {
      newQuantity -= data.quantity;
    }
    //Update the inventory

    const updatedInventory = await prisma.inventory.update({
      where: { id },
      data: {
        quantity: newQuantity,
        inventoryHistories: {
          create: {
            actionType: data.actionType,
            quantityChanged: data.quantity,
            lastQuantity: lastHistory?.newQuantity || 0,
            newQuantity,
          },
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });
    res.status(200).json(updatedInventory);
    return;
  } catch (e) {
    next(e); // Pass errors to Express error handler
  }
};

export default updateInventory;
