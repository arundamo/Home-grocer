export type Location = {
  id: string;
  name: string;
  parent_id: string | null;
};

export type Item = {
  id: string;
  name: string;
  category: string | null;
  barcode: string | null;
};

export type InventoryRecord = {
  id: string;
  quantity: number;
  expiry: string | null;
  item: Item;
  location: Location;
};

export type SearchResult = {
  id: string;
  name: string;
  category: string | null;
  barcode: string | null;
  stock: Array<{
    quantity: number;
    expiry: string | null;
    location_id: string;
    location_name: string;
  }>;
};
