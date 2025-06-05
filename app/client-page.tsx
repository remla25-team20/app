"use client";

import { useState } from "react";

export default function ClientPage({ libVersion }: { libVersion: string }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // base url
  const baseUrl = "/model-service";

  // Send Prometheus-style frontend event to backend
  async function logFrontendMetric(eventName: string) {
    try {
      await fetch(`${baseUrl}/log-metric`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: eventName }),
      });
    } catch (err) {
      console.warn("Metric logging failed:", err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // log: user clicked submit
    await logFrontendMetric("frontend_submit_clicked");

    try {
      if (!baseUrl) {
        throw new Error("API base URL is not configured");
      }

      const params = new URLSearchParams({ review: text });
      const response = await fetch(`${baseUrl}/predict?${params.toString()}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to get prediction");
      }

      const data = await response.json();
      setResult(data.prediction);

      // log: result was received
      await logFrontendMetric("frontend_prediction_result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");

      // log: error occurred
      await logFrontendMetric("frontend_prediction_error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-8">
      <main className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-8">Text Sentiment Analysis</h1>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label htmlFor="text" className="block text-sm font-medium mb-2">
              Enter your text:
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Type your text here..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Analyzing..." : "Analyze Text"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {result !== null && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="text-lg">
              The text was considered{" "}
              <span
                className={
                  result === 1
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {result === 1 ? "positive" : "negative"}
              </span>
            </p>
          </div>
        )}
      </main>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>Version: {libVersion}</p>
      </footer>
    </div>
  );
}
