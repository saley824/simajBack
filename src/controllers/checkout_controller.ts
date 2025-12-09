import { NextFunction, Request, Response } from "express";

import { prisma } from "../server";

import productsHelper from "../helpers/product_helper";
import currencyHelper from "../helpers/currency_helper";
import { CouponType } from "@prisma/client";


interface CheckoutResponse {
    productPlanName: string;
    productDuration: number;
    amount: number;
    DurationUnit: string;
    productBasePrice: number;
    productFinalPrice: number;
    productBasePriceBAM: number;
    productFinalPriceBAM: number;
    productDiscountPercentage: number | null
    couponCodePercentage: number | null
    couponName: string | null
    isFreeCouponActivated: boolean
    /// enters completely wrong code
    enteredWrongCode: boolean
    /// enters exiting code that cant be applied
    isPromoCodeNotApplicable: boolean
    promoCodeErrorMessage: string | null
}


const getCheckoutInfo = async (req: Request, res: Response) => {
    const { productId, userId, couponCode } = req.body;
    const lang = req.headers["accept-language"] || "en";

    const currencyHeader = (req.headers["x-currency"] as string) ?? "BAM";
    const currency = currencyHelper.parseCurrency(currencyHeader)
    try {
        const productRes = await prisma.product.findUnique(
            {
                where: {
                    id: productId
                },
                include: {
                    country: true,
                    region: true,
                }
            }
        );

        if (productRes == null) {
            return res.status(400).json({ success: false, message: "Product is not available. Try with another or try later!" });
        }

        if (!productRes.sellingPrice || !productRes.amount) {
            res.status(500).json({
                success: false,
                message: "Internal Server Error"

            });
        }

        const product = await productsHelper.formatProduct(productRes, currency);

        const productName = productRes.country ? ((lang == "en" ? productRes.country?.displayNameEn : productRes.country?.displayNameSr) ?? "") : ((lang == "en" ? productRes.region?.displayNameEn : productRes.region?.displayNameSr) ?? "")


        let checkoutResponse: CheckoutResponse = {
            productPlanName: (lang == "en" ? productRes.country?.displayNameEn : productRes.country?.displayNameSr) ?? "",
            productDuration: product.duration,
            amount: product.amount!,
            DurationUnit: "days",
            productBasePrice: product.sellingPrice!,
            productFinalPrice: product.finalPrice!,
            productBasePriceBAM: product.sellingPriceBAM!,
            productFinalPriceBAM: product.finalPriceBAM!,
            productDiscountPercentage: product.discountPercent,
            couponCodePercentage: null,
            isPromoCodeNotApplicable: false,
            promoCodeErrorMessage: null,
            enteredWrongCode: false,
            couponName: null,
            isFreeCouponActivated: false,
        };


        if (couponCode != null && couponCode != "") {
            const coupon = await prisma.couponCode.findUnique({
                where: {
                    code: couponCode
                },
            });

            if (coupon == null) {
                checkoutResponse.enteredWrongCode = true;
                checkoutResponse.promoCodeErrorMessage = "You entered wrong code"
            }
            else {
                switch (coupon?.couponType) {
                    case CouponType.Free:
                        checkoutResponse.productFinalPrice = 0.0;
                        checkoutResponse.productFinalPriceBAM = 0.0;
                        checkoutResponse.isFreeCouponActivated = true
                        break;

                    case CouponType.All || CouponType.CustomPercentageCountryRegion:
                        if (product.countryId != null && coupon.countryPercentage != null && coupon.countryPercentage > 0) {
                            checkoutResponse.productFinalPrice = productsHelper.getFinalPrice(product.finalPrice!, coupon.countryPercentage)
                            checkoutResponse.productFinalPriceBAM = productsHelper.getFinalPrice(product.finalPriceBAM!, coupon.countryPercentage)
                            checkoutResponse.couponCodePercentage = coupon.countryPercentage;
                            checkoutResponse.couponName = coupon.subjectName;
                        }
                        else if (product.regionId != null && coupon.regionPercentage != null && coupon.regionPercentage > 0) {
                            checkoutResponse.productFinalPrice = productsHelper.getFinalPrice(product.finalPrice!, coupon.regionPercentage)
                            checkoutResponse.productFinalPriceBAM = productsHelper.getFinalPrice(product.finalPriceBAM!, coupon.regionPercentage)
                            checkoutResponse.couponCodePercentage = coupon.regionPercentage;
                            checkoutResponse.couponName = coupon.subjectName;

                        }
                        else {
                            checkoutResponse.isPromoCodeNotApplicable = true;
                        }
                        break;

                    case CouponType.OnlyCountry:
                        if (product.countryId != null) {
                            checkoutResponse.productFinalPrice =
                                productsHelper.getFinalPrice(product.finalPrice!, coupon.countryPercentage ?? 1)
                            checkoutResponse.productFinalPriceBAM =
                                productsHelper.getFinalPrice(product.finalPriceBAM!, coupon.countryPercentage ?? 1)
                            checkoutResponse.couponCodePercentage = coupon.countryPercentage;
                            checkoutResponse.couponName = coupon.subjectName;
                        }
                        else {
                            checkoutResponse.isPromoCodeNotApplicable = true;
                            checkoutResponse.promoCodeErrorMessage = "This code can be applied only on country plans"


                        }
                        break;
                    case CouponType.OnlyCountryWithoutDiscount:
                        if (product.countryId == null) {
                            checkoutResponse.isPromoCodeNotApplicable = true;
                            checkoutResponse.promoCodeErrorMessage = "This code can be applied only on country plans"
                        }
                        else if (product.hasDiscount) {
                            checkoutResponse.isPromoCodeNotApplicable = true;
                            checkoutResponse.promoCodeErrorMessage = "This code can be applied on plans that are already on discount"
                        }
                        else {
                            checkoutResponse.productFinalPrice =
                                productsHelper.getFinalPrice(product.sellingPrice!, coupon.countryPercentage ?? 1)
                            checkoutResponse.productFinalPriceBAM =
                                productsHelper.getFinalPrice(product.sellingPriceBAM!, coupon.countryPercentage ?? 1)
                        }
                        break;

                    default:
                        checkoutResponse.isPromoCodeNotApplicable = true;
                        checkoutResponse.promoCodeErrorMessage = "Something went wrong, try again"

                        break;
                }

            }
        }







        res.status(200).json({
            success: true,
            data: checkoutResponse
        });




    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"

        });
    }

}

const buyNow = async (req: Request, res: Response) => {

}

export default {
    getCheckoutInfo
};





