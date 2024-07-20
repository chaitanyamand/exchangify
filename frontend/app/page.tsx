import { LandingButton } from "./components/LandingButton"

export default function Landing() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center bg-[#0f0f0f] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6">
          <ReplaceIcon className="h-16 w-16 text-white" />
        </div>
        <div className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-4xl">
          Seamless Asset Exchange 
        </div>
        <p className="mb-6 text-muted-foreground">
          Exchangify offers a secure and user-friendly platform for all your cryptocurrency trading needs.
        </p>
        <LandingButton/>
      </div>
    </div>
  )
}

function ReplaceIcon(props:{className:string}) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 4c0-1.1.9-2 2-2" />
      <path d="M20 2c1.1 0 2 .9 2 2" />
      <path d="M22 8c0 1.1-.9 2-2 2" />
      <path d="M16 10c-1.1 0-2-.9-2-2" />
      <path d="m3 7 3 3 3-3" />
      <path d="M6 10V5c0-1.7 1.3-3 3-3h1" />
      <rect width="8" height="8" x="2" y="14" rx="2" />
    </svg>
  )
}


function XIcon(props:{className:string}) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}