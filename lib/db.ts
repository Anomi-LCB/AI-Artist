import { WorkspaceCreation } from '../types';
import { blobToBase64 } from '../utils/fileUtils';

const DB_NAME = 'AIArtistDB';
const STORE_NAME = 'creations';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject(`IndexedDB error: ${(event.target as IDBOpenDBRequest).error}`);
    };
  });
};

export const addCreation = async (data: string | Blob, type: 'image' | 'video'): Promise<void> => {
  const db = await openDB();
  return new Promise(async (resolve, reject) => {
    let base64Data: string;
    if (type === 'image') {
        // Workspace expects a data URL, so ensure it's formatted correctly
        if (typeof data === 'string' && !data.startsWith('data:')) {
            base64Data = `data:image/png;base64,${data}`;
        } else {
            base64Data = data as string;
        }
    } else {
        base64Data = await blobToBase64(data as Blob);
    }

    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const newCreation = { base64: base64Data, type, createdAt: new Date() };
    const request = store.add(newCreation);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject((event.target as IDBRequest).error);
    transaction.oncomplete = () => db.close();
  });
};

export const getAllCreations = async (): Promise<WorkspaceCreation[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('createdAt');
    const creations: WorkspaceCreation[] = [];
    const cursorRequest = index.openCursor(null, 'prev'); // 'prev' for descending order

    cursorRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        creations.push(cursor.value);
        cursor.continue();
      } else {
        resolve(creations);
      }
    };
    
    cursorRequest.onerror = (event) => {
      reject((event.target as IDBRequest).error);
    };
    transaction.oncomplete = () => db.close();
  });
};

export const deleteCreation = async (id: number): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject((event.target as IDBRequest).error);
    transaction.oncomplete = () => db.close();
  });
};

export const clearAllCreations = async (): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject((event.target as IDBRequest).error);
        transaction.oncomplete = () => db.close();
    });
};
