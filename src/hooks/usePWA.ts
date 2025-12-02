"use client";

import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  isIOS: boolean;
  isSafari: boolean;
}

/**
 * Hook for managing PWA functionality
 * - Install prompt
 * - Service worker registration
 * - Online/offline status
 */
export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isUpdateAvailable: false,
    isIOS: false,
    isSafari: false,
  });

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  // Check if app is installed (standalone mode) and detect platform
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

      // Detect iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as Window & { MSStream?: unknown }).MSStream;

      // Detect Safari (including iOS Safari)
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

      setState((prev) => ({
        ...prev,
        isInstalled: isStandalone,
        isIOS,
        isSafari,
        // iOS Safari is "installable" via Add to Home Screen
        isInstallable: isIOS && isSafari && !isStandalone,
      }));
    }
  }, []);

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setState((prev) => ({ ...prev, isInstallable: true }));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  // Handle app installed event
  useEffect(() => {
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setState((prev) => ({
        ...prev,
        isInstallable: false,
        isInstalled: true,
      }));
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Register service worker
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  setState((prev) => ({ ...prev, isUpdateAvailable: true }));
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  // Prompt to install
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setState((prev) => ({ ...prev, isInstallable: false }));

    return outcome === "accepted";
  }, [deferredPrompt]);

  // Reload to update
  const updateApp = useCallback(() => {
    window.location.reload();
  }, []);

  return {
    ...state,
    promptInstall,
    updateApp,
  };
}
