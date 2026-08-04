import { z } from "zod";

// Mirrors the /auth/change-password contract: old_password, new_password,
// new_password_confirmation (per the client's Postman example — the request-body
// table they sent named these current_password/password/password_confirmation
// instead, which doesn't match the worked example; going with the example since
// it's the one marked as the literal request that was actually sent and answered).
export function changePasswordSchema(messages: {
  required: string;
  minLength: string;
  mismatch: string;
}) {
  return z
    .object({
      oldPassword: z.string().min(1, messages.required),
      newPassword: z.string().min(8, messages.minLength),
      newPasswordConfirmation: z.string().min(1, messages.required)
    })
    .refine((data) => data.newPassword === data.newPasswordConfirmation, {
      message: messages.mismatch,
      path: ["newPasswordConfirmation"]
    });
}

export type ChangePasswordInput = z.infer<ReturnType<typeof changePasswordSchema>>;
