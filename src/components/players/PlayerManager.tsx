"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Check, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { useSavedPlayers } from "@/lib/db/hooks";
import type { SavedPlayer, Gender } from "@/types";
import { DEFAULT_PLAYER_SETTINGS, AVATAR_COLORS } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PlayerManagerProps {
  selectedPlayerIds: string[];
  onSelectionChange: (playerIds: string[]) => void;
  maxPlayers?: number;
  minPlayers?: number;
}

interface EditingPlayer {
  id: string;
  name: string;
  avatarColor: string;
  genderFilter: Gender[];
  ageRange: [number, number];
  isNew: boolean;
}

const generateId = () => `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function PlayerManager({
  selectedPlayerIds,
  onSelectionChange,
  maxPlayers = 10,
  minPlayers = 2,
}: PlayerManagerProps) {
  const savedPlayers = useSavedPlayers();
  const [editingPlayer, setEditingPlayer] = useState<EditingPlayer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedPlayer | null>(null);

  const handleAddNew = () => {
    const usedColors = savedPlayers?.map((p) => p.avatarColor) || [];
    const availableColor = AVATAR_COLORS.find((c) => !usedColors.includes(c)) || AVATAR_COLORS[0];

    setEditingPlayer({
      id: generateId(),
      name: "",
      avatarColor: availableColor,
      genderFilter: [...DEFAULT_PLAYER_SETTINGS.genderFilter],
      ageRange: [...DEFAULT_PLAYER_SETTINGS.ageRange] as [number, number],
      isNew: true,
    });
  };

  const handleEditPlayer = (player: SavedPlayer) => {
    setEditingPlayer({
      ...player,
      isNew: false,
    });
  };

  const handleSavePlayer = async () => {
    if (!editingPlayer || !editingPlayer.name.trim()) return;

    const playerData: SavedPlayer = {
      id: editingPlayer.id,
      name: editingPlayer.name.trim(),
      avatarColor: editingPlayer.avatarColor,
      genderFilter: editingPlayer.genderFilter,
      ageRange: editingPlayer.ageRange,
      createdAt: editingPlayer.isNew ? Date.now() : (savedPlayers?.find((p) => p.id === editingPlayer.id)?.createdAt || Date.now()),
      lastPlayedAt: savedPlayers?.find((p) => p.id === editingPlayer.id)?.lastPlayedAt,
    };

    await db.savedPlayers.put(playerData);
    setEditingPlayer(null);
  };

  const handleDeletePlayer = async () => {
    if (!deleteTarget) return;

    await db.savedPlayers.delete(deleteTarget.id);

    // Remove from selection if selected
    if (selectedPlayerIds.includes(deleteTarget.id)) {
      onSelectionChange(selectedPlayerIds.filter((id) => id !== deleteTarget.id));
    }

    setDeleteTarget(null);
  };

  const handleToggleSelection = (playerId: string) => {
    if (selectedPlayerIds.includes(playerId)) {
      onSelectionChange(selectedPlayerIds.filter((id) => id !== playerId));
    } else if (selectedPlayerIds.length < maxPlayers) {
      onSelectionChange([...selectedPlayerIds, playerId]);
    }
  };

  const handleGenderToggle = (gender: Gender) => {
    if (!editingPlayer) return;

    const current = editingPlayer.genderFilter;
    if (current.includes(gender)) {
      // Don't allow removing all genders
      if (current.length > 1) {
        setEditingPlayer({
          ...editingPlayer,
          genderFilter: current.filter((g) => g !== gender),
        });
      }
    } else {
      setEditingPlayer({
        ...editingPlayer,
        genderFilter: [...current, gender],
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Player List */}
      <div className="space-y-2">
        {savedPlayers?.map((player) => {
          const isSelected = selectedPlayerIds.includes(player.id);

          return (
            <Card
              key={player.id}
              className={cn(
                "cursor-pointer transition-all",
                isSelected && "ring-2 ring-primary"
              )}
              onClick={() => handleToggleSelection(player.id)}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: player.avatarColor }}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{player.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {player.genderFilter.join(", ")} •{" "}
                    {player.ageRange[0]}-{player.ageRange[1]} years
                  </p>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPlayer(player)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(player)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {(!savedPlayers || savedPlayers.length === 0) && (
          <p className="text-center text-muted-foreground py-4">
            No players yet. Add players to get started!
          </p>
        )}
      </div>

      {/* Add Player Button */}
      <Button variant="outline" onClick={handleAddNew} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Player
      </Button>

      {/* Selection Info */}
      {selectedPlayerIds.length > 0 && (
        <p className="text-sm text-center text-muted-foreground">
          {selectedPlayerIds.length} player{selectedPlayerIds.length !== 1 ? "s" : ""} selected
          {selectedPlayerIds.length < minPlayers && ` (need at least ${minPlayers})`}
        </p>
      )}

      {/* Edit/Add Dialog */}
      <Dialog open={!!editingPlayer} onOpenChange={() => setEditingPlayer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPlayer?.isNew ? "Add Player" : "Edit Player"}
            </DialogTitle>
          </DialogHeader>

          {editingPlayer && (
            <div className="space-y-6 py-4">
              {/* Name */}
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <input
                  type="text"
                  value={editingPlayer.name}
                  onChange={(e) =>
                    setEditingPlayer({ ...editingPlayer, name: e.target.value })
                  }
                  placeholder="Enter player name"
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  autoFocus
                />
              </div>

              {/* Avatar Color */}
              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setEditingPlayer({ ...editingPlayer, avatarColor: color })
                      }
                      className={cn(
                        "w-8 h-8 rounded-full transition-all",
                        editingPlayer.avatarColor === color &&
                          "ring-2 ring-offset-2 ring-foreground"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Gender Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Show People
                </label>
                <div className="flex gap-2">
                  {(["male", "female", "other"] as Gender[]).map((gender) => (
                    <Button
                      key={gender}
                      variant={
                        editingPlayer.genderFilter.includes(gender)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleGenderToggle(gender)}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Age Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Age Range: {editingPlayer.ageRange[0]} - {editingPlayer.ageRange[1]}
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="range"
                      min="18"
                      max="99"
                      value={editingPlayer.ageRange[0]}
                      onChange={(e) =>
                        setEditingPlayer({
                          ...editingPlayer,
                          ageRange: [
                            Math.min(parseInt(e.target.value), editingPlayer.ageRange[1] - 1),
                            editingPlayer.ageRange[1],
                          ],
                        })
                      }
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground text-center">Min</p>
                  </div>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="18"
                      max="99"
                      value={editingPlayer.ageRange[1]}
                      onChange={(e) =>
                        setEditingPlayer({
                          ...editingPlayer,
                          ageRange: [
                            editingPlayer.ageRange[0],
                            Math.max(parseInt(e.target.value), editingPlayer.ageRange[0] + 1),
                          ],
                        })
                      }
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground text-center">Max</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlayer(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSavePlayer}
              disabled={!editingPlayer?.name.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Player</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePlayer}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
