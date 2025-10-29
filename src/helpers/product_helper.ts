function formatProduct(p: any) {
    const hasDiscount = p.discountPercent !== null && p.discountPercent > 0;
    const finalPrice = hasDiscount
        ? Number((p.basePrice - (p.basePrice * p.discountPercent) / 100).toFixed(2))
        : p.basePrice;

    return {
        ...p,
        hasDiscount,
        finalPrice,
    };
}
function getFinalPrice(basePrice: number, discountPercent: number): number {
    return Number((basePrice - (basePrice * discountPercent) / 100).toFixed(2))

}



export default {
    formatProduct,
    getFinalPrice
};

