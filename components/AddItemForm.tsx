"use client";

import { FormEvent, useEffect, useState } from "react";

type SelectLocation = {
  value: string;
  id: string | null;
  name: string;
  parent_id: string | null;
};

const fallbackLocations: SelectLocation[] = [
  { value: "fallback-kitchen-1", id: null, name: "Kitchen Cabinet 1", parent_id: null },
  { value: "fallback-kitchen-2", id: null, name: "Kitchen Cabinet 2", parent_id: null },
  { value: "fallback-freezer", id: null, name: "Basement Freezer", parent_id: null },
  { value: "fallback-shelf-1", id: null, name: "Pantry Shelf 1", parent_id: null },
];

type Props = {
  onItemCreated: () => void;
};

export function AddItemForm({ onItemCreated }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [barcode, setBarcode] = useState("");
  const [locationId, setLocationId] = useState(fallbackLocations[0].value);
  const [quantity, setQuantity] = useState(1);
  const [expiry, setExpiry] = useState("");
  const [locations, setLocations] = useState<SelectLocation[]>(fallbackLocations);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadLocations() {
      try {
        const response = await fetch("/api/locations");
        if (!response.ok) {
          throw new Error("Could not load locations");
        }
        const payload = await response.json();
        if (Array.isArray(payload.locations) && payload.locations.length > 0) {
          const mapped = payload.locations.map(
            (location: { id: string; name: string; parent_id: string | null }) => ({
              ...location,
              value: location.id,
            }),
          );
          setLocations(mapped);
          setLocationId(mapped[0].value);
          return;
        }
        setLocationId(fallbackLocations[0].value);
      } catch {
        setStatus("Unable to connect to the server. Using offline location list.");
        setLocationId(fallbackLocations[0].value);
      }
    }

    void loadLocations();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selectedLocation = locations.find((location) => location.value === locationId);

    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        category,
        barcode,
        location_id: selectedLocation?.id,
        location_name: selectedLocation?.name,
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
            <option key={location.value} value={location.value}>
              {location.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
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
