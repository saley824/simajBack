function formatProduct(p: any) {
    const hasDiscount = p.discountPercent !== null && p.discountPercent > 0;
    const discountedPrice = hasDiscount
        ? Number((p.price - (p.price * p.discountPercent) / 100).toFixed(2))
        : null;

    return {
        ...p,
        hasDiscount,
        discountedPrice,
    };
}



export default {
    formatProduct,
};

