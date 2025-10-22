import { z } from "zod";

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name must be at most 50 characters long." })
    .trim(),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "Be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character.",
    })
    .trim(),
  role: z.enum(["customer", "capster", "owner"]).default("customer"),
});

export type SignupFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        role?: string[];
      };
      message?: string;
    }
  | undefined;

export const SigninFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z.string().min(3, { message: "Password is required." }).trim(),
});


export const BarbershopFormSchema = z.object({
    id: z.string().optional(),
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long." })
      .max(100, { message: "Name must be at most 100 characters long." })
      .trim(),
    address: z
      .string()
      .min(5, { message: "Address must be at least 5 characters long." })
      .max(200, { message: "Address must be at most 200 characters long." })
      .trim(),
    phoneNumber: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits long." })
      .max(15, { message: "Phone number must be at most 15 digits long." })
      .trim(),
    subscriptionPlan: z
      .enum(["basic", "premium", "enterprise"])
      .default("basic"),
  });

export type BarbershopFormState =
  | {
      errors?: {
        id?: string[];
        name?: string[];
        address?: string[];
        phoneNumber?: string[];
        subscriptionPlan?: string[];
      };
      message?: string;
    }
  | undefined;