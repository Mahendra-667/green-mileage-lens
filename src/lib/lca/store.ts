import { useSyncExternalStore } from "react";
import type { Assessment } from "./types";

// Browser-local persistence for the first milestone. Swap for a database-backed
// repository later; components only use these functions.
const KEY = "greenauto-lens.assessments.v1";
const EMPTY: Assessment[] = [];
let cache: Assessment[] | null = null;
const listeners = new Set<() => void>();

function read(): Assessment[] {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    cache = [];
  }
  return cache!;
}

function write(next: Assessment[]) {
  cache = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export const addAssessment = (a: Assessment) => write([a, ...read()]);
export const removeAssessment = (id: string) => write(read().filter((a) => a.id !== id));
export const clearAssessments = () => write([]);

export function useAssessments() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    read,
    () => EMPTY,
  );
}
