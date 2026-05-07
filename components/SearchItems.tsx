"use client";

import { useEffect, useState } from "react";

import type { SearchResult } from "@/lib/types";

export function SearchItems() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function runSearch() {
      if (!query.trim()) {
        setResults([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/items?search=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Search failed");
        }
        const payload = await response.json();
        setResults(payload.items ?? []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResults([]);
          setError("Unable to search items right now.");
        }
      } finally {
        setLoading(false);
      }
    }

    void runSearch();

    return () => controller.abort();
  }, [query]);

  return (
    <section className="rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold">Search groceries</h2>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="mt-3 w-full rounded border border-gray-300 px-3 py-2"
        placeholder="Type an item name"
      />
      {loading ? <p className="mt-2 text-sm text-gray-500">Searching...</p> : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <ul className="mt-4 space-y-3">
        {results.map((item) => (
          <li key={item.id} className="rounded border border-gray-100 p-3">
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-gray-600">Category: {item.category ?? "Uncategorized"}</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
              {item.stock.length > 0 ? (
                item.stock.map((stock) => (
                  <li key={stock.location_id}>
                    {stock.location_name}: {stock.quantity} in stock
                    {stock.expiry ? ` (expires ${stock.expiry})` : ""}
                  </li>
                ))
              ) : (
                <li>No stock locations found.</li>
              )}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
