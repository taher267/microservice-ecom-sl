import { Request, Response, NextFunction } from "express";

const createInventory2 = async (
  req: Request<{}, {}, any>, // Empty params and query, body can be `any`
  res: Response<any>, // Response body type can be `any`
  next: NextFunction
) => {
  try {
    res.status(201).json({});
  } catch (e) {
    next(e);
  }
};

export default createInventory2;
