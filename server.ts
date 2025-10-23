import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";
import cors from "cors";
import authRouter from "./src/routes/authRoutes";
import countryRouter from "./src/routes/countryRoutes";
import regionRouter from "./src/routes/regionRoutes";
import productRouter from "./src/routes/product_routes";
import transactionRouter from "./src/routes/transaction_router";
import reviewsRouter from "./src/routes/reviewRoutes";
import contactFormRouter from "./src/routes/contactFormRoutes";
import userRouter from "./src/routes/userRoutes";







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

// export const firebase = admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     storageBucket: "gs://grad-push-notifications-2a76a.appspot.com", //storage bucket url
// });

// export const bucket = firebase.storage().bucket()

// import app from "./app";
const app = express();

const port = 3000;

async function main() {

    app.use(cors({
        origin: 'http://localhost:5173', // your frontend URL
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // allowed HTTP methods
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


    /// this make problem, check it out
    // app.all("*", (req: Request, res: Response) => {
    //     res.status(404).json({ error: `Route ${req.originalUrl} not found` });
    // });

    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
}

main()
    .then(async () => {
        await prisma.$connect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });


