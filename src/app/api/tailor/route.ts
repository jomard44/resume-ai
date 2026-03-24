import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { jobDescription, resume, sessionId } = await req.json();

    // Basic validation
    if (!jobDescription || !resume || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the Stripe session was paid (optional extra security)
    // In production, you'd verify sessionId against Stripe here
    // For MVP, the webhook already verified payment before user reaches this

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
          content: `## Job Description:\n${jobDescription}\n\n## Original Resume:\n${resume}`,
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
    console.error("Tailor API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
