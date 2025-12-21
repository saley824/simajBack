import { NextFunction, Request, Response } from "express";

import { prisma } from "../server";
import { userSchemaCreateDto } from "../models/validation_models/user-schema";
import crypto from "crypto"
import userHelper from "../helpers/user_helper";
import errorHelper from "../helpers/error_helper";

import jwt from "jsonwebtoken";




const signToken = (id: String,) => {
    const jwtSecret = process.env.JWT_SECRET;

    const jwtExpires = process.env.JWT_EXPIRES;

    let token = "";
    if (jwtSecret != undefined) {
        token = jwt.sign(
            {
                id: id,
            },
            jwtSecret,
            {
                expiresIn: parseInt(jwtExpires ?? ""),
            }
        );
    }

    return token;
};
const signUp = async (req: Request, res: Response) => {
    const t = req.t;

    try {
        let userBody = req.body as userSchemaCreateDto;

        // CHECK IF THERE IS USER WITH SAME USERNAME OR EMAIL
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email: userBody.email }, { username: userBody.username }],
            },
        });

        if (existingUser && !existingUser.isEmailVerified) {
            return res.status(409).json({
                error: t("signup.email_not_verified")
            });
        }

        if (existingUser) {
            return res.status(400).json({
                // todo loc
                message: existingUser.email === userBody.email
                    ? t("signup.email_in_use")
                    : t("signup.username_taken"),
            });
        }

        const hashedPassword = await userHelper.hashPassword(userBody.password);
        userBody.password = hashedPassword;
        const { emailToken, hashEmailToken, tokenExpires } =
            userHelper.createEmailToken();
        const newUser = await prisma.user.create({
            data: {
                email: userBody.email,
                username: userBody.username,
                password: hashedPassword,
                isEmailVerified: false,
                emailVerificationToken: hashEmailToken,
                emailVerificationTokenResetExpires: tokenExpires,

            },
        });

        await userHelper.sendEmailForVerification(
            req.language,
            {
                email: userBody.email,
                subject: t("use_this_token"),
                token: emailToken,
                userId: newUser.id,

            },
            userBody.username
        );

        res.status(201).json({
            success: true,
            data: {
                message: t("signup.username_taken"),
            },
        });
    } catch (error) {
        errorHelper.handle500(res, req)
    }
};


const sendTokenForVerifyingAgain = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const t = req.t;

        const selectedUser = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                isEmailVerified: true,
                username: true,
            },
        });

        if (!selectedUser) {
            return res.status(404).json({
                success: false,
                message: t("email_verification.user_not_found"),
            });
        }

        if (selectedUser.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: t("email_verification.already_verified"),
            });
        }

        const { emailToken, hashEmailToken, tokenExpires } =
            userHelper.createEmailToken();

        await prisma.user.update({
            where: { email },
            data: {
                emailVerificationToken: hashEmailToken,
                emailVerificationTokenResetExpires: tokenExpires,
            },
        });

        await userHelper.sendEmailForVerification(
            req.language,
            {
                email,
                subject: t("use_this_token"), // 👈 lokalizovan subject
                token: emailToken,
                userId: selectedUser.id,
            },
            selectedUser.username
        );

        return res.status(200).json({
            success: true,
            message: t("email_verification.token_sent"),
        });
    } catch (error) {
        errorHelper.handle500(res, req);
    }
};




const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token, userId } = req.body;
        const t = req.t;

        const hashToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const selectedUser = await prisma.user.findFirst({
            where: {
                id: userId,
                emailVerificationToken: hashToken,
                emailVerificationTokenResetExpires: {
                    gte: new Date(),
                },
            },
            select: {
                id: true,
            },
        });

        if (!selectedUser) {
            return res.status(400).json({
                success: false,
                message: t("email_verification.token_invalid"),
            });
        }

        await prisma.user.update({
            where: {
                id: selectedUser.id,
            },
            data: {
                isEmailVerified: true,
                emailVerificationToken: null,
                emailVerificationTokenResetExpires: null,
            },
        });

        return res.status(201).json({
            success: true,
            message: t("email_verification.verified_success"),
        });
    } catch (error) {
        errorHelper.handle500(res, req);
    }
};

const logOut = async (req: Request, res: Response) => {
    const secret = crypto.randomBytes(64).toString("hex");
    const { userId } = req.body;

    try {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                // fcmToken: null,
            },
        });

        res.status(200).json({
            success: true,
        });

    } catch (error) {
        errorHelper.handle500(res, req);
    }


}



const login = async (req: Request, res: Response) => {
    const { usernameEmail, password, fcmToken } = req.body;
    const t = req.t;

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { username: usernameEmail },
                { email: usernameEmail },
            ],
        },
        select: {
            id: true,
            email: true,
            username: true,
            password: true,
            isEmailVerified: true,
            balance: true,
        },
    });

    if (!user) {
        return res.status(401).json({
            success: false,
            message: t("login.invalid_credentials"),
        });
    }

    if (!user.isEmailVerified) {
        return res.status(401).json({
            success: false,
            message: t("login.email_not_verified"),
        });
    }

    let isCorrectPassword = false;

    isCorrectPassword = await userHelper.compare(
        user.password!,
        password
    );


    if (!isCorrectPassword) {
        return res.status(401).json({
            success: false,
            message: t("login.invalid_credentials"),
        });
    }

    const token = signToken(user.id,);

    const { password: _, ...userWithoutSensitiveData } = user;

    return res.status(200).json({
        success: true,
        data: {
            user: userWithoutSensitiveData,
            token,
        },
    });
};



const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const t = req.t;
        const user = await prisma.user.findFirst({
            where: { email },
        });
        if (user) {
            const { emailToken, hashEmailToken, tokenExpires } =
                userHelper.createEmailToken();

            await prisma.user.update({
                where: { email },
                data: {
                    passwordResetToken: hashEmailToken,
                    passwordResetExpires: tokenExpires,
                },
            });

            await userHelper.sendEmailForResetPassword(
                req.language,
                {
                    email,
                    subject: t("password.reset_title"),
                    token: emailToken,
                },
                user.username
            );

        }

        return res.status(200).json({
            success: true,
            message: t("password.reset_email_sent"),
        });
    } catch (error) {
        errorHelper.handle500(res, req);
    }
};






const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password, confirmPassword } = req.body;
        const t = req.t;

        const hashResetToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const selectedUser = await prisma.user.findFirst({
            where: {
                passwordResetToken: hashResetToken,
                passwordResetExpires: {
                    gte: new Date(),
                },
            },
            select: {
                id: true,
            },
        });

        if (!selectedUser) {
            return res.status(400).json({
                success: false,
                message: t("password.token_invalid"),
            });
        }

        setNewPassword(password, confirmPassword, res, selectedUser.id, t);
    } catch (error) {
        errorHelper.handle500(res, req);
    }
};



const changePassword = async (req: Request, res: Response) => {
    try {
        const { oldPassword, password, confirmPassword, userId } = req.body;
        const t = req.t;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        let isCorrectPassword = false;

        if (user) {
            isCorrectPassword = await userHelper.compare(
                user.password!,
                oldPassword
            );
        }

        if (!isCorrectPassword) {
            return res.status(401).json({
                success: false,
                message: t("password.wrong_old_password"),
            });
        }

        setNewPassword(password, confirmPassword, res, userId, t);
    } catch (error) {
        errorHelper.handle500(res, req);
    }
};

const getAllUsers = async (req: Request, res: Response) => {


    try {
        let users = await prisma.user.findMany();
        res.status(200).json({
            success: true,
            data: {
                users: users,
            },
        });
    } catch (error) {
        console.log(error);
        errorHelper.handle500(res, req);
    }

}
export default {
    signUp,
    login,
    logOut,
    forgotPassword,
    resetPassword,
    changePassword,
    getAllUsers,
    verifyEmail,
    sendTokenForVerifyingAgain

};





const setNewPassword = async (
    password: string,
    confirmPassword: string,
    res: Response,
    userId: string,
    t: (key: string) => string
) => {
    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: t("password.mismatch"),
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: t("password.too_short"),
        });
    }

    const hashedPassword = await userHelper.hashPassword(password);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });

    return res.status(200).json({
        success: true,
        message: t("password.changed_success"),
    });
};