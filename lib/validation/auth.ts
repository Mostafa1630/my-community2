import { z } from "zod";

export function loginSchema(messages: { required: string; invalidEmail: string }) {
  return z.object({
    email: z.string().min(1, messages.required).email(messages.invalidEmail),
    password: z.string().min(1, messages.required)
  });
}

export function forgotPasswordSchema(messages: { required: string; invalidEmail: string }) {
  return z.object({
    email: z.string().min(1, messages.required).email(messages.invalidEmail)
  });
}

export function resetPasswordSchema(messages: {
  required: string;
  minLength: string;
  mismatch: string;
}) {
  return z
    .object({
      password: z.string().min(8, messages.minLength),
      passwordConfirmation: z.string().min(1, messages.required)
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: messages.mismatch,
      path: ["passwordConfirmation"]
    });
}

export function registerSchema(messages: {
  required: string;
  invalidEmail: string;
  minLength: string;
  mismatch: string;
}) {
  return z
    .object({
      name: z.string().min(1, messages.required),
      email: z.string().min(1, messages.required).email(messages.invalidEmail),
      password: z.string().min(8, messages.minLength),
      passwordConfirmation: z.string().min(1, messages.required),
      type: z.enum(["student", "creator"])
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: messages.mismatch,
      path: ["passwordConfirmation"]
    });
}
