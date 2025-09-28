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

export const reviewSchemaCreate = object({
    body: object({
        userId: string().required(),
        comment: string(),
        rating: number().required().min(1).max(5),
    }),
});

export type reviewSchemaCreateDto = InferType<
    typeof reviewSchemaCreate
>["body"];
