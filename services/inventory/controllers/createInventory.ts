import { Request, Response, NextFunction } from "express";
import { InvertoryCreateDTPSchema } from "..";

const createInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedBody = InvertoryCreateDTPSchema;
  } catch (e) {
    next(e);
  }
};
