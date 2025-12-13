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
    try {
        const transaction = await prisma.transaction.create({
            data: {
                userId: req.body.userId,
                referralUserId: req.body.referralUserId,
                productId: req.body.productId,
                price: req.body.price,

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

    console.log()



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
                    prisma.user.update(
                        {
                            where: {
                                id: transaction.userId
                            },
                            data: {
                                invitedById: transaction.referralUserId
                            }
                        }
                    )
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
            }

            const a = 2

            if (a == 2) {
                return null;
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

            console.log("RESPONSE")
            console.log(response)




            if (response.data.message === "Success") {
                const esimData = response.data.data;
                const networks = transaction.product.networks.map(network => network.name ?? "").join(", ")
                userHelper.sendQRcode(
                    "sr",
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





export default {
    createTransaction,
    handleMonriCallback
};
