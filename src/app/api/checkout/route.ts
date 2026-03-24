import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const { jobDescription, resume } = await req.json();

    if (!jobDescription || !resume) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Truncate to prevent abuse (max ~15K chars each, well within Stripe metadata limit after encoding)
    const truncatedJob = jobDescription.slice(0, 15000);
    const truncatedResume = resume.slice(0, 15000);

    // Encode the data as base64 and store in metadata
    // Stripe metadata values have a 500 char limit, so we store in the session's client_reference_id
    // and pass data via success URL params (encrypted/encoded)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "AI Resume Tailoring",
              description:
                "Your resume, rewritten to match the job description perfectly",
            },
            unit_amount: 400, // $4.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tailor`,
      metadata: {
        // Store a hash/identifier — the actual data is stored server-side
        type: "resume_tailor",
      },
    });

    // Store the job description and resume server-side keyed by session ID
    // For MVP, we use a simple in-memory store. Replace with a database in production.
    const { pendingJobs } = await import("@/lib/store");
    pendingJobs.set(session.id, {
      jobDescription: truncatedJob,
      resume: truncatedResume,
      paid: false,
      createdAt: Date.now(),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
