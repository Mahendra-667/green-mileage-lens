import { useSyncExternalStore } from "react";
import type { Assessment } from "./types";
import { parseAssessments } from "./records";
import type { Result } from "./calc";

export const STORAGE_KEY = "greenauto-lens.assessments.v1";
const EMPTY: Assessment[] = [];
let cache: Assessment[] | null = null;
const listeners = new Set<() => void>();
let storageError: string | null = null;
let unreadable = false;
const notify = () => listeners.forEach((l) => l());

function read(): Assessment[] {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  try {
    cache = parseAssessments(window.localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    cache = [];
    unreadable = true;
    storageError = "Saved records could not be read. Browser storage may be blocked or corrupted. No records were overwritten; export any open results or clear saved data to reset.";
  }
  return cache ?? EMPTY;
}

function write(next: Assessment[], reset = false): Result<void> {
  read();
  if (unreadable && !reset) return { ok: false, error: storageError ?? "Storage is unavailable." };
  try {
    const validated = parseAssessments(JSON.stringify(next));
    if (reset) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    cache = validated;
    unreadable = false;
    storageError = null;
    notify();
    return { ok: true, value: undefined };
  } catch {
    storageError = "Changes were not saved. Browser storage may be blocked, full, or the record invalid. Existing saved records are unchanged.";
    notify();
    return { ok: false, error: storageError };
  }
}

export const addAssessment = (a: Assessment) => write([a, ...read()]);
export const removeAssessment = (id: string) => write(read().filter((a) => a.id !== id));
export const clearAssessments = () => write([], true);

const subscribe = (l: () => void) => {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      cache = null;
      unreadable = false;
      storageError = null;
      read();
      notify();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
};

export function useStorageError() {
  return useSyncExternalStore(subscribe, () => { read(); return storageError; }, () => null);
}

export function useAssessments() {
  return useSyncExternalStore(
    subscribe,
    read,
    () => EMPTY,
  );
}
