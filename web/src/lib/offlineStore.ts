export interface OfflineWasteRecord {
  id?: number;
  client_offline_id: string;
  kitchen_id: number;
  food_item_id: number;
  food_item_name: string;
  quantity_kg: number;
  reason?: string;
  notes?: string;
  recorded_at: string;
  synced: boolean;
}

const DB_NAME = "FoodLoopOfflineDB";
const STORE_NAME = "pending_waste_records";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return;
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineWasteRecord(record: Omit<OfflineWasteRecord, "id" | "synced">): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const item: OfflineWasteRecord = {
      ...record,
      synced: false,
    };
    const req = store.add(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingWasteRecords(): Promise<OfflineWasteRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const records = req.result as OfflineWasteRecord[];
      resolve(records.filter((r) => !r.synced));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearSyncedRecords(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
