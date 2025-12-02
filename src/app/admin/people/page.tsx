"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import type { Person } from "@/types";
import { Search, User, Filter } from "lucide-react";

interface PeopleFilters {
  search: string;
  gender: "all" | "male" | "female" | "other";
  category: string;
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PeopleFilters>({
    search: "",
    gender: "all",
    category: "all",
  });

  useEffect(() => {
    async function loadPeople() {
      try {
        const allPeople = await db.people.toArray();
        setPeople(allPeople);

        // Get unique categories
        const uniqueCats = [...new Set(allPeople.map((p) => p.categoryId))];
        setCategories(uniqueCats);
      } catch (error) {
        console.error("Failed to load people:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPeople();
  }, []);

  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      // Search filter
      if (
        filters.search &&
        !person.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Gender filter
      if (filters.gender !== "all" && person.gender !== filters.gender) {
        return false;
      }

      // Category filter
      if (filters.category !== "all" && person.categoryId !== filters.category) {
        return false;
      }

      return true;
    });
  }, [people, filters]);

  const currentYear = new Date().getFullYear();

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
        <h1 className="text-3xl font-bold">People</h1>
        <p className="text-muted-foreground mt-1">
          Browse all {people.length} people across categories
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  placeholder="Search by name..."
                  className="w-full pl-9 pr-4 py-2 rounded-md border bg-background"
                />
              </div>
            </div>

            {/* Gender filter */}
            <select
              value={filters.gender}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  gender: e.target.value as PeopleFilters["gender"],
                })
              }
              className="px-3 py-2 rounded-md border bg-background"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            {/* Category filter */}
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="px-3 py-2 rounded-md border bg-background"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Clear filters */}
            {(filters.search ||
              filters.gender !== "all" ||
              filters.category !== "all") && (
              <Button
                variant="ghost"
                onClick={() =>
                  setFilters({ search: "", gender: "all", category: "all" })
                }
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredPeople.length} of {people.length} people
      </p>

      {/* People grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPeople.slice(0, 100).map((person) => (
          <Card key={person.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{person.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {person.gender}
                    {person.birthYear &&
                      ` • ${currentYear - person.birthYear}y`}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {person.categoryId}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPeople.length > 100 && (
        <p className="text-center text-muted-foreground">
          Showing first 100 results. Use filters to narrow down.
        </p>
      )}

      {filteredPeople.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No people match your filters.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
