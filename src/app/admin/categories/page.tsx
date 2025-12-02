"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { CATEGORIES_DATA } from "@/data/categories";
import type { CustomCategory } from "@/types";
import {
  FolderOpen,
  Sparkles,
  Trash2,
  Users,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CategoryWithCount {
  id: string;
  name: string;
  type: "prebuilt" | "custom";
  peopleCount: number;
  createdAt?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<CategoryWithCount | null>(null);

  const loadCategories = async () => {
    try {
      // Get pre-built categories with counts
      const peopleByCat = await db.people.toArray();
      const countMap = new Map<string, number>();
      peopleByCat.forEach((p) => {
        countMap.set(p.categoryId, (countMap.get(p.categoryId) || 0) + 1);
      });

      const prebuilt: CategoryWithCount[] = CATEGORIES_DATA.map((cat) => ({
        id: cat.id,
        name: cat.name,
        type: "prebuilt" as const,
        peopleCount: countMap.get(cat.id) || 0,
      }));

      // Get custom categories
      const customCats = await db.customCategories.toArray();
      const custom: CategoryWithCount[] = customCats.map((cat) => ({
        id: cat.id,
        name: cat.name,
        type: "custom" as const,
        peopleCount: cat.people.length,
        createdAt: cat.createdAt,
      }));

      setCategories([...prebuilt, ...custom]);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await db.customCategories.delete(deleteTarget.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const prebuiltCategories = categories.filter((c) => c.type === "prebuilt");
  const customCategories = categories.filter((c) => c.type === "custom");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-muted-foreground mt-1">
          Manage pre-built and custom categories
        </p>
      </div>

      {/* Pre-built Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Pre-built Categories ({prebuiltCategories.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prebuiltCategories.map((cat) => (
            <Link key={cat.id} href={`/admin/categories/${cat.id}`}>
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-medium">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {cat.peopleCount} people
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Custom Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Custom Categories ({customCategories.length})
        </h2>

        {customCategories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>No custom categories created yet.</p>
              <p className="text-sm mt-1">
                Create one using AI generation or manual entry.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customCategories.map((cat) => (
              <Card key={cat.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <Link
                      href={`/admin/categories/${cat.id}?custom=true`}
                      className="flex-1"
                    >
                      <h3 className="font-medium hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {cat.peopleCount} people
                      </p>
                      {cat.createdAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {new Date(cat.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(cat)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Category
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
