"use client";
import Loading from "@/app/components/Loading";
import { MarketBar } from "@/app/components/MarketBar";
import { SwapUI } from "@/app/components/SwapUI";
import { TradeView } from "@/app/components/TradeView";
import { Depth } from "@/app/components/depth/Depth";
import { getBalance } from "@/app/utils/httpClient";
import { signIn, useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import TradePage from "@/app/components/Trades";

type DepthOrTrade = "depth" | "trade"

export default function Page() {
    const { market } = useParams();
    const [userBalace,setUserBalace]=useState<number>(0);
    const [quoteBal,setQuoteBal]=useState<number>(0);
    const { data: session, status } = useSession();
    const [depthTrade,setDepthTrade]=useState<DepthOrTrade>("depth")
    
    useEffect(()=>{
        const fetchAndSetBalance = async () => {
            //@ts-ignore
            if (status === "authenticated" && session?.user?.jwtToken) {
                //@ts-ignore
                
                //@ts-ignore
                const balance = await getBalance(session.user.jwtToken,"INR");
                if(balance==-60) signIn();
                setUserBalace(balance);
                //@ts-ignore
                const quoteBalance = await getBalance(session.user.jwtToken,"TATA");
                if(quoteBal==-60) signIn();
                setQuoteBal(quoteBalance);
                
            }
        }


        fetchAndSetBalance()
    },[status,session])

    if (status === "loading") {
        return <Loading/>;
    }

    if(status === "unauthenticated")
    {
        
    }

    return <div className="flex flex-row flex-1">
        <div className="flex flex-col flex-1">
            <MarketBar market={market as string} />
            <div className="flex flex-row h-[920px] border-y border-slate-800">
                <div className="flex flex-col flex-1">
                    <TradeView market={market as string} />
                </div>
                <div className="flex flex-col w-[250px] overflow-hidden">
                    <div className="mb-2 flex justify-between p-2">
                        <div onClick={()=>{setDepthTrade("depth")}} className={depthTrade=="depth"?"underline underline-offset-8":"text-slate-500 cursor-pointer"}>Book</div>
                        <div onClick={()=>{setDepthTrade("trade")}} className={depthTrade=="trade"?"underline underline-offset-8":"text-slate-500 cursor-pointer"}>Trades</div>
                    </div>
                    {depthTrade=="depth"?
                    <Depth market={market as string} depthTrade={depthTrade} />:<TradePage market={market as string}/>} 
                </div>
            </div>
        </div>
        <div className="w-[10px] flex-col border-slate-800 border-l"></div>
        <div>
            <div className="flex flex-col w-[250px]">
                <SwapUI market={market as string} balance={userBalace} quoteBal={quoteBal}/>
            </div>
        </div>
    </div>
}