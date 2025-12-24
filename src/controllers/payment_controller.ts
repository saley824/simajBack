import { Request, Response } from "express";
import { prisma } from "../server";
import axios from "axios";
import userHelper from "../helpers/user_helper";

import { getAccessToken } from "../helpers/token_helper";


interface OrderEsimResponse {
    code: number;
    message: string;
    data: {
        id: string;
        status: string;
        esim: {
            iccid: string;
            esim_qr: string;
            status: string;
            apn: string;
        };
        subscription: {
            upper_limit_amount: number;
            amount_unit: string;
            status: string;
            activation_time: string;
            expiry: string;
            external_id: string;
            activate_by: string;
        };
        creation_time: string;
    };
}

const createTransaction = async (req: Request, res: Response) => {

    const couponCode = req.body.couponCode;
    try {
        var coupon = null;

        if (couponCode) {
            coupon = await prisma.couponCode.findUnique({
                where: {
                    code: couponCode
                },
            });
        }
        const transaction = await prisma.transaction.create({
            data: {
                userId: req.body.userId,
                referralUserId: req.body.referralUserId,
                productId: req.body.productId,
                price: req.body.price,
                couponCodeId: coupon?.id,
            },
        });
        res.status(200).json({
            success: true,
            data: {
                transactionId: transaction.id,
            },
        });
    } catch (error) {
        console.log(error)

        console.error("Monri callback error:", error);
        return res.sendStatus(200);

    }

}
const handleMonriCallback = async (req: Request, res: Response) => {


    const transactionId = req.body.order_number
        ? Number(req.body.order_number)
        : null;

    const orderInfo = req.body.order_info;
    let lang = "sr";

    try {
        lang = orderInfo.split("-")[1];
    } catch (error) {
        console.log(error)
    }
    try {
        if (transactionId != null) {
            let transaction = await prisma.transaction.findUnique({
                where: {
                    id: transactionId
                },
                include: {
                    order: true,
                    product: {
                        include: {
                            networks: true
                        }
                    },
                }
            });


            if (transaction == null) return

            const user = await prisma.user.findUnique(
                {
                    where: {
                        id: transaction.userId
                    }
                }
            );

            try {
                if (transaction.referralUserId != null) {
                    await prisma.user.update({
                        where: {
                            id: transaction.userId,
                        },
                        data: {
                            invitedBy: {
                                connect: { id: transaction.referralUserId },
                            },
                        },
                    });
                    await prisma.user.update({
                        where: {
                            id: transaction.referralUserId
                        },
                        data: {
                            balance: {
                                increment: 1
                            }
                        }
                    });

                }
            } catch (error) {
                console.log(error)
                return res.status(200).json({
                    success: true,
                });
            }

            const token = await getAccessToken();


            const response = await axios.post<OrderEsimResponse>(
                `${process.env.N_BASE_URL}/order/api/v1/create_order`,
                {
                    "operation_type": "NEW",
                    "product": {
                        "id": transaction?.productId
                    }
                },
                {
                    headers: {
                        "X-Idempotency-Key": crypto.randomUUID(),
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    }
                }
            );

            if (response.data.message === "Success") {
                const esimData = response.data.data;
                const networks = transaction.product.networks.map(network => network.name ?? "").join(", ")
                userHelper.sendQRcode(
                    lang,
                    user?.email ?? "",
                    esimData.esim.esim_qr,
                    esimData.esim.apn,
                    transaction.product!.amount!,
                    transaction.product.duration,
                    user?.username ?? "",
                    transaction.product.name,
                    transactionId!,
                    networks,
                    transaction.product.imsiProfile ?? ""

                )


                const orderData = {
                    id: esimData.id,
                    iccid: esimData.esim.iccid,
                    apn: esimData.esim.apn,
                    esimQr: esimData.esim.esim_qr,
                    productId: transaction!.productId,

                };

                const order = await prisma.order.create({
                    data: orderData
                });


                await prisma.transaction.update({
                    where: { id: transaction!.id },
                    data: {
                        orderId: order.id,
                        TransactionStatus: "Completed"
                    }
                });

                return res.status(200).json({
                    success: true,
                });

            }
        }
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            success: true,
        });
    }

}



const handlePaymentWithBalance = async (req: Request, res: Response) => {
    const couponCode = req.body.couponCode;
    var coupon = null;

    if (couponCode) {
        coupon = await prisma.couponCode.findUnique({
            where: {
                code: couponCode
            },
        });
    }

    const t = req.t;
    const transaction = await prisma.transaction.create({
        data: {
            userId: req.body.userId,
            referralUserId: req.body.referralUserId,
            productId: req.body.productId,
            price: req.body.price,

        },

        include: {
            order: true,
            product: {
                include: {
                    networks: true
                }
            },
        }
    });



    try {
        if (transaction != null) {
            const user = await prisma.user.findUnique(
                {
                    where: {
                        id: transaction.userId
                    }
                }
            );

            if (user!.balance.toNumber() < transaction!.price!) {
                return res.status(400).json({
                    success: false,
                    message: t("not_enough_funds"),
                });
            }

            try {
                if (transaction.referralUserId != null) {
                    await prisma.user.update({
                        where: {
                            id: transaction.userId,
                        },
                        data: {
                            invitedBy: {
                                connect: { id: transaction.referralUserId },
                            },
                        },
                    });
                    await prisma.user.update({
                        where: {
                            id: transaction.referralUserId
                        },
                        data: {
                            balance: {
                                increment: 1
                            }
                        }
                    });

                }
            } catch (error) {
                console.log(error)
                return res.status(200).json({
                    success: true,
                });
            }


            const token = await getAccessToken();


            const response = await axios.post<OrderEsimResponse>(
                `${process.env.N_BASE_URL}/order/api/v1/create_order`,
                {
                    "operation_type": "NEW",
                    "product": {
                        "id": transaction?.productId
                    }
                },
                {
                    headers: {
                        "X-Idempotency-Key": crypto.randomUUID(),
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    }
                }
            );

            if (response.data.message === "Success") {

                await prisma.user.update({
                    where: {
                        id: transaction.userId
                    },
                    data: {
                        balance: {
                            decrement: transaction.price ?? 0
                        }
                    }
                });


                const esimData = response.data.data;
                const networks = transaction.product.networks.map(network => network.name ?? "").join(", ")
                userHelper.sendQRcode(
                    req.language,
                    user?.email ?? "",
                    esimData.esim.esim_qr,
                    esimData.esim.apn,
                    transaction.product!.amount!,
                    transaction.product.duration,
                    user?.username ?? "",
                    transaction.product.name,
                    transaction.id!,
                    networks,
                    transaction.product.imsiProfile ?? ""
                )


                const orderData = {
                    id: esimData.id,
                    iccid: esimData.esim.iccid,
                    apn: esimData.esim.apn,
                    esimQr: esimData.esim.esim_qr,
                    productId: transaction!.productId,

                };

                const order = await prisma.order.create({
                    data: orderData
                });


                await prisma.transaction.update({
                    where: { id: transaction!.id },
                    data: {
                        orderId: order.id,
                        TransactionStatus: "Completed"
                    }
                });

                return res.status(200).json({
                    success: true,
                });

            }
        }
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            success: true,
        });
    }

}





export default {
    createTransaction,
    handleMonriCallback,
    handlePaymentWithBalance
};
