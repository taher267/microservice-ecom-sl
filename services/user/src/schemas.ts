// import { Status } from "@prisma/client";
import { z } from "zod";
export const UserCreateDTOSchema = z.object({
  authUserId: z.string(),
  name: z.string().min(3).max(255),
  email: z.string().email(),
  address: z.string().max(255).optional(),
  phone: z.string().optional(),
});

export const UserUpdateDTOSchema = UserCreateDTOSchema.omit({
  authUserId: true,
})
  .partial()
  .required()
  .refine((data) => data.name || data.email || data.address || data.phone, {
    message: "At least one of name, email, address, or phone is required",
    path: ["name", "email", "address", "phone"],
  });

// export const UserUpdateDTOSchema = z
//   .object({
//     name: z.string().min(3).max(255).optional(),
//     email: z.string().email().optional(),
//     address: z.string().max(255).optional(),
//     phone: z.string().optional(),
//   })
//   .required()
//   .refine((data) => data.name || data.email || data.address || data.phone, {
//     message: "At least one of name, email, address, or phone is required",
//     path: ["name", "email", "address", "phone"],
//   });

// !data.name &&! data.email &&! data.address &&! data.phone
