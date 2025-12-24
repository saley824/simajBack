import { string, object, ref, InferType } from "yup";

export const resetPasswordSchema = object({
    body: object({
        token: string()
            .required("global_required"),
        password: string()
            .required("validation.password.required")
            .max(128, "validation.password.max")
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
                "validation.password.weak"
            ),

        confirmPassword: string()
            .required("validation.confirmPassword.required")
            .oneOf([ref("password")], "validation.confirmPassword.mismatch")
            .max(128, "validation.confirmPassword.max"),
    }),
});



export type resetPasswordSchema = InferType<typeof resetPasswordSchema>["body"];
