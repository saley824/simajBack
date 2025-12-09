import { Currency, Product } from "@prisma/client";
import { prisma } from "../server";

async function formatProduct(p: Product, currency: Currency) {
    const exchangeRate = await prisma.exchangeRate.findFirst({
        where: { currency }
    });

    const hasDiscount = p.discountPercent !== null && p.discountPercent > 0;

    var sellingPriceBAM = p.sellingPrice!;
    var finalPriceBAM = hasDiscount
        ? Number((p.sellingPrice! - (p.sellingPrice! * p.discountPercent!) / 100).toFixed(2))
        : p.sellingPrice!;

    let sellingPrice = sellingPriceBAM;
    let finalPrice = finalPriceBAM;

    if (exchangeRate) {
        const rate = exchangeRate.rateFromBAM.toNumber();
        sellingPrice = Number((sellingPriceBAM * rate).toFixed(2));
        finalPrice = Number((finalPriceBAM * rate).toFixed(2));
    }

    return {
        ...p,
        sellingPrice,
        finalPrice,
        sellingPriceBAM,
        finalPriceBAM,
        hasDiscount
    };
}
function getFinalPrice(sellingPrice: number, discountPercent: number): number {
    return Number((sellingPrice - (sellingPrice * discountPercent) / 100).toFixed(2))

}



export default {
    formatProduct,
    getFinalPrice
};

