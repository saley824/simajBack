import { NextFunction, Request, Response } from "express";

import { prisma } from "../../server";
import { userSchemaCreateDto } from "../models/validation_models/user-schema";
import { PublicUserDto } from "../models/dto_models/public_user_dto";
import crypto from "crypto"
import userHelper from "../helpers/user_helper";
import errorHelper from "../helpers/error_helper";

import jwt from "jsonwebtoken";
import { get } from "http";

const signToken = (id: String) => {
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
                error: "Email already registered but not verified. Resend verification email?"
            });
        }

        if (existingUser) {
            return res.status(400).json({
                // todo loc
                message: existingUser.email === userBody.email
                    ? 'Email already in use'
                    : 'Username already taken',
            });
        }

        const hashedPassword = await userHelper.hashPassword(userBody.password);
        userBody.password = hashedPassword;
        const { emailToken, hashEmailToken, tokenExpires } =
            userHelper.createEmailToken();
        await prisma.user.create({
            data: {
                email: userBody.email,
                lastName: userBody.lastName,
                name: userBody.name,
                username: userBody.username,
                password: hashedPassword,
                isEmailVerified: false,
                emailVerificationToken: hashEmailToken,
                emailVerificationTokenResetExpires: tokenExpires,

            },
        });

        await userHelper.sendEmail({
            email: userBody.email,
            subject: "Iskoristite ovaj token za verifikovanje emaila",
            token: emailToken,
            isForEmailVerification: false,
        },
            userBody.name
        );

        res.status(201).json({
            success: true,
            data: {
                message: "Korisnik je uspješno kreiran!",
            },
        });
    } catch (error) {
        errorHelper.handle500(res)
    }
};

const sendTokenForVerifyingAgain = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const selectedUser = await prisma.user.findUnique(
            {
                where: {
                    email: email,
                },
                select: {
                    id: true,
                    isEmailVerified: true,
                    name: true,
                }
            }
        )

        if (!selectedUser) {
            return res.status(404).json({
                success: false,
                message: "Ne postoji korisnik sa upisanim email-om",
            });

        }

        if (selectedUser?.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Mejl je vec verifikovan"
            });

        }

        const { emailToken, hashEmailToken, tokenExpires } =
            userHelper.createEmailToken();
        await prisma.user.update({
            where: {
                email: email,
            },
            data: {
                emailVerificationToken: hashEmailToken,
                emailVerificationTokenResetExpires: tokenExpires
            }
        })

        await userHelper.sendEmail({
            email: email,
            subject: "Iskoristite ovaj token za verifikovanje emaila",
            token: emailToken,
            isForEmailVerification: false,
        },
            selectedUser.name
        );
        res.status(200).json({
            success: true,
            data: {
                message: "Novi token je poslan na email",
            },
        });
    } catch (error) {
        errorHelper.handle500(res)
    }
};

const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token, email } = req.body;

        const hashToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const selectedUser = await prisma.user.findFirst(
            {
                where: {
                    email: email,
                    emailVerificationToken: hashToken,
                    emailVerificationTokenResetExpires: {
                        gte: new Date()
                    }
                },
                select: {
                    id: true
                }
            }
        )
        if (!selectedUser) {
            res.status(400).json({
                success: false,
                message: "Token je nevažeći li je istekao!",
            });
            return;
        }

        await prisma.user.update({
            where: {
                id: selectedUser.id
            },
            data: {
                isEmailVerified: true,
                emailVerificationToken: null,
                emailVerificationTokenResetExpires: null,

            }
        })

        res.status(201).json({
            success: true,
            data: {
                message: "Email je uspjesno verifikovan",
            },
        });

    } catch (error) {
        errorHelper.handle500(res)
    }
};

const logOut = async (req: Request, res: Response) => {
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
        errorHelper.handle404(res)
    }


}


const login = async (req: Request, res: Response) => {
    const { username, password, fcmToken } = req.body;
    const user = await prisma.user.findUnique({
        where: {
            username: username,
        },
        select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            username: true,
            password: true,
            isEmailVerified: true
        }
    });

    if (user == null) {
        res.status(401).json({
            success: false,
            message: "Email ili šifra nisu tačni!",
        });
        return;
    }

    if (!user.isEmailVerified) {
        res.status(401).json({
            success: false,
            message: "Emajl nije verifikovan",
        });
        return;
    }
    // await prisma.user.update(
    //     {
    //         where: {
    //             username: username,
    //         },
    //         data: {
    //              fcmToken: fcmToken
    //         }
    //     }
    // )
    let isCorrectPassword = false;
    if (user != null) {
        isCorrectPassword = await userHelper.compare(user?.password!, password);
    }
    if (!user || !isCorrectPassword) {
        res.status(401).json({
            success: false,
            message: "Email ili šifra nisu tačni!",
        });
        return;
    }
    const token = signToken(user.id);
    const { password: _, ...userWithoutSensitiveData } = user;
    res.status(200).json({
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
        const user = await prisma.user.findFirst({
            where: {
                email: email,
            },
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "Ne postoji korisnik sa upisanim email-om",
            });
            return;
        }
        const { emailToken, hashEmailToken, tokenExpires } =
            userHelper.createEmailToken();
        await prisma.user.update({
            where: {
                email: email,
            },
            data: {
                passwordResetToken: hashEmailToken,
                passwordResetExpires: tokenExpires
            }
        })
        await userHelper.sendEmail({
            email: email,
            subject: "Iskoristite ovaj token za reset šifre",
            token: emailToken,
            isForEmailVerification: false,
        },
            user.name
        );
        res.status(200).json({
            success: true,
            message: "Email je poslan",

        });
    } catch (error) {
        console.log(error)
        errorHelper.handle404(res)
    }
};



const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password, confirmPassword } = req.body;

        const hashResetToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const selectedUser = await prisma.user.findFirst(
            {
                where: {
                    passwordResetToken: hashResetToken,
                    passwordResetExpires: {
                        gte: new Date()
                    }
                },
                select: {
                    id: true
                }
            }
        )
        if (!selectedUser) {
            res.status(400).json({
                success: false,
                message: "Token je nevažeći li je istekao!",
            });
            return;
        }
        setNewPassword(password, confirmPassword, res, selectedUser.id);

    } catch (error) {
        errorHelper.handle404(res)
    }
};
const changePassword = async (req: Request, res: Response) => {
    try {
        const { oldPassword, password, confirmPassword, userId } = req.body;
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        let isCorrectPassword = false;
        if (user != null) {
            isCorrectPassword = await userHelper.compare(user?.password!, oldPassword);
        }
        if (!isCorrectPassword) {
            res.status(401).json({
                success: false,
                message: "Netačna šifra!",
            });
            return;
        }

        setNewPassword(password, confirmPassword, res, userId);
    } catch (error) {
        errorHelper.handle404(res)
    }
}

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
        res.status(500).json({
            success: false,
            message: "Internal Server Error"

        });
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





const setNewPassword = async (password: string, confirmPassword: string, res: Response, userId: string) => {
    if (password != confirmPassword) {
        res.status(400).json({
            success: false,
            message: "Šifre se ne poklapaju!",
        });
        return;
    }
    if (password.length < 8) {
        res.status(400).json({
            success: false,
            message: "Šifra mora da ima barem 8 karaktera!",
        });
    }
    if (password == confirmPassword) {

        const hashedPassword = await userHelper.hashPassword(password);

        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                password: hashedPassword
            }
        })

        res.status(200).json({
            success: true,
            message: "Šifra je promjenjena!",
        });

        return;
    }
}