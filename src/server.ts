import { PrismaClient } from "@prisma/client";
import express from "express";

import cors from "cors";
import authRouter from "./routes/authRoutes";
import countryRouter from "./routes/countryRoutes";
import regionRouter from "./routes/regionRoutes";
import productRouter from "./routes/product_routes";
import transactionRouter from "./routes/transaction_router";
import reviewsRouter from "./routes/reviewRoutes";
import contactFormRouter from "./routes/contactFormRoutes";
import userRouter from "./routes/userRoutes";
import checkoutRoutes from "./routes/checkoutRoutes";
import deviceRoutes from "./routes/devicesRoutes";
import paymentRoutes from "./routes/payment_route";
import testRoutes from "./routes/testRoutes";
import testHelper from "./helpers/user_helper";
import externalHelper from "./external_helpers/external_helpers";
import axios, { AxiosResponse } from "axios";
import { getAccessToken } from "./helpers/token_helper";
import { PriceRow } from "./external_helpers/external_helpers";







// import dotenv from "dotenv";
// dotenv.config();
// import PostRouter from "./routes/blog.route";

// export const prisma = new PrismaClient().$extends({
//   result: {
//     product: {
//       discountedPrice: {
//         needs: { price: true },
//         compute(product) {
//           return product.price * 0.7;
//         },
//       },
//     },
//   },
// });

export const prisma = new PrismaClient();


// var serviceAccount = require("./serviceAccountKeyNotifications.json");



// export const bucket = firebase.storage().bucket()

// import app from "./app";
const app = express();


async function main() {

    app.use(cors({
        origin: [
            process.env.FRONTEND_BASE_URL!,
            process.env.FRONTEND_BASE_URL_PRODUCTION_WWW!,
            process.env.FRONTEND_BASE_URL_LOCAL!,
            process.env.FRONTEND_BASE_URL_PRODUCTION!,
            process.env.FRONTEND_BASE_URL_STAGING_WWW!


        ],

        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // allowed HTTP methods
        credentials: true // if you need cookies/auth
    }));
    app.use(express.json());

    // Register API routes

    const baseUrl: string = "/api/v1";


    app.use(`${baseUrl}/auth`, authRouter);
    app.use(`${baseUrl}/countries`, countryRouter);
    app.use(`${baseUrl}/regions`, regionRouter);
    app.use(`${baseUrl}/products`, productRouter);
    app.use(`${baseUrl}/transactions`, transactionRouter);
    app.use(`${baseUrl}/reviews`, reviewsRouter);
    app.use(`${baseUrl}/contactForm`, contactFormRouter);
    app.use(`${baseUrl}/user`, userRouter);
    app.use(`${baseUrl}/checkout`, checkoutRoutes);
    app.use(`${baseUrl}/devices`, deviceRoutes);
    app.use(`${baseUrl}/payment`, paymentRoutes);
    app.use(`${baseUrl}/test`, testRoutes);


    /// this make problem, check it out
    // app.all("*", (req: Request, res: Response) => {
    //     res.status(404).json({ error: `Route ${req.originalUrl} not found` });
    // });

    const port = Number(process.env.PORT) || 8080;

    app.listen(port, "0.0.0.0", () => {
        console.log(`✅ Server is listening on port ${port}`);
    });
}

main()
    .then(async () => {
        await prisma.$connect();
        const token = await getAccessToken();
        var lastId: string | undefined = ""





    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });


