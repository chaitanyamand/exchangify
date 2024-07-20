"use client"

import { deposit, getBalance, withdraw } from "@/app/utils/httpClient";
import { signIn, signOut, useSession } from "next-auth/react";
import {  ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/app/components/Loading";
import { handleAmountChange } from "@/app/utils/allMethods";
import { eventNames } from "process";
import { toast } from "react-hot-toast";


const Withdraw = ()=>{
    const {  data:session,status } = useSession();
    const [userBalance, setUserBalance] = useState<number>(0);
    const router = useRouter();
    const [amount,setAmount]=useState<string>("0")
    

    const fetchAndSetBalance = async () => {
        //@ts-ignore
        if (status === "authenticated" && session?.user?.jwtToken) {
            
            //@ts-ignore
            const balance = await getBalance(session.user.jwtToken,"INR");
            if(balance==-60) signIn();
            setUserBalance(balance);
            
        }
    }

    useEffect(() => {
        fetchAndSetBalance();
    }, [status, session]);

    if (status === "loading") {
        return <Loading/>;
    }

    if (status === "unauthenticated") {
        router.push("/");
        return null;
    }

    const handleWithdrawClick=async()=>{
      const toastId=toast.loading("Processing Transaction..")
      if(Number(amount)<=0) 
      {
        toast.dismiss(toastId)
        toast.error("Enter Valid Amount",{
          duration:1500,
        })
        
          return;
      }
      await fetchAndSetBalance();
      if(userBalance<Number(amount))
      {
        toast.dismiss(toastId);
        toast.error("Insufficient Balance");
          return;
      }

      //@ts-ignore
      const withdrawResponse=await withdraw(session?.user?.jwtToken,Number(amount));
      
      if(withdrawResponse.status=="success")
      {
        toast.dismiss(toastId);
        toast.success("Transaction Successful")
        router.push("/");
      }
      else if(withdrawResponse.status=="invalid jwt token")
      {
        toast.dismiss(toastId)
        toast.error("Invalid JWT Token")
        signIn();
        return;
      }
      else 
      {
        toast.dismiss(toastId)
        toast.error("Error Withdrawing Money")
        return;
      }
      }

    return <div className="dark">
    <div className="rounded-lg border my-20 bg-card text-card-foreground shadow-sm w-full max-w-md mx-auto " data-v0-t="card">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight">Withdraw Amount</h3>
        <p className="text-sm text-muted-foreground">Enter the amount you would like to Withdraw from your account.</p>
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="amount"
          >
            Withdraw Amount
          </label>
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right"
            type="text"
            name="amount"
            id="amount"
            value={amount}
            onChange={(event)=>{
              handleAmountChange(event,setAmount)
            }}
            placeholder="Enter amount"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Current Balance
            </label>
            <p className="text-lg font-medium">INR {userBalance}</p>
          </div>
        </div>
      </div>
      <div className="items-center p-6 flex justify-between">
        <button onClick={()=>{router.push("/")}} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
          Cancel
        </button>
        <button onClick={handleWithdrawClick} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          Withdraw
        </button>
      </div>
    </div>
  </div>
}
export default Withdraw;