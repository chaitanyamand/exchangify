import { useEffect, useMemo, useState } from "react";
import { Trade } from "../utils/types";
import { getTrades } from "../utils/httpClient";
import { SignalingManager } from "../utils/SignalingManager";


const TradePage=({market}:{market:string})=>{
    const [trades,setTrades]=useState<Partial<Trade>[]>([]);

    function normalizeTimestamp(timestamp:number):number {
        if (timestamp < 1000000000000) {
          return timestamp * 1000; 
        }
        return timestamp;
      }

    const fetchAndSetTrades=async()=>{
        const response=await getTrades(market);
        const convertedResponse = response.map(trade=> {
            return {...trade,timestamp:normalizeTimestamp(trade.timestamp)}
        })
        setTrades(convertedResponse);
    }

    useEffect(()=>{
        fetchAndSetTrades();
    },[])

    useEffect(()=>{
        SignalingManager.getInstance().registerCallback("trade",(data:any)=>{
            setTrades((prev)=>{
                return [{price:data.price,quantity:data.quantity,timestamp:data.timestamp,id:data.id},...prev];
            })
        },`TRADE@${market}`)
        SignalingManager.getInstance().sendMessage({"method":"SUBSCRIBE","params":[`trade@${market}`]});

        return ()=>{
            SignalingManager.getInstance().sendMessage({"method":"UNSUBSCRIBE","params":[`trade@${market}`]});
            SignalingManager.getInstance().deRegisterCallback("trade",`TRADE@${market}`);
        }
    },[])

    const sortedTrades=useMemo(()=>{
        return [...trades].sort((a, b) => b.timestamp - a.timestamp);
    },[trades])

    return(<div>
            <div>
                <TableHeader/>
            </div>
            <div>
                {sortedTrades.slice(0,20).map(trade=> <EachTrade price={trade.price} quantity={trade.quantity} timestamp={trade.timestamp} key={trade.id}/>
                )}
            </div>
        </div>)
}

interface EachTradeProps {
    price: string;
    quantity: string;
    timestamp: number;
}

function TableHeader() {
    return <div className="flex justify-between text-xs">
    <div className="text-white">Price</div>
    <div className="text-slate-500">Quantity</div>
    <div className="text-slate-500">Time</div>
</div>
}

const EachTrade: React.FC<EachTradeProps> = ({ price, quantity, timestamp }) => {
    
    const formatTime = (timestamp: number): string => {
        const date = new Date(timestamp); 
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    const formattedTime = formatTime(timestamp);
    
    
    return (
        <div
            style={{
                display: "flex",
                position: "relative",
                width: "100%",
                backgroundColor: "transparent",
                overflow: "hidden",
                marginTop:"0.5rem",
                marginBottom:"0.5rem"
            }}
            
            
        >
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: `100%`,
                    height: "100%",
                    
                }}
            ></div>
            <div className="flex justify-between text-xs w-full">
                <div className="text-greenPrimaryButtonBackground font-semibold">{price}</div>
                <div>{quantity}</div>
                <div>{formattedTime}</div>
            </div>
        </div>
    )
}
export default TradePage;