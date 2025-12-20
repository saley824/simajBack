import {
    string,
    object,
    number,
    boolean,
    date,
    ref,
    InferType,
    mixed,
    array,
} from "yup";

export const contactFormGuestSchema = object({
    body: object({
        email: string().email().max(50).required("validation.email.invalid"),
        device: string().max(100),
        orderNumber: string().max(100),
        question: string().required().max(400),



    }),
});

export type contactFormGuestSchemaCreateDto = InferType<
    typeof contactFormGuestSchema
>["body"];
