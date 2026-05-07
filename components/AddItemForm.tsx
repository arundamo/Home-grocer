"use client";

import { FormEvent, useEffect, useState } from "react";

import type { Location } from "@/lib/types";

const fallbackLocations = [
  { id: "fallback-kitchen-1", name: "Kitchen Cabinet 1", parent_id: null },
  { id: "fallback-kitchen-2", name: "Kitchen Cabinet 2", parent_id: null },
  { id: "fallback-freezer", name: "Basement Freezer", parent_id: null },
  { id: "fallback-shelf-1", name: "Pantry Shelf 1", parent_id: null },
];

type Props = {
  onItemCreated: () => void;
};

export function AddItemForm({ onItemCreated }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [barcode, setBarcode] = useState("");
  const [locationId, setLocationId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [expiry, setExpiry] = useState("");
  const [locations, setLocations] = useState<Location[]>(fallbackLocations);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadLocations() {
      const response = await fetch("/api/locations");
      const payload = await response.json();
      if (Array.isArray(payload.locations) && payload.locations.length > 0) {
        setLocations(payload.locations);
        setLocationId(payload.locations[0].id);
      } else {
        setLocationId(fallbackLocations[0].id);
      }
    }

    void loadLocations();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        category,
        barcode,
        location_id: locationId.startsWith("fallback-") ? null : locationId,
        quantity,
        expiry,
      }),
    });

    if (!response.ok) {
      const payload = await response.json();
      setStatus(payload.error ?? "Unable to add item");
      return;
    }

    setStatus("Item added successfully.");
    setName("");
    setCategory("");
    setBarcode("");
    setQuantity(1);
    setExpiry("");
    onItemCreated();
  }

  return (
    <section className="rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold">Add item</h2>
      <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
          placeholder="Item name"
        />
        <input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
          placeholder="Category"
        />
        <input
          value={barcode}
          onChange={(event) => setBarcode(event.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
          placeholder="Barcode"
        />
        <select
          value={locationId}
          onChange={(event) => setLocationId(event.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
        >
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="w-full rounded border border-gray-300 px-3 py-2"
          placeholder="Quantity"
        />
        <input
          type="date"
          value={expiry}
          onChange={(event) => setExpiry(event.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-700"
        >
          Save item
        </button>
      </form>
      {status ? <p className="mt-2 text-sm text-gray-600">{status}</p> : null}
    </section>
  );
}
