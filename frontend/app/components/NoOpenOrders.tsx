const NoOpenOrder=()=>{
    return (<div className="flex flex-col items-center justify-center min-h-[80vh] bg-background">
        <div className="max-w-md text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="mx-auto h-16 w-16 text-muted-foreground"
          >
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
            <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
          </svg>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">No orders found</h2>
          <p className="mt-2 text-muted-foreground">It looks like you haven't placed any orders yet for this market</p>
        </div>
      </div>)
}

export default NoOpenOrder;