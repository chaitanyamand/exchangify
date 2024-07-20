"use client";

import { usePathname } from "next/navigation";
import { PrimaryButton, SuccessButton } from "./core/Button"
import { useRouter } from "next/navigation";
import { useState,useEffect } from "react";
import {   handleLoginSignup } from "../utils/allMethods";
import { useSession } from "next-auth/react";

export type DepositWithdrawState = {isDepWith:false,depOrWith:null} | {isDepWith:true,depOrWith:"deposit" | "withdraw"}

export const Appbar = () => {
    const [login,setLogin] = useState<boolean>(false);
    const route = usePathname();
    const router = useRouter();
    const [depWith,setDepWith] =useState<DepositWithdrawState>({isDepWith:false,depOrWith:null})
    const [isOpenOrders,setIsOpenOrders]=useState<boolean>(false);
    const {data:session,status} = useSession();
    const pathArray = route.split("/");
    const market=pathArray[pathArray.length-1];

    useEffect(()=>{
        if(route=="/users/withdraw" || route=="/users/deposit")
        {
            setDepWith({isDepWith:true,depOrWith:route.endsWith("withdraw")?"withdraw":"deposit"})
        }
        else if(route.indexOf("openOrders")!=-1)
        {
            setIsOpenOrders(true);
        }
        else 
        {
            setDepWith({isDepWith:false,depOrWith:null});
            setIsOpenOrders(false);
        }
    },[route])

    const handleDeposit=()=>{
        setDepWith({isDepWith:true,depOrWith:"deposit" })
        router.push("/users/deposit");
    }

    const handleWithdraw=()=>{
        setDepWith({isDepWith:true,depOrWith:"withdraw" })
        router.push("/users/withdraw");
    }

    

    return <div className="text-white border-b border-slate-800">
        <div className="flex justify-between items-center p-2">
            <div className="flex">
                <div className={`text-xl pl-4 flex flex-col justify-center cursor-pointer text-white font-bold`} onClick={() => router.push('/')}>
                    Exchangify
                </div>
                <div className={`text-sm pt-1 flex flex-col justify-center pl-8 cursor-pointer ${route.startsWith('/markets') ? 'text-white' : 'text-slate-500'}`} onClick={() => router.push('/markets')}>
                    Markets
                </div>
                
            </div>
            <div className="flex">
                    {depWith.isDepWith?(depWith.depOrWith=="deposit"?
                        <div  className="p-2 mr-2">
                            <SuccessButton onClick={()=>{
                                setDepWith({isDepWith:true,depOrWith:"withdraw"})
                                router.push("/users/withdraw")
                            }}>Withdraw</SuccessButton>
                        </div>:<div  className="p-2 mr-2">
                            <PrimaryButton onClick={()=>{
                                setDepWith({isDepWith:true,depOrWith:"deposit"})
                                router.push("/users/deposit")
                            }}>Deposit</PrimaryButton>
                        </div>)
                    :(isOpenOrders?<div  className="p-2 mr-2">
                        <PrimaryButton onClick={()=>{
                            setIsOpenOrders(false)
                            router.push("/trade"+market)
                        }}>Back To Trades</PrimaryButton>
                    </div>:(status=="loading")?<div className="p-2 mr-2"><button disabled className="opacity-50 cursor-not-allowed h-[32px] px-3 py-1.5 mr-4">
        <span className="animate-pulse">•••</span>
      </button></div>:<div className="p-2 mr-2">

                    <SuccessButton onClick={status=="authenticated"?handleDeposit:handleLoginSignup}>{status=="authenticated"?`Deposit`:`Login/Signup`}</SuccessButton>
                    {(status=="authenticated")?<PrimaryButton onClick={handleWithdraw}>Withdraw</PrimaryButton>:null}
                </div>)}
                
            </div>
        </div>
    </div>
}