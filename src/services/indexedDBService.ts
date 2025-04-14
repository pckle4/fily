import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface FileDB extends DBSchema {
  files: {
    key: number;
    value: {
      metadata: FileMetadata;
      file: File;
    };
  };
}

let db: IDBPDatabase<FileDB> | null = null;

const initDB = async () => {
  db = await openDB<FileDB>('file-share-db', 1, {
    upgrade(db) {
      db.createObjectStore('files', { keyPath: 'metadata.id' });
    },
  });
};

const getDB = async (): Promise<IDBPDatabase<FileDB>> => {
  if (!db) {
    await initDB();
  }
  return db as IDBPDatabase<FileDB>;
};

export interface FileMetadata {
  id: number;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  expiryDate: Date;
  shareId: string;
}

export interface StoredFile {
  metadata: FileMetadata;
  file: File;
}

const indexedDBService = {
  db: null as IDBPDatabase<FileDB> | null,

  initDB: async () => {
    indexedDBService.db = await openDB<FileDB>('file-share-db', 1, {
      upgrade(db) {
        db.createObjectStore('files', { keyPath: 'metadata.id' });
      },
    });
  },

  getDB: async (): Promise<IDBPDatabase<FileDB>> => {
    if (!indexedDBService.db) {
      await indexedDBService.initDB();
    }
    return indexedDBService.db as IDBPDatabase<FileDB>;
  },

  storeFile: async (file: File, expiryMs: number = 7 * 24 * 60 * 60 * 1000): Promise<FileMetadata> => {
    const db = await indexedDBService.getDB();
    const transaction = db.transaction(['files'], 'readwrite');
    const store = transaction.objectStore('files');
    
    // Generate a unique share ID
    const shareId = Math.random().toString(36).substring(2, 10);
    
    // Current date
    const now = new Date();
    
    // Calculate expiry date based on the provided expiryMs
    const expiryDate = new Date(now.getTime() + expiryMs);
    
    const metadata: FileMetadata = {
      id: Date.now(),
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      uploadDate: now,
      expiryDate: expiryDate,
      shareId: shareId
    };
    
    const storedFile: StoredFile = {
      metadata: metadata,
      file: file
    };
    
    await store.add(storedFile);
    return metadata;
  },

  getFileByShareId: async (shareId: string): Promise<StoredFile | undefined> => {
    const db = await indexedDBService.getDB();
    const transaction = db.transaction(['files'], 'readonly');
    const store = transaction.objectStore('files');
    const cursor = await store.openCursor();

    let file: StoredFile | undefined;
    while (cursor) {
      if (cursor.value.metadata.shareId === shareId) {
        file = cursor.value;
        break;
      }
      cursor.continue();
    }

    return file;
  },

  getAllFiles: async (): Promise<StoredFile[]> => {
    const db = await indexedDBService.getDB();
    const transaction = db.transaction(['files'], 'readonly');
    const store = transaction.objectStore('files');
    return store.getAll();
  },

  updateFileExpiry: async (fileId: number, newExpiryMs: number): Promise<FileMetadata | null> => {
    const db = await indexedDBService.getDB();
    const transaction = db.transaction(['files'], 'readwrite');
    const store = transaction.objectStore('files');
    
    // Get the file first
    const storedFile = await store.get(fileId);
    
    if (!storedFile) {
      return null;
    }
    
    // Update expiry date
    const now = new Date();
    storedFile.metadata.expiryDate = new Date(now.getTime() + newExpiryMs);
    
    // Save updated file
    await store.put(storedFile);
    
    return storedFile.metadata;
  },

  deleteFile: async (fileId: number): Promise<void> => {
    const db = await indexedDBService.getDB();
    const transaction = db.transaction(['files'], 'readwrite');
    const store = transaction.objectStore('files');
    await store.delete(fileId);
  },

  cleanupExpiredFiles: async (): Promise<void> => {
    const db = await indexedDBService.getDB();
    const transaction = db.transaction(['files'], 'readwrite');
    const store = transaction.objectStore('files');
    const cursor = await store.openCursor();

    while (cursor) {
      if (cursor.value.metadata.expiryDate <= new Date()) {
        await cursor.delete();
      }
      cursor.continue();
    }
  },
};

export default indexedDBService;
