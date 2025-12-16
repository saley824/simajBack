import { NextFunction, Request, Response } from "express";
import errorHelper from "../helpers/error_helper";



const handleError = async (res: Response, message: string, statusCode: number, success: boolean) => {
  res.status(statusCode).json({
    success: success,
    message: "message",
  });;
};

const handle404 = async (res: Response,) => {

  res.status(404).json({
    success: false,
    message: "Error",
  });;
};
const handle500 = async (res: Response, req: Request) => {
  errorHelper.handle500(res, req);
};



export default {
  handleError,
  handle404,
  handle500,

};