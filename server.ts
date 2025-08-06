import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";
import authRouter from "./src/routes/authRoutes";







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
    app.use(express.json());

    // Register API routes

    const baseUrl: string = "/api/v1";
    app.use(`${baseUrl}/auth`, authRouter);


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


