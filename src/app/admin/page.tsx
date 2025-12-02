"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import {
  Users,
  FolderOpen,
  Gamepad2,
  ImageIcon,
  TrendingUp,
  Clock,
} from "lucide-react";

interface Stats {
  totalPeople: number;
  totalCategories: number;
  customCategories: number;
  gamesPlayed: number;
  cachedImages: number;
  cacheSize: string;
}

interface RecentGame {
  id: string;
  categoryName: string;
  playedAt: number;
  roundsPlayed: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [people, customCats, history, images] = await Promise.all([
          db.people.count(),
          db.customCategories.count(),
          db.gameHistory.count(),
          db.cachedImages.toArray(),
        ]);

        // Estimate cache size
        const cacheBytes = images.reduce(
          (sum, img) => sum + (img.imageBase64?.length || 0) * 0.75,
          0
        );
        const cacheMB = (cacheBytes / (1024 * 1024)).toFixed(2);

        // Get unique categories count from people
        const uniqueCategories = new Set(
          (await db.people.toArray()).map((p) => p.categoryId)
        );

        setStats({
          totalPeople: people,
          totalCategories: uniqueCategories.size,
          customCategories: customCats,
          gamesPlayed: history,
          cachedImages: images.length,
          cacheSize: `${cacheMB} MB`,
        });

        // Load recent games
        const games = await db.gameHistory
          .orderBy("playedAt")
          .reverse()
          .limit(5)
          .toArray();

        setRecentGames(
          games.map((g) => ({
            id: g.id,
            categoryName: g.categoryName,
            playedAt: g.playedAt,
            roundsPlayed: g.rounds.length,
          }))
        );
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total People",
      value: stats?.totalPeople ?? 0,
      icon: Users,
      description: "Pre-built category entries",
    },
    {
      title: "Pre-built Categories",
      value: stats?.totalCategories ?? 0,
      icon: FolderOpen,
      description: "From data files",
    },
    {
      title: "Custom Categories",
      value: stats?.customCategories ?? 0,
      icon: TrendingUp,
      description: "AI-generated or manual",
    },
    {
      title: "Games Played",
      value: stats?.gamesPlayed ?? 0,
      icon: Gamepad2,
      description: "Total game sessions",
    },
    {
      title: "Cached Images",
      value: stats?.cachedImages ?? 0,
      icon: ImageIcon,
      description: stats?.cacheSize ?? "0 MB",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your FMK game data
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Games */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentGames.length === 0 ? (
            <p className="text-muted-foreground text-sm">No games played yet</p>
          ) : (
            <div className="space-y-3">
              {recentGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{game.categoryName}</p>
                    <p className="text-xs text-muted-foreground">
                      {game.roundsPlayed} rounds
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(game.playedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
