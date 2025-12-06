import { Request, Response } from "express";
import userHelper from "../helpers/user_helper";


const testEmail = async (req: Request, res: Response) => {
    // userHelper.sendQRcode(
    //     "Paket",
    //     "obradovicaleksandar99@gmail.com",
    //     "LPA:1$bics.validspereachdpplus.com$E-RVFA-RLCXFSJ7DYL6FS6EUM-LW3H8ND4QGC4Z3F0A4P3NBLZQO40L6TPOXA3-O"
    // )

    return res.status(201).send("Created");


}






export default {
    testEmail,

};
