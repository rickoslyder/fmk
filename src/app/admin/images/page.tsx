"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import type { CachedImage } from "@/lib/db/schema";
import { Trash2, ImageIcon, HardDrive, Clock, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CacheStats {
  totalImages: number;
  totalSizeMB: string;
  oldestImage: Date | null;
  newestImage: Date | null;
}

export default function ImagesPage() {
  const [images, setImages] = useState<CachedImage[]>([]);
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadImages = async () => {
    try {
      const cachedImages = await db.cachedImages
        .orderBy("lastAccessed")
        .reverse()
        .toArray();
      setImages(cachedImages);

      // Calculate stats
      const totalBytes = cachedImages.reduce(
        (sum, img) => sum + (img.imageBase64?.length || 0) * 0.75,
        0
      );

      const dates = cachedImages
        .map((img) => img.createdAt)
        .filter((d) => d)
        .sort((a, b) => a - b);

      setStats({
        totalImages: cachedImages.length,
        totalSizeMB: (totalBytes / (1024 * 1024)).toFixed(2),
        oldestImage: dates.length > 0 ? new Date(dates[0]) : null,
        newestImage:
          dates.length > 0 ? new Date(dates[dates.length - 1]) : null,
      });
    } catch (error) {
      console.error("Failed to load images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleClearCache = async () => {
    setClearing(true);
    try {
      await db.cachedImages.clear();
      setImages([]);
      setStats({
        totalImages: 0,
        totalSizeMB: "0",
        oldestImage: null,
        newestImage: null,
      });
      setClearConfirm(false);
    } catch (error) {
      console.error("Failed to clear cache:", error);
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      await db.cachedImages.delete(id);
      await loadImages();
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Image Cache</h1>
          <p className="text-muted-foreground mt-1">
            Manage cached celebrity images
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadImages}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {images.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setClearConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.totalImages}</p>
                <p className="text-sm text-muted-foreground">Cached Images</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <HardDrive className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.totalSizeMB} MB</p>
                <p className="text-sm text-muted-foreground">Cache Size</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-lg font-bold">
                  {stats.oldestImage
                    ? stats.oldestImage.toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">Oldest Entry</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-lg font-bold">
                  {stats.newestImage
                    ? stats.newestImage.toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">Newest Entry</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Image list */}
      {images.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No cached images.</p>
            <p className="text-sm mt-1">
              Images will be cached as you play games with people.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.slice(0, 50).map((img) => (
            <Card key={img.id} className="group relative overflow-hidden">
              <div className="aspect-square">
                {img.imageBase64 ? (
                  <img
                    src={img.imageBase64}
                    alt={img.personId}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                <p className="text-xs text-white text-center truncate w-full">
                  {img.personId}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleDeleteImage(img.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {images.length > 50 && (
        <p className="text-center text-muted-foreground">
          Showing first 50 of {images.length} cached images
        </p>
      )}

      {/* Clear confirmation */}
      <Dialog open={clearConfirm} onOpenChange={setClearConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Image Cache</DialogTitle>
            <DialogDescription>
              This will delete all {images.length} cached images (
              {stats?.totalSizeMB} MB). Images will be re-fetched as needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClearConfirm(false)}
              disabled={clearing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearCache}
              disabled={clearing}
            >
              {clearing ? "Clearing..." : "Clear Cache"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
