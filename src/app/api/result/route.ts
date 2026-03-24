import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { pendingJobs } from "@/lib/store";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });
}

export async function GET(req: NextRequest) {
  const stripe = getStripe();
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    // Verify payment with Stripe directly
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 402 }
      );
    }

    // Check if we already generated the tailored resume
    const job = pendingJobs.get(sessionId);

    if (!job) {
      return NextResponse.json(
        { error: "Session not found or expired. Please try again." },
        { status: 404 }
      );
    }

    // Mark as paid (in case webhook hasn't fired yet)
    job.paid = true;

    // If already generated, return cached result
    if (job.tailoredResume) {
      return NextResponse.json({ tailoredResume: job.tailoredResume });
    }

    // Generate the tailored resume
    const tailorRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/tailor`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: job.jobDescription,
          resume: job.resume,
          sessionId,
        }),
      }
    );

    if (!tailorRes.ok) {
      return NextResponse.json(
        { error: "Failed to generate tailored resume" },
        { status: 500 }
      );
    }

    const { tailoredResume } = await tailorRes.json();

    // Cache the result
    job.tailoredResume = tailoredResume;

    return NextResponse.json({ tailoredResume });
  } catch (error) {
    console.error("Result API error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
