"use client";

import React from "react";
import { HitZone } from "@/types/scoring";
import { cn } from "@/lib/utils";

interface TargetHitZonesProps {
  targetId: string;
  hits: HitZone;
  maxRounds: number;
  isNonThreat?: boolean;
  onChange: (targetId: string, hits: HitZone) => void;
  disabled?: boolean;
  className?: string;
}

export function TargetHitZones({
  targetId,
  hits,
  maxRounds,
  isNonThreat = false,
  onChange,
  disabled = false,
  className,
}: TargetHitZonesProps) {
  const totalHits = hits.down0 + hits.down1 + hits.down3 + hits.miss;
  const remainingRounds = maxRounds - totalHits;

  const handleZoneClick = (zone: keyof HitZone) => {
    if (disabled || (remainingRounds <= 0 && zone !== "miss")) return;
    
    const newHits = { ...hits };
    if (zone === "miss") {
      // Miss doesn't count against round limit
      newHits.miss = hits.miss + 1;
    } else {
      newHits[zone] = hits[zone] + 1;
    }
    
    onChange(targetId, newHits);
  };

  const handleZoneDecrement = (zone: keyof HitZone) => {
    if (disabled || hits[zone] <= 0) return;
    
    const newHits = { ...hits };
    newHits[zone] = hits[zone] - 1;
    onChange(targetId, newHits);
  };

  if (isNonThreat) {
    // Non-threat targets only track hits
    return (
      <div className={cn("bg-gray-900/50 rounded-lg p-4", className)}>
        <h4 className="text-sm font-medium text-red-400 mb-3">Non-Threat Target</h4>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Hits on NT:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoneDecrement("nonThreat")}
              disabled={disabled || hits.nonThreat <= 0}
              className="px-2 py-1 bg-red-900/50 text-red-300 rounded hover:bg-red-900/70 disabled:opacity-50"
            >
              -
            </button>
            <span className="w-12 text-center font-bold text-red-400">
              {hits.nonThreat}
            </span>
            <button
              onClick={() => handleZoneClick("nonThreat")}
              disabled={disabled}
              className="px-2 py-1 bg-red-900/50 text-red-300 rounded hover:bg-red-900/70 disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>
        <p className="text-xs text-red-400 mt-2">5 seconds per hit</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-gray-900/50 rounded-lg p-4", className)}>
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-300 mb-1">
          Target {targetId}
        </h4>
        <p className="text-xs text-gray-500">
          {totalHits} / {maxRounds} rounds | {remainingRounds} remaining
        </p>
      </div>

      {/* Visual target representation */}
      <div className="relative w-48 h-64 mx-auto mb-4 bg-gray-800 rounded-lg overflow-hidden">
        {/* -0 Zone (Center) */}
        <button
          onClick={() => handleZoneClick("down0")}
          disabled={disabled || remainingRounds <= 0}
          className={cn(
            "absolute top-[25%] left-[35%] w-[30%] h-[25%] rounded-full",
            "bg-green-600/30 hover:bg-green-600/50 border-2 border-green-500",
            "flex items-center justify-center text-white font-bold",
            "transition-all duration-150",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          -0
        </button>

        {/* -1 Zone */}
        <button
          onClick={() => handleZoneClick("down1")}
          disabled={disabled || remainingRounds <= 0}
          className={cn(
            "absolute top-[15%] left-[25%] w-[50%] h-[40%] rounded-full",
            "bg-yellow-600/20 hover:bg-yellow-600/40 border-2 border-yellow-500",
            "flex items-center justify-center text-white font-bold",
            "-z-10",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          -1
        </button>

        {/* -3 Zone */}
        <button
          onClick={() => handleZoneClick("down3")}
          disabled={disabled || remainingRounds <= 0}
          className={cn(
            "absolute top-[5%] left-[15%] w-[70%] h-[60%] rounded-full",
            "bg-orange-600/20 hover:bg-orange-600/40 border-2 border-orange-500",
            "flex items-center justify-center text-white font-bold",
            "-z-20",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          -3
        </button>

        {/* Target silhouette outline */}
        <div className="absolute inset-0 border-4 border-gray-600 rounded-lg pointer-events-none" />
      </div>

      {/* Hit counters */}
      <div className="space-y-2">
        {/* -0 hits */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-green-400">-0 (Center):</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoneDecrement("down0")}
              disabled={disabled || hits.down0 <= 0}
              className="px-2 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              -
            </button>
            <span className="w-8 text-center font-bold">{hits.down0}</span>
            <button
              onClick={() => handleZoneClick("down0")}
              disabled={disabled || remainingRounds <= 0}
              className="px-2 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>

        {/* -1 hits */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-yellow-400">-1 Zone:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoneDecrement("down1")}
              disabled={disabled || hits.down1 <= 0}
              className="px-2 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              -
            </button>
            <span className="w-8 text-center font-bold">{hits.down1}</span>
            <button
              onClick={() => handleZoneClick("down1")}
              disabled={disabled || remainingRounds <= 0}
              className="px-2 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>

        {/* -3 hits */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-orange-400">-3 Zone:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoneDecrement("down3")}
              disabled={disabled || hits.down3 <= 0}
              className="px-2 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              -
            </button>
            <span className="w-8 text-center font-bold">{hits.down3}</span>
            <button
              onClick={() => handleZoneClick("down3")}
              disabled={disabled || remainingRounds <= 0}
              className="px-2 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>

        {/* Misses */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-red-400">Miss:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoneDecrement("miss")}
              disabled={disabled || hits.miss <= 0}
              className="px-2 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              -
            </button>
            <span className="w-8 text-center font-bold">{hits.miss}</span>
            <button
              onClick={() => handleZoneClick("miss")}
              disabled={disabled}
              className="px-2 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Points down calculation */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Points Down:</span>
          <span className="font-bold text-yellow-400">
            {hits.down0 * 0 + hits.down1 * 1 + hits.down3 * 3 + hits.miss * 5}
          </span>
        </div>
      </div>
    </div>
  );
}