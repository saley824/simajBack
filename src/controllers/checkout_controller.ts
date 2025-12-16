import { NextFunction, Request, Response } from "express";

import { prisma } from "../server";

import productsHelper from "../helpers/product_helper";
import currencyHelper from "../helpers/currency_helper";
import { CouponType } from "@prisma/client";
import errorHelper from "../helpers/error_helper";



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
    referralErrorMessage: string | null
    referralCodePercentage: number | null
    referralUserId: string | null


}


const getCheckoutInfo = async (req: Request, res: Response) => {
    const t = req.t;
    const { productId, userId, couponCode, referralUsername } = req.body;

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
            return res.status(400).json({ success: false, message: t("product_not_available") });
        }

        if (!productRes.sellingPrice || !productRes.amount) {
            errorHelper.handle500(res, req);
        }

        const product = await productsHelper.formatProduct(productRes, currency);

        const productName = productRes.country ? ((req.language == "en" ? productRes.country?.displayNameEn : productRes.country?.displayNameSr) ?? "") : ((req.language == "en" ? productRes.region?.displayNameEn : productRes.region?.displayNameSr) ?? "")


        let checkoutResponse: CheckoutResponse = {
            productPlanName: productName,
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
            referralErrorMessage: null,
            referralCodePercentage: null,
            referralUserId: null,
        };


        if (couponCode != null && couponCode != "") {
            const coupon = await prisma.couponCode.findUnique({
                where: {
                    code: couponCode
                },
            });

            if (coupon == null) {
                checkoutResponse.enteredWrongCode = true;
                checkoutResponse.promoCodeErrorMessage = t("coupon_invalid")
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
                            checkoutResponse.promoCodeErrorMessage = t("checkout.coupon_only_country")


                        }
                        break;
                    case CouponType.OnlyCountryWithoutDiscount:
                        if (product.countryId == null) {
                            checkoutResponse.isPromoCodeNotApplicable = true;
                            checkoutResponse.promoCodeErrorMessage = t("checkout.coupon_only_country")
                        }
                        else if (product.hasDiscount) {
                            checkoutResponse.isPromoCodeNotApplicable = true;
                            checkoutResponse.promoCodeErrorMessage = t("checkout.coupon_not_allowed_on_discounted")
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
                        checkoutResponse.promoCodeErrorMessage = t("checkout.generic_error")

                        break;
                }

            }
        }

        else if (referralUsername && referralUsername != "") {
            const user = await prisma.user.findUnique(
                {
                    where: {
                        id: userId
                    }
                }
            );



            if (user?.invitedById) {
                checkoutResponse.referralErrorMessage = t("checkout.referral_already_used")
            }

            else {
                const referralUser = await prisma.user.findUnique(
                    {
                        where: {
                            username: referralUsername
                        },
                        include: {
                            invitedUsers: true
                        }
                    }
                );

                if (!referralUser) {
                    checkoutResponse.referralErrorMessage = t("checkout.referral_user_not_found");
                }

                else if (user?.id == referralUser.id) {
                    checkoutResponse.referralErrorMessage = t("checkout.referral_self_use");
                }

                else if (referralUser!.invitedUsers && referralUser!.invitedUsers.length > 9) {
                    checkoutResponse.referralErrorMessage = t("checkout.referral_limit_reached");
                }
                else {
                    checkoutResponse.referralUserId = referralUser.id,
                        checkoutResponse.referralCodePercentage = 20;
                    checkoutResponse.productFinalPrice = productsHelper.getFinalPrice(product.finalPrice!, 20)
                    checkoutResponse.productFinalPriceBAM = productsHelper.getFinalPrice(product.finalPriceBAM!, 20)

                }
            }
        }







        res.status(200).json({
            success: true,
            data: checkoutResponse
        });




    } catch (error) {
        console.log(error)
        errorHelper.handle500(res, req);
    }

}

const buyNow = async (req: Request, res: Response) => {

}

export default {
    getCheckoutInfo
};





