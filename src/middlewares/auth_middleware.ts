import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { promisify } from "util";
import { prisma } from "../../server";

export const checkToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization?.split(" ")[1];
    }
    if (!token) {
        res.status(401).json({
            message: "Miss token. Please log in",
            success: false,
        });
        return;
    }
    const jwtSecret = process.env.JWT_SECRET;

    interface CustomJwtPayload extends JwtPayload {
        id: string; // Add any other properties you expect in your payload
        // Add more properties as needed
    }

    function verifyTokenPromise(
        token: string,
        secret: string
    ): Promise<CustomJwtPayload> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded as CustomJwtPayload);
                }
            });
        });
    }

    // TOKEN VERIFICATION
    if (jwtSecret != undefined) {
        try {
            const decoded = await verifyTokenPromise(token, jwtSecret);

            // CHECK IF USER STILL EXISTS
            const currentUser = await prisma.user.findUnique({
                where: {
                    id: decoded.id,
                },
            });
            if (!currentUser) {
                res.status(401).json({
                    message:
                        "The user belonging to this token does not longer exists. Please log in",
                    success: false,
                });
                return;
            }
            // CHECK IF USER CHANGED PASSWORD

            // IF user changed password then token is not valid,
        } catch (error) {
            res.status(401).json({
                message: "Invalid token. Please log in",
                success: false,
            });
            return;
        }
        next();
    }
};
