import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { GET_WAY_URL } from "./configaration";
const auth = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.headers.authorization);
  try {
    if (!req.headers?.authorization) {
      res.status(401).json({ message: "Unauthorized", code: 401 });
      return;
    }
    const token = req.headers.authorization.split(" ")[1];
    // console.log(token);

    if (!token || token === "undefined") {
      res.status(401).json({ message: "Unauthorized", code: 401 });
      return;
    }
    const url = `${GET_WAY_URL}/api/auth/verify-access-token`;
    // const url = `${AUTH_SERVICE}/auth/verify-access-token`;
    const {
      data: { user },
    } = await axios.post(url, {
      accessToken: token,
      headers: {
        ip: req.headers["x-forwarded-for"],
        "user-agent": req.headers["user-agent"],
      },
    });
    req.headers["x-user-id"] = user.id;
    next();
  } catch (e) {
    console.log("auth middleware", e);
    // next(e);
    res.status(401).json({ message: "Unauthorized", code: 401 });
    return;
  }
};

const middlewares = { auth };
export default middlewares;
