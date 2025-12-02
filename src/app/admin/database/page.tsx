"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { seedCategories } from "@/lib/db/seed";
import {
  Download,
  Upload,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Database,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TableInfo {
  name: string;
  count: number;
}

export default function DatabasePage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<
    "reset" | "clear-all" | "reseed" | null
  >(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadTableInfo = async () => {
    try {
      const [
        preferences,
        people,
        customPeople,
        customCategories,
        customLists,
        gameHistory,
        cachedImages,
      ] = await Promise.all([
        db.preferences.count(),
        db.people.count(),
        db.customPeople.count(),
        db.customCategories.count(),
        db.customLists.count(),
        db.gameHistory.count(),
        db.cachedImages.count(),
      ]);

      setTables([
        { name: "preferences", count: preferences },
        { name: "people", count: people },
        { name: "customPeople", count: customPeople },
        { name: "customCategories", count: customCategories },
        { name: "customLists", count: customLists },
        { name: "gameHistory", count: gameHistory },
        { name: "cachedImages", count: cachedImages },
      ]);
    } catch (error) {
      console.error("Failed to load table info:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTableInfo();
  }, []);

  const handleExport = async () => {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        version: 1,
        preferences: await db.preferences.toArray(),
        people: await db.people.toArray(),
        customPeople: await db.customPeople.toArray(),
        customCategories: await db.customCategories.toArray(),
        customLists: await db.customLists.toArray(),
        gameHistory: await db.gameHistory.toArray(),
        // Excluding cached images to reduce file size
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fmk-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setMessage({ type: "success", text: "Database exported successfully!" });
    } catch (error) {
      console.error("Export failed:", error);
      setMessage({ type: "error", text: "Failed to export database" });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.version || !data.exportedAt) {
        throw new Error("Invalid backup file format");
      }

      setProcessing(true);

      // Import data
      if (data.preferences?.length) {
        await db.preferences.clear();
        await db.preferences.bulkAdd(data.preferences);
      }

      if (data.people?.length) {
        await db.people.clear();
        await db.people.bulkAdd(data.people);
      }

      if (data.customPeople?.length) {
        await db.customPeople.clear();
        await db.customPeople.bulkAdd(data.customPeople);
      }

      if (data.customCategories?.length) {
        await db.customCategories.clear();
        await db.customCategories.bulkAdd(data.customCategories);
      }

      if (data.customLists?.length) {
        await db.customLists.clear();
        await db.customLists.bulkAdd(data.customLists);
      }

      if (data.gameHistory?.length) {
        await db.gameHistory.clear();
        await db.gameHistory.bulkAdd(data.gameHistory);
      }

      await loadTableInfo();
      setMessage({
        type: "success",
        text: `Imported data from ${new Date(data.exportedAt).toLocaleDateString()}`,
      });
    } catch (error) {
      console.error("Import failed:", error);
      setMessage({ type: "error", text: "Failed to import: Invalid file" });
    } finally {
      setProcessing(false);
      e.target.value = "";
    }
  };

  const handleAction = async () => {
    if (!action) return;

    setProcessing(true);
    try {
      switch (action) {
        case "reset":
          // Clear user data but keep seeded data
          await db.preferences.clear();
          await db.customPeople.clear();
          await db.customCategories.clear();
          await db.customLists.clear();
          await db.gameHistory.clear();
          await db.cachedImages.clear();
          setMessage({ type: "success", text: "User data cleared" });
          break;

        case "clear-all":
          // Clear everything
          await db.delete();
          window.location.reload();
          break;

        case "reseed":
          // Re-seed the database
          await db.people.clear();
          await seedCategories();
          setMessage({ type: "success", text: "Database re-seeded" });
          break;
      }

      await loadTableInfo();
    } catch (error) {
      console.error("Action failed:", error);
      setMessage({ type: "error", text: "Operation failed" });
    } finally {
      setProcessing(false);
      setAction(null);
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
      <div>
        <h1 className="text-3xl font-bold">Database</h1>
        <p className="text-muted-foreground mt-1">
          Manage and maintain your FMK database
        </p>
      </div>

      {/* Message */}
      {message && (
        <Card
          className={
            message.type === "success"
              ? "border-green-500 bg-green-500/10"
              : "border-destructive bg-destructive/10"
          }
        >
          <CardContent className="p-4 flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
            <span>{message.text}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setMessage(null)}
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Tables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tables.map((table) => (
              <div key={table.name} className="p-3 rounded-lg bg-secondary">
                <p className="text-sm text-muted-foreground">{table.name}</p>
                <p className="text-xl font-bold">{table.count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export/Import */}
        <Card>
          <CardHeader>
            <CardTitle>Backup & Restore</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Export your data for backup or import from a previous backup.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleExport} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImport}
                    disabled={processing}
                  />
                </label>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Reset data or re-initialize the database.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => setAction("reseed")}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-seed Categories
              </Button>
              <Button
                variant="outline"
                onClick={() => setAction("reset")}
                className="text-yellow-500 hover:text-yellow-500"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Clear User Data
              </Button>
              <Button
                variant="destructive"
                onClick={() => setAction("clear-all")}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Everything
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!action} onOpenChange={() => setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirm Action
            </DialogTitle>
            <DialogDescription>
              {action === "reset" && (
                <>
                  This will clear all user data including preferences, custom
                  categories, and game history. Pre-built categories will be
                  preserved.
                </>
              )}
              {action === "clear-all" && (
                <>
                  This will delete the entire database and reload the page. All
                  data will be lost permanently!
                </>
              )}
              {action === "reseed" && (
                <>
                  This will reload all pre-built category data from the source
                  files. Existing people will be replaced.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAction(null)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant={action === "clear-all" ? "destructive" : "default"}
              onClick={handleAction}
              disabled={processing}
            >
              {processing ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
