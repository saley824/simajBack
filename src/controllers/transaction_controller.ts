import { NextFunction, Request, Response } from "express";

import { prisma } from "../server";
import { TransactionDto } from "../models/dto_models/transaction_dto";
import { getAccessToken } from "../helpers/token_helper";
import axios from "axios";
import errorHelper from "../helpers/error_helper";

/* =========================
   API RESPONSE
========================= */

export interface ESimOrderResponse {
    code: number;
    message: string;
    data: ESimOrder[];
}



export interface ESimOrder {
    product: Product;
    subscription: Subscription;
    creation_time: string;
}

export interface Subscription {
    upper_limit_amount: number;
    used_amount: number;
    activation_time: string; // ISO date string
    expiry: string; // ISO date string
    status: SubscriptionStatus;
    activate_by: string; // ISO date string
}

export interface Product {
    id: string;
    name: string;
    duration: number;
    imsi_profile: string;
}

export type SubscriptionStatus =
    | "PENDING"     // plan kupljen, ali još nije aktiviran
    | "ACTIVE"      // plan aktiviran (mreža ili auto-aktivacija nakon 60 dana)
    | "EXPIRED"     // plan je istekao prirodno
    | "TERMINATED"; // plan je ručno prekinut





const getTransactionById = async (req: Request, res: Response) => {
    // const transactionId = req.params.id ? Number(req.params.id) : -1;
    // try {
    //     let transaction = await prisma.transaction.findFirst({
    //         where: {
    //             id: transactionId
    //         },
    //         select: {
    //             userId: true,
    //             product: { select: { name: true, price: true, country: true } },
    //             couponCode: { select: { code: true, percentage: true } },
    //             TransactionStatus: true,
    //         }
    //     });
    //     if (transaction) {
    //         const transactionWithCustom = {
    //             ...transaction,
    //             price: transaction.couponCode != null ? Math.round((1 - transaction.couponCode.percentage / 100) * transaction.product.price! * 100) / 100 : transaction.product.price!,
    //         };
    //         transaction = transactionWithCustom;
    //     }
    //     res.status(200).json({
    //         success: true,
    //         data: {
    //             transaction: transaction,
    //         },
    //     });
    // } catch (error) {
    //     res.status(500).json({
    //         success: false,
    //         message: "Internal Server Error"
    //     });
    // }

}
// const getTransactions = async (req: Request, res: Response) => {
//     const userId: string | undefined = req.query.userId as string | undefined;

//     try {
//         let transactions = await prisma.transaction.findMany({
//             where: {
//                 ...(userId && { userId }),
//             },
//             select: {
//                 userId: true,
//                 product: { select: { name: true, sellingPrice: true, country: true } },
//                 couponCode: true,
//                 TransactionStatus: true,
//             }
//         });
//         if (transactions && transactions.length > 0) {
//             transactions = transactions.map(transaction => {
//                 const transactionWithCustom = {
//                     ...transaction,
//                     price: transaction.couponCode != null
//                         ? Math.round((1 - transaction.couponCode.percentage / 100) * transaction.product.price! * 100) / 100
//                         : transaction.product.price!,
//                 };
//                 return transactionWithCustom;
//             });
//         }


//         res.status(200).json({
//             success: true,
//             data: {
//                 transactions: transactions,
//             },
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             success: false,
//             message: "Internal Server Error"

//         });
//     }

// }


const getUserTransactions = async (req: Request, res: Response) => {
    const userId: string | undefined = req.query.userId as string | undefined;
    const lang = req.headers["accept-language"] || "en";
    try {
        let transactions = await prisma.transaction.findMany({
            where: {
                userId: userId,
                TransactionStatus: "Completed",
            },
            select: {
                userId: true,
                createdAt: true,
                product: { select: { id: true, amount: true, duration: true, country: true, region: true } },
                order: {
                    select: {
                        id: true,
                        iccid: true,

                    }
                },
                couponCode: {
                    select: {
                        code: true,
                        subjectName: true

                    }
                },
                TransactionStatus: true,

            }
        });
        let transactionDtos: TransactionDto[] = [];



        transactions.map(tra => {
            let name: string = tra.product.country != null ? (lang == "en" ? tra.product.country?.displayNameEn : tra.product.country?.displayNameSr) : (lang == "en" ? tra.product.region?.displayNameEn : tra.product.region?.displayNameSr) ?? ""
            transactionDtos.push(
                {
                    userId: tra.userId,
                    createdAt: tra.createdAt,
                    duration: tra.product.duration,
                    amount: tra.product.amount,
                    name: name,
                    countryId: tra.product.country?.id ?? null,
                    regionId: tra.product.region?.id ?? null,
                    iccid: tra.order?.iccid ?? "",
                    productId: tra.product.id,
                    orderId: tra.order?.id ?? "",
                }
            )
        });






        res.status(200).json({
            success: true,
            data: {
                transactions: transactionDtos,
            },
        });
    } catch (error) {
        console.log(error);
        errorHelper.handle500(res, req);
    }

}

const getESimOrders = async (req: Request, res: Response) => {
    const t = req.t;

    try {
        const iccid: string | undefined = req.query.iccid as string | undefined;
        const token = await getAccessToken();

        const response = await axios.get<ESimOrderResponse>(
            `${process.env.N_BASE_URL}/order/api/v1/get_esim_orders?iccid=${iccid}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        res.status(200).json({
            success: true,
            data: response.data,
        });
        console.log(response.data.data)
    } catch (error) {
        console.log(error);
        errorHelper.handle500(res, req);
    }

}

export default {
    getTransactionById,
    getUserTransactions,
    getESimOrders,
};





