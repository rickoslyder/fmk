"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";

/**
 * Install banner that prompts users to install the PWA
 * Shows after a delay and can be dismissed
 * Handles both Chromium (automatic prompt) and iOS Safari (manual instructions)
 */
export function InstallBanner() {
  const { isInstallable, isInstalled, isIOS, isSafari, promptInstall } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Check if previously dismissed
  useEffect(() => {
    const dismissed = sessionStorage.getItem("fmk-install-dismissed");
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  // Show banner after delay if installable
  useEffect(() => {
    if (isInstallable && !isInstalled && !isDismissed) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, isDismissed]);

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    sessionStorage.setItem("fmk-install-dismissed", "true");
  };

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setShowBanner(false);
    }
  };

  // Determine if this is iOS Safari (needs manual instructions)
  const isIOSSafari = isIOS && isSafari;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-50 bg-card border rounded-lg shadow-lg p-4"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              {isIOSSafari ? (
                <Share className="h-5 w-5 text-primary" />
              ) : (
                <Download className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Install FMK</h3>
              {isIOSSafari ? (
                <p className="text-xs text-muted-foreground mt-1">
                  Tap the <Share className="h-3 w-3 inline-block mx-0.5" /> Share button, then &quot;Add to Home Screen&quot;
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Add to your home screen for the best experience
                </p>
              )}
              <div className="flex gap-2 mt-3">
                {!isIOSSafari && (
                  <Button size="sm" onClick={handleInstall}>
                    Install
                  </Button>
                )}
                <Button size="sm" variant={isIOSSafari ? "default" : "ghost"} onClick={handleDismiss}>
                  {isIOSSafari ? "Got it" : "Not now"}
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
