import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import OpenAI from "openai";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });
}

function getOpenAI() {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  // Prefer OpenRouter when configured so users can choose free/community models.
  if (openRouterKey) {
    return {
      client: new OpenAI({
        apiKey: openRouterKey,
        baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer":
            process.env.OPENROUTER_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
          "X-Title": process.env.OPENROUTER_APP_NAME || "ResumeTailor AI",
        },
      }),
      provider: "openrouter" as const,
      model:
        process.env.OPENROUTER_MODEL ||
        process.env.OPENAI_MODEL ||
        "meta-llama/llama-3.3-70b-instruct:free",
    };
  }

  return {
    client: new OpenAI({ apiKey: openAiKey }),
    provider: "openai" as const,
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  };
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error:
            "Server misconfiguration: STRIPE_SECRET_KEY is missing in environment variables.",
        },
        { status: 500 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Server misconfiguration: set OPENROUTER_API_KEY (recommended) or OPENAI_API_KEY.",
        },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const { sessionId, jobDescription, resume } = await req.json();

    if (!sessionId || !jobDescription || !resume) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify payment with Stripe
    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeError) {
      const message =
        stripeError instanceof Error
          ? stripeError.message
          : "Could not verify Stripe payment session";
      return NextResponse.json(
        { error: `Stripe verification failed: ${message}` },
        { status: 400 }
      );
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 402 }
      );
    }

    // Generate the tailored resume
    const { client, provider, model } = getOpenAI();
    let completion;
    try {
      completion = await client.chat.completions.create({
        model,
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
    } catch (openaiError) {
      const message =
        openaiError instanceof Error
          ? openaiError.message
          : `${provider} request failed`;
      return NextResponse.json(
        { error: `${provider} generation failed: ${message}` },
        { status: 502 }
      );
    }

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
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json(
      { error: `Failed to process request: ${message}` },
      { status: 500 }
    );
  }
}
