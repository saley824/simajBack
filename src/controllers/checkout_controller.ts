import { NextFunction, Request, Response } from "express";

import { prisma } from "../server";

import productsHelper from "../helpers/product_helper";
import { CouponType } from "@prisma/client";


interface CheckoutResponse {
    productPlanName: string;
    productDuration: number;
    DurationUnit: string;
    productBasePrice: number;
    productFinalPrice: number;
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




    try {
        const productRes = await prisma.product.findUnique(
            {
                where: {
                    id: productId
                }
            }
        );

        if (productRes == null) {
            return res.status(400).json({ success: false, message: "Product is not available. Try with another or try later!" });
        }

        const product = productsHelper.formatProduct(productRes);


        let checkoutResponse: CheckoutResponse = {
            productPlanName: product.name,
            productDuration: productRes.duration,
            DurationUnit: "days",
            productBasePrice: product.sellingPrice,
            productFinalPrice: product.finalPrice,
            productDiscountPercentage: product.discountPercent,
            couponCodePercentage: null,
            isPromoCodeNotApplicable: false,
            promoCodeErrorMessage: null,
            enteredWrongCode: false,
            couponName: null,
            isFreeCouponActivated: false,
        };


        // const user = await prisma.user.findUnique(
        //     {
        //         where: {
        //             id: userId
        //         }
        //     }
        // );



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
                        checkoutResponse.isFreeCouponActivated = true
                        break;

                    case CouponType.All || CouponType.CustomPercentageCountryRegion:
                        if (product.countryId != null && coupon.countryPercentage != null && coupon.countryPercentage > 0) {
                            checkoutResponse.productFinalPrice = productsHelper.getFinalPrice(product.finalPrice, coupon.countryPercentage)
                            checkoutResponse.couponCodePercentage = coupon.countryPercentage;
                            checkoutResponse.couponName = coupon.subjectName;
                        }
                        else if (product.regionId != null && coupon.regionPercentage != null && coupon.regionPercentage > 0) {
                            checkoutResponse.productFinalPrice = productsHelper.getFinalPrice(product.finalPrice, coupon.regionPercentage)
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
                                productsHelper.getFinalPrice(product.finalPrice, coupon.countryPercentage ?? 1)
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
                                productsHelper.getFinalPrice(product.sellingPrice, coupon.countryPercentage ?? 1)
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

export default {
    getCheckoutInfo
};





