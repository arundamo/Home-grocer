"use client";

import { useState } from "react";

import { AddItemForm } from "@/components/AddItemForm";
import { SearchItems } from "@/components/SearchItems";
import { StockView } from "@/components/StockView";
import { useImageRecognition } from "@/hooks/useImageRecognition";

export default function Home() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [recognizedProducts, setRecognizedProducts] = useState<
    Array<{ name: string; confidence: number; barcode: string | null }>
  >([]);
  const { loading, error, identifyShelfProducts } = useImageRecognition();

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const products = await identifyShelfProducts(file);
    setRecognizedProducts(products);
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold">Smart Home Grocery Manager</h1>
        <p className="mt-1 text-gray-600">
          Track groceries, find where items are stored, and manage stock by location.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <AddItemForm onItemCreated={() => setRefreshToken((value) => value + 1)} />
        <SearchItems />
      </div>

      <StockView refreshToken={refreshToken} />

      <section className="rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold">Shelf image recognition (placeholder)</h2>
        <p className="mt-1 text-sm text-gray-600">
          Upload a shelf image to simulate Gemini/GPT-4o product recognition output.
        </p>
        <input type="file" accept="image/*" className="mt-3" onChange={handleImageUpload} />
        {loading ? <p className="mt-2 text-sm text-gray-600">Analyzing image...</p> : null}
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <pre className="mt-3 overflow-x-auto rounded bg-gray-50 p-3 text-sm text-gray-800">
          {JSON.stringify(recognizedProducts, null, 2)}
        </pre>
      </section>
    </main>
  );
}
