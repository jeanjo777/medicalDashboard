/**
 * Secure Storage Utility
 *
 * Provides a safe abstraction layer over localStorage/sessionStorage with:
 * - Type-safe getters/setters
 * - Error handling for quota exceeded
 * - Automatic fallback to sessionStorage
 * - Optional encryption for sensitive data
 * - Expiration support
 */

import logger from './logger';

interface StorageOptions {
  encrypt?: boolean;
  expiresIn?: number; // milliseconds
  useSession?: boolean; // Use sessionStorage instead of localStorage
}

interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

class SecureStorage {
  private readonly prefix: string = 'medic_';

  /**
   * Simple encryption (base64) - For production, use a proper encryption library
   * Note: This is NOT secure encryption, just obfuscation
   * For real security, integrate crypto-js or similar
   */
  private encrypt(data: string): string {
    try {
      return btoa(encodeURIComponent(data));
    } catch (error) {
      logger.error('Encryption failed', error as Error);
      return data;
    }
  }

  /**
   * Simple decryption (base64)
   */
  private decrypt(data: string): string {
    try {
      return decodeURIComponent(atob(data));
    } catch (error) {
      logger.warn('Decryption failed, returning raw data');
      return data;
    }
  }

  /**
   * Get the appropriate storage mechanism
   */
  private getStorage(useSession: boolean): Storage {
    return useSession ? sessionStorage : localStorage;
  }

  /**
   * Check if an item has expired
   */
  private isExpired(item: StorageItem<any>): boolean {
    if (!item.expiresAt) return false;
    return Date.now() > item.expiresAt;
  }

  /**
   * Get item from storage with type safety
   */
  getItem<T>(key: string, options: Pick<StorageOptions, 'encrypt' | 'useSession'> = {}): T | null {
    const { encrypt = false, useSession = false } = options;
    const storage = this.getStorage(useSession);
    const fullKey = this.prefix + key;

    try {
      const rawData = storage.getItem(fullKey);
      if (!rawData) return null;

      // Decrypt if needed
      const decryptedData = encrypt ? this.decrypt(rawData) : rawData;

      // Parse the stored item
      const item: StorageItem<T> = JSON.parse(decryptedData);

      // Check expiration
      if (this.isExpired(item)) {
        logger.debug(`Storage item expired: ${key}`);
        this.removeItem(key, { useSession });
        return null;
      }

      return item.value;
    } catch (error) {
      logger.error(`Error reading from storage: ${key}`, error as Error);
      // Try to remove corrupted data
      this.removeItem(key, { useSession });
      return null;
    }
  }

  /**
   * Set item in storage with type safety
   */
  setItem<T>(key: string, value: T, options: StorageOptions = {}): boolean {
    const { encrypt = false, expiresIn, useSession = false } = options;
    const storage = this.getStorage(useSession);
    const fullKey = this.prefix + key;

    const item: StorageItem<T> = {
      value,
      timestamp: Date.now(),
      expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
    };

    try {
      const serialized = JSON.stringify(item);
      const dataToStore = encrypt ? this.encrypt(serialized) : serialized;

      storage.setItem(fullKey, dataToStore);
      return true;
    } catch (error) {
      // Check if it's a quota exceeded error
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        logger.warn('Storage quota exceeded, attempting cleanup');

        // Try to clear old items and retry
        this.clearExpired();

        try {
          const serialized = JSON.stringify(item);
          const dataToStore = encrypt ? this.encrypt(serialized) : serialized;
          storage.setItem(fullKey, dataToStore);
          return true;
        } catch (retryError) {
          logger.error('Storage quota exceeded even after cleanup', retryError as Error);

          // Fallback to sessionStorage if we were using localStorage
          if (!useSession) {
            logger.info('Falling back to sessionStorage');
            return this.setItem(key, value, { ...options, useSession: true });
          }

          return false;
        }
      }

      logger.error(`Error writing to storage: ${key}`, error as Error);
      return false;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string, options: Pick<StorageOptions, 'useSession'> = {}): void {
    const { useSession = false } = options;
    const storage = this.getStorage(useSession);
    const fullKey = this.prefix + key;

    try {
      storage.removeItem(fullKey);

      // Also try to remove from the other storage (belt and suspenders)
      const otherStorage = this.getStorage(!useSession);
      otherStorage.removeItem(fullKey);
    } catch (error) {
      logger.error(`Error removing from storage: ${key}`, error as Error);
    }
  }

  /**
   * Clear all items with our prefix
   */
  clear(useSession: boolean = false): void {
    const storage = this.getStorage(useSession);

    try {
      const keysToRemove: string[] = [];

      // Collect all keys with our prefix
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      // Remove collected keys
      keysToRemove.forEach(key => storage.removeItem(key));

      logger.info(`Cleared ${keysToRemove.length} items from storage`);
    } catch (error) {
      logger.error('Error clearing storage', error as Error);
    }
  }

  /**
   * Clear all expired items
   */
  clearExpired(): void {
    [false, true].forEach(useSession => {
      const storage = this.getStorage(useSession);
      const keysToRemove: string[] = [];

      try {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (!key?.startsWith(this.prefix)) continue;

          const rawData = storage.getItem(key);
          if (!rawData) continue;

          try {
            const item: StorageItem<any> = JSON.parse(rawData);
            if (this.isExpired(item)) {
              keysToRemove.push(key);
            }
          } catch {
            // If we can't parse it, it's corrupted, remove it
            keysToRemove.push(key);
          }
        }

        keysToRemove.forEach(key => storage.removeItem(key));

        if (keysToRemove.length > 0) {
          logger.debug(`Cleared ${keysToRemove.length} expired items`);
        }
      } catch (error) {
        logger.error('Error clearing expired items', error as Error);
      }
    });
  }

  /**
   * Check if a key exists in storage
   */
  hasItem(key: string, useSession: boolean = false): boolean {
    return this.getItem(key, { useSession }) !== null;
  }

  /**
   * Get all keys with our prefix
   */
  getAllKeys(useSession: boolean = false): string[] {
    const storage = this.getStorage(useSession);
    const keys: string[] = [];

    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith(this.prefix)) {
          // Remove prefix before returning
          keys.push(key.substring(this.prefix.length));
        }
      }
    } catch (error) {
      logger.error('Error getting all keys', error as Error);
    }

    return keys;
  }

  /**
   * Get storage size (approximate, in bytes)
   */
  getSize(useSession: boolean = false): number {
    const storage = this.getStorage(useSession);
    let size = 0;

    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key?.startsWith(this.prefix)) continue;

        const value = storage.getItem(key);
        if (value) {
          // Approximate size: key length + value length in bytes (UTF-16)
          size += (key.length + value.length) * 2;
        }
      }
    } catch (error) {
      logger.error('Error calculating storage size', error as Error);
    }

    return size;
  }

  /**
   * Get available storage space (returns null if can't be determined)
   */
  getAvailableSpace(): number | null {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        const available = (estimate.quota || 0) - (estimate.usage || 0);
        logger.debug(`Storage available: ${(available / 1024 / 1024).toFixed(2)} MB`);
      });
    }
    return null;
  }
}

// Create singleton instance
const storage = new SecureStorage();

// Export as default
export default storage;

// Also export as named export
export { storage };

// Export the type for use in other files
export type { StorageOptions };

// Utility function to check storage availability
export const isStorageAvailable = (type: 'localStorage' | 'sessionStorage' = 'localStorage'): boolean => {
  try {
    const testKey = '__storage_test__';
    const testValue = 'test';
    const storageObj = type === 'localStorage' ? localStorage : sessionStorage;

    storageObj.setItem(testKey, testValue);
    storageObj.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};
