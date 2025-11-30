import { Request, Response } from "express";
import { prisma } from "../server";
import axios from "axios";
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
                productId: req.body.productId,
                couponCode: req.body.couponCode,
                price: req.body.price
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
        res.status(500).json({
            success: false,
            message: "Internal Server Error"

        });
    }

}
const handleMonriCallback = async (req: Request, res: Response) => {
    const transactionId = req.params.transactionId
        ? Number(req.params.transactionId)
        : null;

    try {

        if (transactionId != null) {
            let transaction = await prisma.transaction.findUnique({
                where: {
                    id: transactionId


                },
            });

            if (transaction == null) return


            const token = getAccessToken();


            const response = await axios.post<OrderEsimResponse>(
                "",
                {
                    operation_type: "NEW",
                    product: {
                        id: transaction?.productId
                    }
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    }
                }
            );

            if (response.data.message === "Success") {

                const esimData = response.data.data;

                const orderData = {
                    id: esimData.id,
                    iccid: esimData.esim.iccid,
                    productId: transaction!.productId
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

            }


        }


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"

        });
    }

}





export default {
    createTransaction,
    handleMonriCallback
};
