"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { CATEGORIES_DATA } from "@/data/categories";
import type { Person, CustomCategory } from "@/types";
import {
  ArrowLeft,
  Trash2,
  Edit2,
  Plus,
  Save,
  X,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

interface EditablePerson {
  id: string;
  name: string;
  gender: "male" | "female" | "other";
  birthYear?: number;
}

export default function CategoryDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const isCustom = searchParams.get("custom") === "true";

  const [categoryName, setCategoryName] = useState("");
  const [people, setPeople] = useState<EditablePerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPerson, setEditingPerson] = useState<EditablePerson | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EditablePerson | null>(null);

  useEffect(() => {
    async function loadCategory() {
      try {
        if (isCustom) {
          const customCat = await db.customCategories.get(categoryId);
          if (customCat) {
            setCategoryName(customCat.name);
            setPeople(
              customCat.people.map((p) => ({
                id: p.id,
                name: p.name,
                gender: p.gender,
                birthYear: p.birthYear,
              }))
            );
          }
        } else {
          const category = CATEGORIES_DATA.find((c) => c.id === categoryId);
          if (category) {
            setCategoryName(category.name);
          }
          const categoryPeople = await db.people
            .where("categoryId")
            .equals(categoryId)
            .toArray();
          setPeople(
            categoryPeople.map((p) => ({
              id: p.id,
              name: p.name,
              gender: p.gender,
              birthYear: p.birthYear,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to load category:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCategory();
  }, [categoryId, isCustom]);

  const handleSavePerson = async (person: EditablePerson) => {
    try {
      if (isCustom) {
        // Update custom category
        const customCat = await db.customCategories.get(categoryId);
        if (customCat) {
          const updatedPeople = isAddingNew
            ? [...customCat.people, { ...person, categoryId }]
            : customCat.people.map((p) =>
                p.id === person.id ? { ...p, ...person } : p
              );
          await db.customCategories.update(categoryId, {
            people: updatedPeople,
          });
          setPeople(
            updatedPeople.map((p) => ({
              id: p.id,
              name: p.name,
              gender: p.gender,
              birthYear: p.birthYear,
            }))
          );
        }
      } else {
        // Update pre-built person
        if (isAddingNew) {
          await db.people.add({
            ...person,
            categoryId,
          } as Person);
        } else {
          await db.people.update(person.id, {
            name: person.name,
            gender: person.gender,
            birthYear: person.birthYear,
          });
        }
        // Reload people
        const categoryPeople = await db.people
          .where("categoryId")
          .equals(categoryId)
          .toArray();
        setPeople(
          categoryPeople.map((p) => ({
            id: p.id,
            name: p.name,
            gender: p.gender,
            birthYear: p.birthYear,
          }))
        );
      }
      setEditingPerson(null);
      setIsAddingNew(false);
    } catch (error) {
      console.error("Failed to save person:", error);
    }
  };

  const handleDeletePerson = async () => {
    if (!deleteTarget) return;

    try {
      if (isCustom) {
        const customCat = await db.customCategories.get(categoryId);
        if (customCat) {
          const updatedPeople = customCat.people.filter(
            (p) => p.id !== deleteTarget.id
          );
          await db.customCategories.update(categoryId, {
            people: updatedPeople,
          });
          setPeople(
            updatedPeople.map((p) => ({
              id: p.id,
              name: p.name,
              gender: p.gender,
              birthYear: p.birthYear,
            }))
          );
        }
      } else {
        await db.people.delete(deleteTarget.id);
        setPeople((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete person:", error);
    }
  };

  const handleAddNew = () => {
    const newPerson: EditablePerson = {
      id: `new-${Date.now()}`,
      name: "",
      gender: "male",
      birthYear: undefined,
    };
    setEditingPerson(newPerson);
    setIsAddingNew(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{categoryName}</h1>
          <p className="text-muted-foreground">
            {people.length} people • {isCustom ? "Custom" : "Pre-built"}
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Person
        </Button>
      </div>

      {/* People List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {people.map((person) => (
          <Card key={person.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">{person.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {person.gender}
                      {person.birthYear &&
                        ` • ${currentYear - person.birthYear} years old`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingPerson(person);
                      setIsAddingNew(false);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(person)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {people.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>No people in this category.</p>
            <Button className="mt-4" onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Person
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit/Add Dialog */}
      <Dialog
        open={!!editingPerson}
        onOpenChange={() => {
          setEditingPerson(null);
          setIsAddingNew(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isAddingNew ? "Add Person" : "Edit Person"}
            </DialogTitle>
          </DialogHeader>

          {editingPerson && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={editingPerson.name}
                  onChange={(e) =>
                    setEditingPerson({ ...editingPerson, name: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Gender</label>
                <select
                  value={editingPerson.gender}
                  onChange={(e) =>
                    setEditingPerson({
                      ...editingPerson,
                      gender: e.target.value as "male" | "female" | "other",
                    })
                  }
                  className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Birth Year</label>
                <input
                  type="number"
                  value={editingPerson.birthYear || ""}
                  onChange={(e) =>
                    setEditingPerson({
                      ...editingPerson,
                      birthYear: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
                  placeholder="Optional"
                  min="1900"
                  max={currentYear}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingPerson(null);
                setIsAddingNew(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => editingPerson && handleSavePerson(editingPerson)}
              disabled={!editingPerson?.name.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Person</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePerson}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
