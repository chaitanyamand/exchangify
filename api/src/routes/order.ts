import { Router } from "express";
import { RedisManager } from "../RedisManager";
import { CREATE_ORDER, CANCEL_ORDER, ON_RAMP, GET_OPEN_ORDERS } from "../types";
import jwt from "jsonwebtoken";
export const orderRouter = Router();

orderRouter.post("/", async (req, res) => {
  const { market, price, quantity, side, jwtToken } = req.body;
  if (Number(price) == 0 || Number(quantity) == 0) return res.status(400).json({ msg: "Invalid inputs" });
  let userId = "0";
  try {
    const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET as string) as { id: number; iat: number; exp: number };
    userId = decodedToken.id.toString();
  } catch (error) {
    return res.status(401).json({ msg: "Invalid token" });
  }

  const response = await RedisManager.getInstance().sendAndAwait({
    type: CREATE_ORDER,
    data: {
      market,
      price,
      quantity,
      side,
      userId,
    },
  });
  res.status(200).json(response.payload);
});

orderRouter.delete("/", async (req, res) => {
  const { orderId, market } = req.body;
  const response = await RedisManager.getInstance().sendAndAwait({
    type: CANCEL_ORDER,
    data: {
      orderId,
      market,
    },
  });
  res.json(response.payload);
});

orderRouter.get("/open", async (req, res) => {
  const response = await RedisManager.getInstance().sendAndAwait({
    type: GET_OPEN_ORDERS,
    data: {
      userId: req.query.userId as string,
      market: req.query.market as string,
    },
  });

  res.json(response.payload);
});
