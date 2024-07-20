"use client"
import { useRouter } from "next/navigation";

export const LandingButton=()=>
{
    const router= useRouter();
    return (<div
        className="inline-flex cursor-pointer items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={()=>{router.push("/markets")}}
      >
        Get Started
      </div>)
}