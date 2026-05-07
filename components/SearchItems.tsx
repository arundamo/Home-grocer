"use client";

import { useEffect, useState } from "react";

import type { SearchResult } from "@/lib/types";

export function SearchItems() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function runSearch() {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      const response = await fetch(`/api/items?search=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });
      const payload = await response.json();
      setResults(payload.items ?? []);
      setLoading(false);
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
      <ul className="mt-4 space-y-3">
        {results.map((item) => (
          <li key={item.id} className="rounded border border-gray-100 p-3">
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-gray-600">Category: {item.category ?? "Uncategorized"}</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
              {item.stock.length > 0 ? (
                item.stock.map((stock, index) => (
                  <li key={`${stock.location_id}-${index}`}>
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
