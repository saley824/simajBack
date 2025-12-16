import { string, object, ref, InferType } from "yup";

export const userSchemaCreate = object({
    body: object({
        username: string()
            .required("validation.username.required")
            .min(4, "validation.username.min")
            .max(80, "validation.username.max"),

        email: string()
            .email("validation.email.invalid")
            .required("validation.email.required"),

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

export const loginSchema = object({
    body: object({
        usernameEmail: string()
            .required("validation.usernameEmail.required")
            .min(4, "validation.usernameEmail.min")
            .max(80, "validation.usernameEmail.max"),

        password: string()
            .required("validation.password.required")
            .min(8, "validation.password.min")
            .max(128, "validation.password.max"),
    }),
});

export type userSchemaCreateDto = InferType<typeof userSchemaCreate>["body"];
