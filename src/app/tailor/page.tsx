"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TailorPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Create Stripe checkout session
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, resume }),
      });

      if (!checkoutRes.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await checkoutRes.json();
      // Save data to localStorage so it survives the Stripe redirect
      localStorage.setItem(
        "resumeTailorData",
        JSON.stringify({ jobDescription, resume })
      );
      // Redirect to Stripe Checkout
      router.push(url);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center flex-1 px-4 py-12">
      <div className="max-w-3xl w-full">
        <h1 className="text-3xl font-bold mb-2">Tailor Your Resume</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Paste the job description and your current resume below. After
          payment, you&apos;ll get your tailored resume instantly.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="jobDescription"
              className="block text-sm font-semibold mb-2"
            >
              Job Description
            </label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={8}
              required
              minLength={50}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>

          <div>
            <label
              htmlFor="resume"
              className="block text-sm font-semibold mb-2"
            >
              Your Current Resume
            </label>
            <textarea
              id="resume"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your current resume here..."
              rows={12}
              required
              minLength={50}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Redirecting to payment..."
              : "Pay $4 & Tailor My Resume"}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Secure payment via Stripe. Your data is never stored permanently.
          </p>
        </form>
      </div>
    </main>
  );
}
