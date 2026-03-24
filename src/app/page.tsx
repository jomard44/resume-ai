import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 px-4">
      {/* Hero */}
      <section className="max-w-3xl text-center py-20">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Tailor Your Resume to <span className="text-blue-600">Any Job</span>{" "}
          in Seconds
        </h1>
        <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Paste a job description and your resume. Our AI rewrites your resume
          to match the job&apos;s keywords, tone, and requirements — so you land
          more interviews.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link
            href="/tailor"
            className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow hover:bg-blue-700 transition"
          >
            Tailor My Resume — $4
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl w-full py-16 border-t border-gray-200 dark:border-gray-800">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl mb-4">📋</div>
            <h3 className="font-semibold text-xl mb-2">1. Paste</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Paste the job description and your current resume.
            </p>
          </div>
          <div>
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="font-semibold text-xl mb-2">2. AI Tailors</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Our AI rewrites your resume to match the job&apos;s requirements
              and keywords.
            </p>
          </div>
          <div>
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="font-semibold text-xl mb-2">3. Apply</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Copy your tailored resume and apply with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-2xl w-full py-16 border-t border-gray-200 dark:border-gray-800 text-center">
        <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          No subscriptions. No hidden fees. Pay only when you need it.
        </p>
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-8 bg-white dark:bg-gray-900 shadow-sm">
          <p className="text-5xl font-extrabold">$4</p>
          <p className="text-gray-500 mt-2">per tailored resume</p>
          <ul className="mt-6 space-y-3 text-left max-w-xs mx-auto">
            <li className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span> AI-powered
              keyword matching
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span> Reformatted
              for the specific job
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span> Ready to copy
              &amp; paste in seconds
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span> Works for any
              job &amp; industry
            </li>
          </ul>
          <Link
            href="/tailor"
            className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-sm text-gray-400 border-t border-gray-200 dark:border-gray-800">
        © {new Date().getFullYear()} ResumeTailor AI. All rights reserved.
      </footer>
    </main>
  );
}
