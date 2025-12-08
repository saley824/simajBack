import { Currency } from "@prisma/client";

function parseCurrency(value?: string): Currency {
    if (!value) return Currency.BAM; // default

    switch (value.toUpperCase()) {
        case "EUR":
            return Currency.EUR;
        case "USD":
            return Currency.USD;
        case "BAM":
            return Currency.BAM;
        default:
            return Currency.BAM;
    }
}


export default {
    parseCurrency
};