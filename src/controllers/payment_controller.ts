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

        console.error("Monri callback error:", error);
        return res.sendStatus(200);

    }

}
const handleMonriCallback = async (req: Request, res: Response) => {
    console.log("---------")
    console.log(req.body)
    console.log("---------")
    const transactionId = req.body.order_number
        ? Number(req.body.order_number)
        : null;

    try {

        if (transactionId != null) {
            let transaction = await prisma.transaction.findUnique({
                where: {
                    id: transactionId
                },
            });

            if (transaction == null) return


            const token = await getAccessToken();
            console.log(token)


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

            console.log(response)

            if (response.data.message === "Success") {
                // if (true) {

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

                return res.status(20).json({
                    success: true,
                });

            }


        }


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"

        });
    }

}





export default {
    createTransaction,
    handleMonriCallback
};
