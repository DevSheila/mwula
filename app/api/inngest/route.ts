import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { helloWorld } from "@/lib/inngest/function";
export  const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld, 
  ],
});



// import { NextResponse } from 'next/server';

// export async function GET() {
// return NextResponse.json({ message: 'Hello World' });
// }