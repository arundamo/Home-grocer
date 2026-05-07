"use client";

import { useEffect, useMemo, useState } from "react";

import type { InventoryRecord, Location } from "@/lib/types";

type RawInventory = {
  id: string;
  quantity: number;
  expiry: string | null;
  items: {
    id: string;
    name: string;
    category: string | null;
    barcode: string | null;
  };
  locations: {
    id: string;
    name: string;
    parent_id: string | null;
  };
};

type Props = {
  refreshToken: number;
};

export function StockView({ refreshToken }: Props) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      const [locationsResponse, inventoryResponse] = await Promise.all([
        fetch("/api/locations"),
        fetch("/api/inventory"),
      ]);

      const locationsPayload = await locationsResponse.json();
      const inventoryPayload = await inventoryResponse.json();

      const nextLocations: Location[] = locationsPayload.locations ?? [];
      setLocations(nextLocations);

      if (nextLocations.length > 0 && !selectedLocationId) {
        setSelectedLocationId(nextLocations[0].id);
      }

      const rows: RawInventory[] = inventoryPayload.inventory ?? [];
      const normalized: InventoryRecord[] = rows
        .filter((row) => row.items && row.locations)
        .map((row) => ({
          id: row.id,
          quantity: row.quantity,
          expiry: row.expiry,
          item: row.items,
          location: row.locations,
        }));

      setInventory(normalized);
    }

    void loadData();
  }, [refreshToken, selectedLocationId]);

  const visibleRows = useMemo(
    () => inventory.filter((row) => row.location.id === selectedLocationId),
    [inventory, selectedLocationId],
  );

  return (
    <section className="rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold">Stock view by location</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {locations.map((location) => (
          <button
            key={location.id}
            onClick={() => setSelectedLocationId(location.id)}
            className={`rounded px-3 py-2 text-sm ${
              selectedLocationId === location.id
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {location.name}
          </button>
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {visibleRows.length > 0 ? (
          visibleRows.map((row) => (
            <li key={row.id} className="rounded border border-gray-100 p-3">
              <p className="font-medium">{row.item.name}</p>
              <p className="text-sm text-gray-600">Qty: {row.quantity}</p>
              {row.expiry ? <p className="text-sm text-gray-600">Expiry: {row.expiry}</p> : null}
            </li>
          ))
        ) : (
          <li className="text-sm text-gray-500">No items in this location.</li>
        )}
      </ul>
    </section>
  );
}
