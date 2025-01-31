import { Express, Request, Response } from "express";
import { services } from "@/config.json";
import axios from "axios";

export const createHandler = ({
  hostname,
  path,
  method,
}: {
  hostname: string;
  path: string;
  method: string;
}) => {
  return async (req: Request, res: Response) => {
    try {
      let url = `${hostname}${path}`;
      req.params &&
        Object.keys(req.params).forEach((param) => {
          url = url.replace(`:${param}`, req.params[param]);
        });
      console.log({ url });
      const { data } = await axios({
        method,
        url,
        data: req.body,
        headers: { origin: process.env.GET_WAY_URL },
      });
      res.json(data);
    } catch (e) {
      if (e instanceof axios.AxiosError) {
        const code = e.response?.status || 500;
        return res.status(code).json({
          ...e.response?.data,
          code,
        });
      }
      console.log(e);
      return res
        .status(500)
        .json({ code: 500, message: "Internal Server Error." });
    }
  };
};

export const configureRoutes = (app: Express) => {
  for (const key in services) {
    const service = services[key];
    const hostname = service.url;
    service.routes.forEach(({ methods, path }) => {
      methods.forEach((method) => {
        const handler = createHandler({
          hostname,
          path,
          method,
        });

        app[method](`/api${path}`, handler);
      });
    });
  }
};
