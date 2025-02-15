// import { Status } from "@prisma/client";
import { z } from "zod";
export const AuthRegistrationDTOSchema = z
  .object({
    name: z.string().min(3).max(255),
    email: z.string().email(),
    password: z.string().min(8).max(255),
  })
  .required();

export const AuthLoginDTOSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
  })
  .required();

export const accessTokenDTOSchema = z
  .object({
    accessToken: z.string(),
  })
  .required();
export const EmailVerificationDTOSchema = z.object({
  email: z.string().email(),
  code: z.string(),
});
