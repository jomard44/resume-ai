"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

function ResultContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [tailoredResume, setTailoredResume] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError("No session found. Please start over.");
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/result?session_id=${sessionId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load result");
        }

        setTailoredResume(data.tailoredResume);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [sessionId]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tailoredResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center flex-1 px-4 py-20">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-6" />
          <h1 className="text-2xl font-bold mb-2">Tailoring Your Resume...</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Our AI is rewriting your resume to match the job. This takes 10–20
            seconds.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center flex-1 px-4 py-20">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-red-500">
            Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/tailor"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
          >
            Try Again
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center flex-1 px-4 py-12">
      <div className="max-w-3xl w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Your Tailored Resume</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Copy the text below and paste it into your resume document.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700 transition shrink-0"
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
            {tailoredResume}
          </pre>
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/tailor"
            className="rounded-lg border border-gray-300 dark:border-gray-700 px-6 py-3 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Tailor Another Resume
          </Link>
          <Link
            href="/"
            className="rounded-lg px-6 py-3 font-semibold text-gray-500 hover:text-gray-700 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-col items-center justify-center flex-1 px-4 py-20">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </main>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
