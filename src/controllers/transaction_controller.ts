import { NextFunction, Request, Response } from "express";

import { prisma } from "../server";


const createNewTransaction = async (req: Request, res: Response) => {
    try {

        let existedTransaction = await prisma.transaction.findFirst({
            where: {
                userId: req.body.userId,
                TransactionStatus: "Started"

            },
        });

        if (existedTransaction) {
            await prisma.transaction.delete(
                { where: { id: existedTransaction.id } }
            );
        }




        const transaction = await prisma.transaction.create({
            data: {
                userId: req.body.userId,
                productId: req.body.productId,
            },
        });

        res.status(200).json({
            success: true,
            transaction: transaction,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            success: false,
            status: "fail",
        });
    }
};

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
const getTransactions = async (req: Request, res: Response) => {
    // const userId: string | undefined = req.query.userId as string | undefined;

    // try {
    //     let transactions = await prisma.transaction.findMany({
    //         where: {
    //             ...(userId && { userId }),
    //         },
    //         select: {
    //             userId: true,
    //             product: { select: { name: true, price: true, country: true } },
    //             couponCode: { select: { code: true, percentage: true } },
    //             TransactionStatus: true,
    //         }
    //     });
    //     if (transactions && transactions.length > 0) {
    //         transactions = transactions.map(transaction => {
    //             const transactionWithCustom = {
    //                 ...transaction,
    //                 price: transaction.couponCode != null
    //                     ? Math.round((1 - transaction.couponCode.percentage / 100) * transaction.product.price! * 100) / 100
    //                     : transaction.product.price!,
    //             };
    //             return transactionWithCustom;
    //         });
    //     }


    //     res.status(200).json({
    //         success: true,
    //         data: {
    //             transactions: transactions,
    //         },
    //     });
    // } catch (error) {
    //     console.log(error);
    //     res.status(500).json({
    //         success: false,
    //         message: "Internal Server Error"

    //     });
    // }

}



const addCouponCode = async (req: Request, res: Response) => {
    const couponCode = req.body.couponCode?.toString() || "";
    try {
        const coupon = await prisma.couponCode.findFirst({
            where: {
                code: couponCode
            },
        });

        if (coupon == null) {
            res.status(404).json({
                success: false,
                message: "Coupon code not found"

            });
        }

        const transaction = await prisma.transaction.update({
            where: {
                id: req.body.transactionId
            },
            data: {
                couponCodeId: coupon!.id,
            },
        });


        res.status(200).json({
            success: true,
            data: {
                transaction: transaction,

            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"

        });
    }

}


export default {
    createNewTransaction,
    addCouponCode,
    getTransactionById,
    getTransactions
};





