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
        name: string().max(20).required(),
        lastName: string().max(20).required(),
        email: string().email().max(50).required("validation.email.invalid"),
        phoneModel: string().max(100),
        typeOfPackage: string().max(100),
        question: string().required().max(400),



    }),
});

export type contactFormGuestSchemaCreateDto = InferType<
    typeof contactFormGuestSchema
>["body"];
