"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Piccolo store attorno a localStorage, letto con `useSyncExternalStore`:
 * durante l'idratazione React usa lo snapshot del server, poi riallinea.
 * Nessun `setState` in effetto e nessuna divergenza di markup.
 *
 * `memory` tiene la verità anche quando la scrittura è negata (modalità
 * privata, quota piena): la persistenza è un di più, l'interazione no.
 */

const PREFIX = "nvll:";

const listeners = new Set<() => void>();
const memory = new Map<string, string>();

function notify() {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key && !event.key.startsWith(PREFIX)) return;
  // Un'altra scheda ha scritto: la copia in memoria non è più autorevole.
  if (event.key) memory.delete(event.key.slice(PREFIX.length));
  else memory.clear();
  notify();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function readRaw(key: string): string | null {
  const local = memory.get(key);
  if (local !== undefined) return local;
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string) {
  memory.set(key, value);
  try {
    window.localStorage.setItem(PREFIX + key, value);
  } catch {
    /* resta solo in memoria per questa sessione */
  }
  notify();
}

const serverSnapshot = () => null;

function useRaw(key: string) {
  const getSnapshot = useCallback(() => readRaw(key), [key]);
  return useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
}

/** Flag booleano persistito. */
export function useStoredFlag(key: string, fallback = false) {
  const raw = useRaw(key);
  const value = raw === null ? fallback : raw === "true";
  const update = useCallback((next: boolean) => writeRaw(key, String(next)), [key]);
  return [value, update] as const;
}

function parseIds(raw: string | null): ReadonlySet<string> {
  if (raw === null) return new Set();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

/** Insieme di id persistito (like, salvataggi). */
export function useStoredSet(key: string) {
  const raw = useRaw(key);
  const ids = useMemo(() => parseIds(raw), [raw]);

  const toggle = useCallback(
    (id: string) => {
      // Si rilegge lo stato corrente: due toggle ravvicinati non si perdono.
      const next = new Set(parseIds(readRaw(key)));
      if (!next.delete(id)) next.add(id);
      writeRaw(key, JSON.stringify([...next]));
    },
    [key],
  );

  return [ids, toggle] as const;
}
