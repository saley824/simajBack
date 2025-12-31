
export type TransactionDto = {
    userId: string;
    createdAt: Date | null;
    duration: number;
    amount: number | null;
    name: string | null;
    countryId: number | null;
    regionId: number | null;
    iccid: string;
    productId: string;
}
