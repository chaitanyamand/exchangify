import { Router } from "express";
import { RedisManager } from "../RedisManager";
import { DEPOSIT, GET_BALANCE, WITHDRAW } from "../types";
import jwt from "jsonwebtoken";

export const withDrawDepositRouter = Router();

withDrawDepositRouter.post("/withdraw", async (req, res) => {
  const { jwtToken, amount } = req.body;
  try {
    //@ts-ignore
    const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET as string) as { iat: number; exp: number; id: number };

    const response = await RedisManager.getInstance().sendAndAwait({
      type: WITHDRAW,
      data: {
        //@ts-ignore
        userId: decodedToken.id,
        amount,
      },
    });
    //@ts-ignore
    const success = response.payload.success;
    res.status(200).json({ success });
  } catch (error) {
    return res.status(401).json({ msg: "Invalid token" });
  }
});

withDrawDepositRouter.post("/deposit", async (req, res) => {
  const { jwtToken, amount } = req.body;
  try {
    //@ts-ignore
    const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET as string) as { iat: number; exp: number; id: number };

    const response = await RedisManager.getInstance().sendAndAwait({
      type: DEPOSIT,
      data: {
        //@ts-ignore
        userId: decodedToken.id,
        amount,
      },
    });
    //@ts-ignore
    const success = response.payload.success;
    res.status(200).json({ success });
  } catch (error) {
    return res.status(401).json({ msg: "Invalid token" });
  }
});
