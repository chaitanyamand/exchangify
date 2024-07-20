import { signIn, signOut, useSession } from "next-auth/react";
import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { getTickers } from "./httpClient";
import { Ticker } from "./types";
import { DepositWithdrawState } from "../components/Appbar";

let tickersCache: Ticker[] = [];

setInterval(async () => {
  const tickers = await getTickers();
  tickersCache = tickers;
}, 15000);

interface Inputs {
  price: string;
  quantity: string;
}

export const handleLoginSignup = () => {
  signIn();
};

function trimLeadingZeroes(str: string): string {
  const trimmedStr = str.replace(/^0+/, "");
  if (trimmedStr == "") return "0";
  else if (trimmedStr.startsWith(".")) return "0" + trimmedStr;
  else return trimmedStr;
}

function isValidPositiveDecimalString(value: string) {
  const trimmed = value.trim();
  if (trimmed === "") return true;
  const positiveDecimalRegex = /^\d*\.?\d*$/;
  if (!positiveDecimalRegex.test(trimmed)) return false;
  if (trimmed === ".") return false;
  return true;
}

export const handleInputChange = (event: ChangeEvent<HTMLInputElement>, setInputs: Dispatch<SetStateAction<Inputs>>) => {
  const target = event.target;
  const { name, value } = target;
  setInputs((prev: any) => {
    if (value == "") return { ...prev, [name]: 0 };
    else if (name == "quantity") {
      if (!isValidPositiveDecimalString(value)) return prev;
    } else if (name == "price") {
      if (!isValidPositiveIntegerString(value)) return prev;
    }
    return { ...prev, [name]: trimLeadingZeroes(value) };
  });
};

function isValidPositiveIntegerString(value: string) {
  const trimmed = value.trim();
  if (trimmed === "") return true;
  const positiveIntegerRegex = /^\d+$/;
  return positiveIntegerRegex.test(trimmed);
}

export const handleAmountChange = (event: ChangeEvent<HTMLInputElement>, setAmount: Dispatch<SetStateAction<string>>) => {
  const value = event.target.value;
  setAmount((prev) => {
    if (value == "") return "0";
    else if (value.indexOf(".") != -1) return prev;
    else if (!isValidPositiveIntegerString(value)) return prev;
    return trimLeadingZeroes(value);
  });
};
