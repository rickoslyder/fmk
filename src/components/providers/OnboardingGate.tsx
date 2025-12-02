"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useOnboardingComplete } from "@/lib/db/hooks";
import { LoadingScreen } from "@/components/shared/LoadingSpinner";

interface OnboardingGateProps {
  children: React.ReactNode;
}

// Routes that don't require onboarding
const PUBLIC_ROUTES = ["/onboarding"];

export function OnboardingGate({ children }: OnboardingGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const onboardingComplete = useOnboardingComplete();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for onboarding status to be determined
    if (onboardingComplete === undefined) {
      return;
    }

    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    if (!onboardingComplete && !isPublicRoute) {
      // Redirect to onboarding
      router.replace("/onboarding");
    } else if (onboardingComplete && pathname === "/onboarding") {
      // If already onboarded, redirect away from onboarding page
      router.replace("/");
    } else {
      setIsChecking(false);
    }
  }, [onboardingComplete, pathname, router]);

  // Show loading while checking onboarding status
  if (isChecking && onboardingComplete === undefined) {
    return <LoadingScreen message="Loading..." />;
  }

  // Show loading during redirect
  if (isChecking) {
    return <LoadingScreen message="Loading..." />;
  }

  return <>{children}</>;
}
