import { Logger } from '../logging/Logger';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();
  private logger = new Logger('CacheManager');
  private defaultTTL: number;

  constructor(defaultTTLSeconds = 86400) {
    this.defaultTTL = defaultTTLSeconds * 1000;
  }

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const ttl = (ttlSeconds ?? this.defaultTTL / 1000) * 1000;
    this.cache.set(key, { value, expiresAt: Date.now() + ttl });
    this.logger.debug(`Cache set: ${key}`);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  evictExpired(): number {
    let evicted = 0;
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        evicted++;
      }
    }
    return evicted;
  }
}
