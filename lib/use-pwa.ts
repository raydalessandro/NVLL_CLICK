"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Evento non ancora standardizzato: presente su Chromium, assente altrove.
 * Su iOS l'installazione passa dal menu di sistema e il prompt non esiste.
 */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** Stato di rete. Parte da `true` per non divergere dal markup del server. */
export function useOnline() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return online;
}

export function useInstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (nativeEvent: Event) => {
      // Trattenuto per offrire l'installazione da un punto scelto dall'app.
      nativeEvent.preventDefault();
      setEvent(nativeEvent as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setEvent(null);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!event) return;
    try {
      await event.prompt();
      await event.userChoice;
    } catch {
      /* prompt già consumato o annullato */
    } finally {
      setEvent(null);
    }
  }, [event]);

  return { canInstall: event !== null, install };
}

/** Registra il service worker. In sviluppo resta spento per non servire cache stantie. */
export function useServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registrazione fallita: l'app resta pienamente funzionante online.
      });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => window.removeEventListener("load", register);
  }, []);
}
