import { Router } from "express";
import { RedisManager } from "../RedisManager";
import { GET_BALANCE, GET_BALANCE_QUOTE } from "../types";
import jwt from "jsonwebtoken";

export const balanceRouter = Router();

balanceRouter.post("/base", async (req, res) => {
  const { jwtToken } = req.body;
  try {
    //@ts-ignore
    const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET as string) as { iat: number; exp: number; id: number };
    const decodedId = decodedToken.id;

    const response = await RedisManager.getInstance().sendAndAwait({
      type: GET_BALANCE,
      data: {
        //@ts-ignore
        userId: decodedToken.id,
      },
    });
    //@ts-ignore
    const balance = response.payload.balance;
    res.status(200).json({ balance });
  } catch (error) {
    return res.status(401).json({ msg: "Invalid token" });
  }
});

balanceRouter.post("/:quote", async (req, res) => {
  const { quote } = req.params;
  const { jwtToken } = req.body;
  try {
    //@ts-ignore
    const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET as string) as { iat: number; exp: number; id: number };
    const decodedId = decodedToken.id;

    const response = await RedisManager.getInstance().sendAndAwait({
      type: GET_BALANCE_QUOTE,
      data: {
        //@ts-ignore
        userId: decodedToken.id,
        quoteAsset: quote,
      },
    });
    //@ts-ignore
    const balance = response.payload.balance;
    res.status(200).json({ balance });
  } catch (error) {
    return res.status(401).json({ msg: "Invalid token" });
  }
});
