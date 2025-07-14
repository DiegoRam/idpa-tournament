"use client";

import React from "react";
import { StringScore, IDPAPenalties, calculateScoreBreakdown, formatTime } from "@/types/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Target, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreReviewProps {
  shooterName: string;
  division: string;
  classification: string;
  stageName: string;
  strings: StringScore[];
  penalties: IDPAPenalties;
  dnf?: boolean;
  dq?: boolean;
  onEdit?: () => void;
  onConfirm?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export function ScoreReview({
  shooterName,
  division,
  classification,
  stageName,
  strings,
  penalties,
  dnf = false,
  dq = false,
  onEdit,
  onConfirm,
  isSubmitting = false,
  className,
}: ScoreReviewProps) {
  const { rawTime, pointsDown, penaltyTime, finalTime } = calculateScoreBreakdown(strings, penalties);

  // Count total hits for validation
  const totalHits = strings.reduce((total, string) => {
    const hits = string.hits;
    return total + hits.down0 + hits.down1 + hits.down3 + hits.miss + hits.nonThreat;
  }, 0);

  return (
    <Card className={cn("bg-gray-900/50 border-gray-800", className)}>
      <CardHeader>
        <CardTitle className="text-xl text-green-400 flex items-center gap-2">
          <CheckCircle className="h-6 w-6" />
          Score Review
        </CardTitle>
        <div className="space-y-1 text-sm text-gray-400">
          <p>
            <span className="font-medium">Shooter:</span> {shooterName}
          </p>
          <p>
            <span className="font-medium">Division/Class:</span> {division}/{classification}
          </p>
          <p>
            <span className="font-medium">Stage:</span> {stageName}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* DNF/DQ Status */}
        {(dnf || dq) && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded">
            <p className="text-red-400 font-bold text-center">
              {dnf && "DID NOT FINISH (DNF)"}
              {dq && "DISQUALIFIED (DQ)"}
            </p>
          </div>
        )}

        {/* String Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            String Times
          </h3>
          <div className="space-y-2">
            {strings.map((string, index) => (
              <div
                key={index}
                className="p-3 bg-gray-800/50 rounded flex items-center justify-between"
              >
                <span className="text-sm text-gray-300">String {index + 1}:</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-white">
                    {string.time.toFixed(2)}s
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    {string.hits.down0 > 0 && (
                      <Badge variant="outline" className="bg-green-900/50">
                        {string.hits.down0} × -0
                      </Badge>
                    )}
                    {string.hits.down1 > 0 && (
                      <Badge variant="outline" className="bg-yellow-900/50">
                        {string.hits.down1} × -1
                      </Badge>
                    )}
                    {string.hits.down3 > 0 && (
                      <Badge variant="outline" className="bg-orange-900/50">
                        {string.hits.down3} × -3
                      </Badge>
                    )}
                    {string.hits.miss > 0 && (
                      <Badge variant="outline" className="bg-red-900/50">
                        {string.hits.miss} × Miss
                      </Badge>
                    )}
                    {string.hits.nonThreat > 0 && (
                      <Badge variant="outline" className="bg-red-900/50">
                        {string.hits.nonThreat} × NT
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hit Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Hit Summary
          </h3>
          <div className="grid grid-cols-5 gap-2">
            <div className="text-center p-2 bg-gray-800/50 rounded">
              <p className="text-xs text-gray-400">-0</p>
              <p className="text-lg font-bold text-green-400">
                {strings.reduce((sum, s) => sum + s.hits.down0, 0)}
              </p>
            </div>
            <div className="text-center p-2 bg-gray-800/50 rounded">
              <p className="text-xs text-gray-400">-1</p>
              <p className="text-lg font-bold text-yellow-400">
                {strings.reduce((sum, s) => sum + s.hits.down1, 0)}
              </p>
            </div>
            <div className="text-center p-2 bg-gray-800/50 rounded">
              <p className="text-xs text-gray-400">-3</p>
              <p className="text-lg font-bold text-orange-400">
                {strings.reduce((sum, s) => sum + s.hits.down3, 0)}
              </p>
            </div>
            <div className="text-center p-2 bg-gray-800/50 rounded">
              <p className="text-xs text-gray-400">Miss</p>
              <p className="text-lg font-bold text-red-400">
                {strings.reduce((sum, s) => sum + s.hits.miss, 0)}
              </p>
            </div>
            <div className="text-center p-2 bg-gray-800/50 rounded">
              <p className="text-xs text-gray-400">NT</p>
              <p className="text-lg font-bold text-red-600">
                {strings.reduce((sum, s) => sum + s.hits.nonThreat, 0)}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Total Hits: {totalHits}
          </p>
        </div>

        {/* Penalties */}
        {penaltyTime > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Penalties
            </h3>
            <div className="space-y-1 text-sm">
              {penalties.procedural > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Procedural (PE):</span>
                  <span className="text-yellow-400">
                    {penalties.procedural} × 3s = {penalties.procedural * 3}s
                  </span>
                </div>
              )}
              {penalties.nonThreat > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Hit on Non-Threat:</span>
                  <span className="text-yellow-400">
                    {penalties.nonThreat} × 5s = {penalties.nonThreat * 5}s
                  </span>
                </div>
              )}
              {penalties.failureToNeutralize > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Failure to Neutralize:</span>
                  <span className="text-yellow-400">
                    {penalties.failureToNeutralize} × 5s = {penalties.failureToNeutralize * 5}s
                  </span>
                </div>
              )}
              {penalties.flagrant > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Flagrant Penalty:</span>
                  <span className="text-yellow-400">
                    {penalties.flagrant} × 10s = {penalties.flagrant * 10}s
                  </span>
                </div>
              )}
              {penalties.ftdr > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">FTDR:</span>
                  <span className="text-yellow-400">
                    {penalties.ftdr} × 20s = {penalties.ftdr * 20}s
                  </span>
                </div>
              )}
              {penalties.other.map((penalty, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-400">
                    {penalty.type} {penalty.description && `(${penalty.description})`}:
                  </span>
                  <span className="text-yellow-400">
                    {penalty.count} × {penalty.seconds}s = {penalty.count * penalty.seconds}s
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score Breakdown */}
        <div className="space-y-2 p-4 bg-gray-800/50 rounded">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Raw Time:</span>
            <span className="font-mono">{formatTime(rawTime)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Points Down:</span>
            <span className="font-mono">+ {pointsDown}s</span>
          </div>
          {penaltyTime > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Penalties:</span>
              <span className="font-mono text-yellow-400">+ {penaltyTime}s</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-700">
            <span className="text-green-400">Final Time:</span>
            <span className="font-mono text-green-400">
              {dnf || dq ? "N/A" : formatTime(finalTime)}
            </span>
          </div>
        </div>

        {/* Actions */}
        {(onEdit || onConfirm) && (
          <div className="flex gap-3 pt-4">
            {onEdit && (
              <Button
                variant="outline"
                onClick={onEdit}
                disabled={isSubmitting}
                className="flex-1"
              >
                Edit Score
              </Button>
            )}
            {onConfirm && (
              <Button
                onClick={onConfirm}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Submitting..." : "Confirm & Submit"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}