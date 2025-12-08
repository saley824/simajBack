import { Currency, Product } from "@prisma/client";
import { prisma } from "../server";

async function formatProduct(p: Product, currency: Currency) {


    const exchangeRate = await prisma.exchangeRate.findFirst(
        {
            where: {
                currency: currency
            }
        }
    )


    const hasDiscount = p.discountPercent !== null && p.discountPercent > 0;
    var finalPrice = hasDiscount
        ? Number((p.sellingPrice! - (p.sellingPrice! * p.discountPercent!) / 100).toFixed(2))
        : p.sellingPrice;
    const sellingPriceBAM = p.sellingPrice;
    const finalPriceBAM = finalPrice;
    if (exchangeRate && p.sellingPrice && finalPrice) {
        p.sellingPrice = Number((exchangeRate.rateFromBAM.toNumber() * p.sellingPrice!).toFixed(2));
        finalPrice = Number((exchangeRate.rateFromBAM.toNumber() * finalPrice).toFixed(2));
    }





    return {
        ...p,
        hasDiscount,
        finalPrice,
        sellingPriceBAM,
        finalPriceBAM

    };
}
function getFinalPrice(sellingPrice: number, discountPercent: number): number {
    return Number((sellingPrice - (sellingPrice * discountPercent) / 100).toFixed(2))

}



export default {
    formatProduct,
    getFinalPrice
};

