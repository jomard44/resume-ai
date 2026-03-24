import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import OpenAI from "openai";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });
}

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();

  try {
    const { sessionId, jobDescription, resume } = await req.json();

    if (!sessionId || !jobDescription || !resume) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 402 }
      );
    }

    // Generate the tailored resume
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert resume writer and career coach. Your job is to tailor a candidate's resume to perfectly match a specific job description.

Rules:
- Rewrite the resume to highlight skills, experiences, and keywords that match the job description
- Keep all factual information accurate — do NOT fabricate experience, companies, or degrees
- Naturally incorporate keywords and phrases from the job description
- Optimize the professional summary/objective for this specific role
- Reorder bullet points so the most relevant ones come first
- Use strong action verbs and quantify achievements where possible
- Keep the same general format and structure as the original resume
- Output ONLY the tailored resume text, no commentary or explanation`,
        },
        {
          role: "user",
          content: `## Job Description:\n${jobDescription.slice(0, 15000)}\n\n## Original Resume:\n${resume.slice(0, 15000)}`,
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const tailoredResume = completion.choices[0]?.message?.content;

    if (!tailoredResume) {
      return NextResponse.json(
        { error: "Failed to generate tailored resume" },
        { status: 500 }
      );
    }

    return NextResponse.json({ tailoredResume });
  } catch (error) {
    console.error("Result API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
