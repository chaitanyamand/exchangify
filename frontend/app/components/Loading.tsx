export const Loading=()=>{
    return (<div className="flex m-20 justify-center min-h-[100dvh] bg-[#0e0f14]">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center"></div>
          <h1 className="text-3xl sm:text-3xl md:text-4xl font-bold text-white">Loading...</h1>
          <p className="text-xl sm:text-xl md:text-2xl text-muted-foreground">Counting coins, crunching numbers... Your financial future is loading!</p>
        </div>
      </div>)

}
export default Loading;