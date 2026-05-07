"use client";

import { useCallback, useState } from "react";

export type IdentifiedProduct = {
  name: string;
  confidence: number;
  barcode: string | null;
};

export function useImageRecognition() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identifyShelfProducts = useCallback(async (image: File): Promise<IdentifiedProduct[]> => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      return [
        {
          name: image.name.replace(/\.[^.]+$/, "") || "Unknown Product",
          confidence: 0.72,
          barcode: null,
        },
        {
          name: "Canned Beans",
          confidence: 0.61,
          barcode: "1234567890123",
        },
      ];
    } catch {
      setError("Failed to analyze image.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    identifyShelfProducts,
  };
}
