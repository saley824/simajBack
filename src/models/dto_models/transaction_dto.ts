
export type TransactionDto = {
    userId: string;
    createdAt: Date | null;
    duration: number;
    amount: number | null;
    countryName: string;
    iccid: string;
}
