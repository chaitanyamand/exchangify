"use client"
import OpenOrders from "@/app/components/OpenOrders";
import { getOpenOrders } from "@/app/utils/httpClient";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { OpenOrder } from "@/app/utils/types";
import { usePathname } from "next/navigation";
import jwt from "jsonwebtoken"

const Orders = () => {
    const [orders, setOrders] = useState<OpenOrder[]>([])
    const { data: session, status } = useSession()
    const route = usePathname(); // Get market from URL
    const lastParam = route.split("/");
    const market = lastParam[lastParam.length - 1];

    const handleOrderDelete = (orderId:string) => {
        setOrders(prevOrders => prevOrders.filter(order => order.orderId !== orderId));
    };

    const fetchAndSetOrders = async (userId: number) => {
        
            const orders = await getOpenOrders(userId, market as string);
            setOrders(orders);
        
    }

    useEffect(() => {
        if (status === "authenticated" && session?.user?.jwtToken) {
            const decodedToken = jwt.decode(session.user.jwtToken) as { id: number };
            fetchAndSetOrders(decodedToken.id);
        } else {
            setOrders([]);
        }
    }, [session, status, market])

    return (
        <div className="m-10">
            <OpenOrders openOrders={orders} market={market} handleOrderDelete={handleOrderDelete}/>
        </div>
    )
}

export default Orders;