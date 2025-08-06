import {
    string,
    object,
    ref,
    InferType,

} from "yup";

export const userSchemaCreate = object({
    body: object({
        name: string().required().max(20, "Ime ne može biti duže od 20 karaktera!"),
        lastName: string().required().max(20, "Prezime ne može biti duže od 20 karaktera!"),
        username: string().required().min(4, "Korisničko ime mora imati makar 4 karaktera!").max(20, "Korisničko ime ne može biti duže od 20 karaktera!"),
        email: string().email().required("Email mora biti validan!"),
        password: string().required().min(8, "Šifra mora imati makar 8 karaktera!").max(128, "Šifra ne može biti duža od 128 karaktera!"),
        confirmPassword: string().max(128, "Šifra ne može biti duža od 128 karaktera!").oneOf([ref('password')], 'Šifre se ne poklapaju!').required(),
    }),
});

export const loginSchema = object({
    body: object({
        username: string().required().min(4, "Korisničko ime mora imati makar 4 karaktera!").max(20, "Korisničko ime ne može biti duže od 20 karaktera!"),
        password: string().required().min(8, "Šifra mora imati makar 8 karaktera!").max(128, "Šifra ne može biti duža od 128 karaktera!"),
    }),
});


export type userSchemaCreateDto = InferType<typeof userSchemaCreate>["body"];

