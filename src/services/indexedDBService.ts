
export interface FileMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  expiryDate: Date; // Files expire after a certain period
  shareId: string;
}

class IndexedDBService {
  private dbName = 'p2pFileShareDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error('Error opening database:', event);
        reject(new Error('Could not open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create stores for files and metadata
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('metadata')) {
          const metadataStore = db.createObjectStore('metadata', { keyPath: 'id' });
          metadataStore.createIndex('shareId', 'shareId', { unique: true });
          metadataStore.createIndex('expiryDate', 'expiryDate', { unique: false });
        }
      };
    });
  }

  async storeFile(file: File): Promise<FileMetadata> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      // Generate a unique ID and a share ID for the file
      const id = crypto.randomUUID();
      const shareId = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Create file metadata with expiry date (7 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      
      const metadata: FileMetadata = {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date(),
        expiryDate,
        shareId
      };
      
      // Store the file data
      const fileTransaction = db.transaction(['files'], 'readwrite');
      const fileStore = fileTransaction.objectStore('files');
      const fileRequest = fileStore.put({
        id,
        data: file
      });
      
      fileRequest.onerror = (event) => {
        reject(new Error('Failed to store file data'));
      };
      
      fileRequest.onsuccess = () => {
        // Store the metadata
        const metadataTransaction = db.transaction(['metadata'], 'readwrite');
        const metadataStore = metadataTransaction.objectStore('metadata');
        const metadataRequest = metadataStore.put(metadata);
        
        metadataRequest.onerror = (event) => {
          reject(new Error('Failed to store file metadata'));
        };
        
        metadataRequest.onsuccess = () => {
          resolve(metadata);
        };
      };
    });
  }

  async getFileByShareId(shareId: string): Promise<{ metadata: FileMetadata; file: File } | null> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const metadataTransaction = db.transaction(['metadata'], 'readonly');
      const metadataStore = metadataTransaction.objectStore('metadata');
      const index = metadataStore.index('shareId');
      const metadataRequest = index.get(shareId);
      
      metadataRequest.onerror = () => {
        reject(new Error('Failed to fetch file metadata'));
      };
      
      metadataRequest.onsuccess = (event) => {
        const metadata = (event.target as IDBRequest).result as FileMetadata;
        
        if (!metadata) {
          resolve(null);
          return;
        }
        
        // Check if the file has expired
        if (new Date() > new Date(metadata.expiryDate)) {
          // File has expired, delete it
          this.deleteFile(metadata.id)
            .then(() => resolve(null))
            .catch(reject);
          return;
        }
        
        // Get the actual file data
        const fileTransaction = db.transaction(['files'], 'readonly');
        const fileStore = fileTransaction.objectStore('files');
        const fileRequest = fileStore.get(metadata.id);
        
        fileRequest.onerror = () => {
          reject(new Error('Failed to fetch file data'));
        };
        
        fileRequest.onsuccess = (event) => {
          const fileRecord = (event.target as IDBRequest).result;
          if (!fileRecord) {
            resolve(null);
            return;
          }
          
          resolve({
            metadata,
            file: fileRecord.data
          });
        };
      };
    });
  }

  async deleteFile(id: string): Promise<void> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      // Delete file data
      const fileTransaction = db.transaction(['files'], 'readwrite');
      const fileStore = fileTransaction.objectStore('files');
      const fileRequest = fileStore.delete(id);
      
      fileRequest.onerror = () => {
        reject(new Error('Failed to delete file'));
      };
      
      fileRequest.onsuccess = () => {
        // Delete metadata
        const metadataTransaction = db.transaction(['metadata'], 'readwrite');
        const metadataStore = metadataTransaction.objectStore('metadata');
        const metadataRequest = metadataStore.delete(id);
        
        metadataRequest.onerror = () => {
          reject(new Error('Failed to delete metadata'));
        };
        
        metadataRequest.onsuccess = () => {
          resolve();
        };
      };
    });
  }

  async cleanupExpiredFiles(): Promise<void> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const now = new Date();
      const transaction = db.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const index = store.index('expiryDate');
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);
      
      const expiredIds: string[] = [];
      
      request.onerror = () => {
        reject(new Error('Failed to fetch expired files'));
      };
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        
        if (cursor) {
          expiredIds.push(cursor.value.id);
          cursor.continue();
        } else {
          // Delete all expired files
          Promise.all(expiredIds.map(id => this.deleteFile(id)))
            .then(() => resolve())
            .catch(reject);
        }
      };
    });
  }
}

// Create a singleton instance
const indexedDBService = new IndexedDBService();
export default indexedDBService;
