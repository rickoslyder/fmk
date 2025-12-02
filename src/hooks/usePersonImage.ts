"use client";

import { useState, useEffect } from "react";
import { fetchPersonImage, type ImageFetchStatus } from "@/lib/images";
import type { Person, CustomPerson } from "@/types";

interface UsePersonImageResult {
  imageUrl: string | null;
  status: ImageFetchStatus;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch and cache a person's image
 */
export function usePersonImage(person: Person | CustomPerson): UsePersonImageResult {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ImageFetchStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchImage = async () => {
    // Custom people might have their own base64 image
    if ("imageBase64" in person && person.imageBase64) {
      setImageUrl(person.imageBase64);
      setStatus("success");
      return;
    }

    // Custom people without images get a placeholder
    if ("listId" in person) {
      setStatus("error");
      setError("No image");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const result = await fetchPersonImage(person as Person);

      if (result.status === "success" && result.imageUrl) {
        setImageUrl(result.imageUrl);
        setStatus("success");
      } else {
        setStatus("error");
        setError(result.error || "Failed to load image");
      }
    } catch (err) {
      setStatus("error");
      setError("Failed to load image");
      console.error("usePersonImage error:", err);
    }
  };

  useEffect(() => {
    fetchImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person.id]);

  return {
    imageUrl,
    status,
    error,
    refetch: fetchImage,
  };
}
