// storage.ts
export function saveItem<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getItem<T>(key: string): T | null {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}

export function removeItem(key: string) {
  localStorage.removeItem(key);
}


// src/lib/storage.ts
import { ShortURL } from "../types";

const STORAGE_KEY = "short_links";

function getAll(): ShortURL[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as ShortURL[]) : [];
}

function saveAll(urls: ShortURL[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
}

export function addShortLink(link: ShortURL) {
  const all = getAll();
  all.push(link);
  saveAll(all);
}

export function findByShortcode(shortcode: string): ShortURL | null {
  const all = getAll();
  return all.find(l => l.shortCode === shortcode) || null;
}

export function updateShortLink(updated: ShortURL) {
  const all = getAll().map(l => l.shortCode === updated.shortCode ? updated : l);
  saveAll(all);
}

export function clearAllLinks() {
  localStorage.removeItem(STORAGE_KEY);
}
