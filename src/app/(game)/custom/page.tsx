"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, PlusCircle, List, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CustomCategoryForm, CategoryReviewModal, ManualCategoryForm } from "@/components/categories";
import { db } from "@/lib/db";
import { useCustomCategories } from "@/lib/db/hooks";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import type { Person, CustomCategory } from "@/types";
import Link from "next/link";

type FormMode = "none" | "ai" | "manual";

export default function CustomPage() {
  const router = useRouter();
  const customCategories = useCustomCategories();
  const isOnline = useOnlineStatus();

  const [formMode, setFormMode] = useState<FormMode>("none");
  const [generatedPeople, setGeneratedPeople] = useState<Person[]>([]);
  const [generatedCategoryName, setGeneratedCategoryName] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleGenerate = (people: Person[], categoryName: string) => {
    setGeneratedPeople(people);
    setGeneratedCategoryName(categoryName);
    setShowReviewModal(true);
  };

  const handleSave = async (people: Person[]) => {
    const category: CustomCategory = {
      id: `custom-${Date.now()}`,
      name: generatedCategoryName,
      icon: "sparkles",
      type: "custom",
      prompt: generatedCategoryName,
      createdAt: Date.now(),
      people,
    };

    await db.customCategories.add(category);
    setShowReviewModal(false);
    setFormMode("none");
    setGeneratedPeople([]);
  };

  const handleSaveAndPlay = async (people: Person[]) => {
    const categoryId = `custom-${Date.now()}`;
    const category: CustomCategory = {
      id: categoryId,
      name: generatedCategoryName,
      icon: "sparkles",
      type: "custom",
      prompt: generatedCategoryName,
      createdAt: Date.now(),
      people,
    };

    await db.customCategories.add(category);

    // Store config for play page
    sessionStorage.setItem("fmk-game-config", JSON.stringify({
      categoryId,
      categoryName: generatedCategoryName,
      mode: "solo",
      timerConfig: { enabled: false, decisionTime: 30, discussionTime: 0, tickSound: true },
      customPeople: people,
    }));

    router.push("/play");
  };

  // Manual form handlers
  const handleManualSave = async (people: Person[], categoryName: string) => {
    const category: CustomCategory = {
      id: `custom-${Date.now()}`,
      name: categoryName,
      icon: "scroll",
      type: "custom",
      prompt: categoryName,
      createdAt: Date.now(),
      people,
    };

    await db.customCategories.add(category);
    setFormMode("none");
  };

  const handleManualSaveAndPlay = async (people: Person[], categoryName: string) => {
    const categoryId = `custom-${Date.now()}`;
    const category: CustomCategory = {
      id: categoryId,
      name: categoryName,
      icon: "scroll",
      type: "custom",
      prompt: categoryName,
      createdAt: Date.now(),
      people,
    };

    await db.customCategories.add(category);

    // Store config for play page
    sessionStorage.setItem("fmk-game-config", JSON.stringify({
      categoryId,
      categoryName: categoryName,
      mode: "solo",
      timerConfig: { enabled: false, decisionTime: 30, discussionTime: 0, tickSound: true },
      customPeople: people,
    }));

    router.push("/play");
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        Custom Categories
      </h1>

      {formMode === "ai" ? (
        <div className="space-y-4">
          <button
            onClick={() => setFormMode("none")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
          <CustomCategoryForm onGenerate={handleGenerate} isOffline={!isOnline} />
        </div>
      ) : formMode === "manual" ? (
        <div className="space-y-4">
          <button
            onClick={() => setFormMode("none")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
          <ManualCategoryForm
            onSave={handleManualSave}
            onSaveAndPlay={handleManualSaveAndPlay}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* AI Generate */}
          <Card
            className="cursor-pointer hover:border-primary transition-all"
            onClick={() => setFormMode("ai")}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">AI Generate</h3>
                <p className="text-sm text-muted-foreground">
                  Describe a category and AI will create it
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          {/* Manual Custom Lists */}
          <Card
            className="cursor-pointer hover:border-primary transition-all"
            onClick={() => setFormMode("manual")}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-primary/10 p-3">
                <PlusCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Custom List</h3>
                <p className="text-sm text-muted-foreground">
                  Create your own list of people manually
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Saved Custom Categories */}
      {customCategories && customCategories.length > 0 && formMode === "none" && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium flex items-center gap-2">
            <List className="h-4 w-4" />
            Your Categories
          </h2>
          {customCategories.map((category) => (
            <Link key={category.id} href={`/setup?category=${category.id}&custom=true`}>
              <Card className="cursor-pointer hover:border-primary transition-all">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {category.people.length} people •{" "}
                      {new Date(category.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <CategoryReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        categoryName={generatedCategoryName}
        people={generatedPeople}
        onSave={handleSave}
        onSaveAndPlay={handleSaveAndPlay}
      />
    </div>
  );
}
