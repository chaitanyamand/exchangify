"use client";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { handleInputChange } from "../utils/allMethods";
import { createOrder, getBalance, getTicker, getTickers } from "../utils/httpClient";
import { Ticker } from "../utils/types";
import { toast } from "react-hot-toast";
import { signOut, useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";


interface Inputs
{
    price:string,
    quantity:string
}

type ActiveTab = "buy" | "sell"
type TypeOfMarket = "limit" | "market"


export function SwapUI({ market,balance ,quoteBal}: {market: string,balance:number,quoteBal:number}) {
    const [inputs, setInputs] = useState<Inputs>({price:"0",quantity:"0"});
    const [activeTab, setActiveTab] = useState<ActiveTab>('buy');
    const [type, setType] = useState<TypeOfMarket>('limit');
    const [estimateLoading,setEstimateLoading] = useState<boolean>(true);
    const [ticker,setTicker]=useState<Ticker | null>(null);
    const {data:session,status}=useSession();
    const [userBalance,setUserBalance]=useState<number>(balance);
    const [quoteBalance,setQuoteBalance]=useState<number>(quoteBal);
    const router= useRouter();

    useEffect(() => {
        setUserBalance(balance);
    }, [balance]);

    useEffect(() => {
        setQuoteBalance(quoteBal);
    }, [quoteBal]);

    const estimate = useMemo(()=>{
        if(type=="limit")
        {
            return Number(inputs.price)*Number(inputs.quantity);
        }
        else
        {
            if(estimateLoading)
            {
                return -1;
            }
            const priceOfQuote =  Number(ticker?.lastPrice)
            const twoPercentOfQuote = (priceOfQuote*2)/100;
            const totalEstimatePrice = activeTab=="buy"?(priceOfQuote+twoPercentOfQuote):(priceOfQuote-twoPercentOfQuote);
            return (totalEstimatePrice*Number(inputs.quantity)).toFixed(3);
        }
    },[inputs,type,activeTab])

    const fetchTicker = async () => { 
      const ticker = await getTicker(market);
      setTicker(ticker);
      setEstimateLoading(false);
    };

    useEffect(() => {
        fetchTicker();
        const intervalId = setInterval(fetchTicker, 15000);
        return () => clearInterval(intervalId);
      }, []);

      const handleOpenOrders=(event:any)=>{
        event.target.disabled=true;
        router.push("/users/openOrders/"+market);
      }

      const handleBuySell=async (event:any)=>{
        event.target.disabled=true;
        const toastId=toast.loading("Processing Transaction")
        //@ts-ignore
        if(status=="authenticated" && session?.user?.jwtToken)
        {
            if(Number(inputs.quantity)<=0 || (type=="limit" && Number(inputs.price)<=0))
            {
                toast.dismiss(toastId);
                toast.error("Invalid Inputs");
                event.target.disabled=false;
                return;
            }
            else if(activeTab=="buy" && Number(estimate)>userBalance)
            {
                toast.dismiss(toastId);
                toast.error("Insufficient Balance");
                event.target.disabled=false;
                return;

            }
            else if(activeTab=="sell" && Number(inputs.quantity)>quoteBalance)
            {
                toast.dismiss(toastId);
                toast.error("Insufficient Balance");
                event.target.disabled=false;
                return;
            }
            //@ts-ignore
            const params ={
                price:type=="market"?Number(estimate)/Number(inputs.quantity):Number(inputs.price),
                quantity:Number(inputs.quantity),
                side:activeTab,
                market:market,
                //@ts-ignore
                jwtToken:session.user.jwtToken
            }    
            //@ts-ignore
            const buySellResponse = await createOrder(params.price,params.quantity,params.side,params.market,params.jwtToken);
            //@ts-ignore
            if(buySellResponse.err)
            {
                console.log(buySellResponse)
                //@ts-ignore
                if(buySellResponse.err=="Invalid JWT Token")
                {
                    toast.dismiss(toastId);
                    //@ts-ignore
                    toast.error(buySellResponse.err);
                    signIn();
                }
                //@ts-ignore
                else if(buySellResponse.err=="Error placing order")
                {
                    toast.dismiss(toastId);
                    //@ts-ignore
                    toast.error(buySellResponse.err);
                }
            }    
            else 
            {
                toast.dismiss(toastId);
                toast(
                    (t) => (
                      <div>
                        <p>Order placed successfully with order id:</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                          <code 
                            style={{ 
                              padding: '5px', 
                              backgroundColor: '#f0f0f0', 
                              borderRadius: '4px', 
                              cursor: 'pointer' 
                            }}
                            onClick={() => {
                            //@ts-ignore
                              navigator.clipboard.writeText(buySellResponse.orderId);
                              toast.success('Order ID copied to clipboard!', { duration: 1500 });
                            }}
                          >
                            {
                            //@ts-ignore
                            buySellResponse.orderId}
                          </code>
                          <button 
                            onClick={() => toast.dismiss(t.id)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#0e0f14',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ),
                    {
                      duration: Infinity,
                    }
                  );
                  //@ts-ignore
                  if(activeTab=="buy")
                  {
                    const fetchedBalance=await getBalance(session?.user?.jwtToken,"INR");
                    if(fetchedBalance==-60) signIn();
                    setUserBalance(fetchedBalance);
                  }
                  else
                  {
                    const fetchedQuoteBalance=await getBalance(session?.user?.jwtToken,"TATA");
                    if(fetchedQuoteBalance==-60) signIn();
                    setQuoteBalance(fetchedQuoteBalance)
                  }
            }
        }
        else if(status=="unauthenticated")
        {
            toast.dismiss(toastId);
            toast.error("You are not logged in");
            signIn();
        }
        else 
        {
            toast.dismiss(toastId);
            toast.error("Wait till you are properly logged in");
        }
        setInputs({price:"0",quantity:"0"})
        event.target.disabled=false;
      }

    
    return <div>
        <div className="flex flex-col">
            <div className="flex flex-row h-[60px]">
                <BuyButton activeTab={activeTab} setActiveTab={setActiveTab} />
                <SellButton activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <div className="flex flex-col gap-1">
                <div className="px-3">
                    <div className="flex flex-row flex-0 gap-5 undefined">
                        <LimitButton type={type} setType={setType} />
                        <MarketButton type={type} setType={setType} />                       
                    </div>
                </div>
                <div className="flex flex-col px-3">
                    <div className="flex flex-col flex-1 gap-3 text-baseTextHighEmphasis">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between flex-row">
                                <p className="text-xs font-normal text-baseTextMedEmphasis">Available Balance</p>
                                <p className="font-medium text-xs text-baseTextHighEmphasis">{activeTab=="buy"?`INR ${userBalance}`  :`TATA ${quoteBalance}`} </p>
                            </div>
                        </div>
                        {type=="limit"?<div className="flex flex-col gap-2">
                            <p className="text-xs font-normal text-baseTextMedEmphasis">
                                Price
                            </p>
                            <div className="flex flex-col relative">
                                <input name="price" value={inputs.price} step="0.01" placeholder="0" className="h-12 rounded-lg border-2 border-solid border-baseBorderLight bg-[var(--background)] pr-12 text-right text-2xl leading-9 text-[$text] placeholder-baseTextMedEmphasis ring-0 transition focus:border-accentBlue focus:ring-0" type="text" onChange={(event)=>{handleInputChange(event,setInputs)}}/>
                                <div className="flex flex-row absolute right-1 top-1 p-2">
                                    <div className="relative">
                                        <img src="https://th.bing.com/th/id/OIP.KE_0kUzA1EocZdQ5IOZd3QHaHa?w=209&h=209&c=7&r=0&o=5&dpr=1.4&pid=1.7" className="w-6 h-6 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>:null}
                    </div>
                    <div className="flex flex-col gap-2 mt-3">
                        <p className="text-xs font-normal text-baseTextMedEmphasis">
                            Quantity
                        </p>
                        <div className="flex flex-col relative">
                            <input step="0.01" name="quantity" value={inputs.quantity} onChange={(event)=>{handleInputChange(event,setInputs)}} className="h-12 rounded-lg border-2 border-solid border-baseBorderLight bg-[var(--background)] pr-12 text-right text-2xl leading-9 text-[$text] placeholder-baseTextMedEmphasis ring-0 transition focus:border-accentBlue focus:ring-0" type="text"/>
                            <div className="flex flex-row absolute right-1 top-1 p-2">
                                <div className="relative">
                                    <img src="https://th.bing.com/th/id/OIP.LQl1H8mhbqKYP0sL1BDoIwAAAA?rs=1&pid=ImgDetMain" className="w-6 h-6 rounded-full" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end flex-row">
                            <p className="font-medium pr-2 text-xs text-baseTextMedEmphasis">≈ {estimate} INR</p>
                        </div>
                        
                    </div>
                    <button type="button" onClick={(event)=>{handleBuySell(event)}} className="font-semibold  focus:ring-blue-200 disabled:bg-green-300 focus:none focus:outline-none text-center h-12 rounded-xl text-base px-4 py-2 my-4 bg-greenPrimaryButtonBackground text-greenPrimaryButtonText active:scale-98">{activeTab=="buy"?"Buy":"Sell"}</button>
                    {status=="authenticated"?<button type="button" onClick={(event)=>{handleOpenOrders(event)}} className="font-semibold disabled:bg-blue-300  focus:ring-blue-200 focus:none focus:outline-none text-center h-12 rounded-xl text-base px-4 py-2 my-4 bg-blue-500 text-greenPrimaryButtonText active:scale-98">Open Orders</button>:null}
                    
            </div>
        </div>
    </div>
</div>
}

function LimitButton({ type, setType }: { type: string, setType: any }) {
    return <div className="flex flex-col cursor-pointer justify-center py-2" onClick={() => setType('limit')}>
    <div className={`text-sm font-medium py-1 border-b-2 ${type === 'limit' ? "border-accentBlue text-baseTextHighEmphasis" : "border-transparent text-baseTextMedEmphasis hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis"}`}>
        Limit
    </div>
</div>
}

function MarketButton({ type, setType }: { type: string, setType: any }) {
    return  <div className="flex flex-col cursor-pointer justify-center py-2" onClick={() => setType('market')}>
    <div className={`text-sm font-medium py-1 border-b-2 ${type === 'market' ? "border-accentBlue text-baseTextHighEmphasis" : "border-b-2 border-transparent text-baseTextMedEmphasis hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis"} `}>
        Market
    </div>
    </div>
}

function BuyButton({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: any }) {
    return <div className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${activeTab === 'buy' ? 'border-b-greenBorder bg-greenBackgroundTransparent' : 'border-b-baseBorderMed hover:border-b-baseBorderFocus'}`} onClick={() => setActiveTab('buy')}>
        <p className="text-center text-sm font-semibold text-greenText">
            Buy
        </p>
    </div>
}

function SellButton({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: any }) {
    return <div className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${activeTab === 'sell' ? 'border-b-redBorder bg-redBackgroundTransparent' : 'border-b-baseBorderMed hover:border-b-baseBorderFocus'}`} onClick={() => setActiveTab('sell')}>
        <p className="text-center text-sm font-semibold text-redText">
            Sell
        </p>
    </div>
}