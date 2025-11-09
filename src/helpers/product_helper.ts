function formatProduct(p: any) {
    const hasDiscount = p.discountPercent !== null && p.discountPercent > 0;
    const finalPrice = hasDiscount
        ? Number((p.sellingPrice - (p.sellingPrice * p.discountPercent) / 100).toFixed(2))
        : p.sellingPrice;

    return {
        ...p,
        hasDiscount,
        finalPrice,
    };
}
function getFinalPrice(sellingPrice: number, discountPercent: number): number {
    return Number((sellingPrice - (sellingPrice * discountPercent) / 100).toFixed(2))

}



export default {
    formatProduct,
    getFinalPrice
};

