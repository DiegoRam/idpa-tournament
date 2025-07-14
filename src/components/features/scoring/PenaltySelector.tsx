"use client";

import React from "react";
import { IDPAPenalties, PENALTY_DESCRIPTIONS, CustomPenalty } from "@/types/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PenaltySelectorProps {
  penalties: IDPAPenalties;
  onChange: (penalties: IDPAPenalties) => void;
  disabled?: boolean;
  className?: string;
}

export function PenaltySelector({
  penalties,
  onChange,
  disabled = false,
  className,
}: PenaltySelectorProps) {
  // Calculate total penalty time
  const totalPenaltyTime = 
    penalties.procedural * 3 +
    penalties.nonThreat * 5 +
    penalties.failureToNeutralize * 5 +
    penalties.flagrant * 10 +
    penalties.ftdr * 20 +
    penalties.other.reduce((total, p) => total + p.count * p.seconds, 0);

  const handleStandardPenaltyChange = (
    type: keyof Omit<IDPAPenalties, "other">,
    value: number
  ) => {
    if (disabled) return;
    const newValue = Math.max(0, value);
    onChange({
      ...penalties,
      [type]: newValue,
    });
  };

  const handleAddCustomPenalty = () => {
    if (disabled) return;
    const newPenalty: CustomPenalty = {
      type: "Custom",
      count: 1,
      seconds: 3,
      description: "",
    };
    onChange({
      ...penalties,
      other: [...penalties.other, newPenalty],
    });
  };

  const handleCustomPenaltyChange = (
    index: number,
    field: keyof CustomPenalty,
    value: string | number
  ) => {
    if (disabled) return;
    const newOther = [...penalties.other];
    newOther[index] = {
      ...newOther[index],
      [field]: value,
    };
    onChange({
      ...penalties,
      other: newOther,
    });
  };

  const handleRemoveCustomPenalty = (index: number) => {
    if (disabled) return;
    const newOther = penalties.other.filter((_, i) => i !== index);
    onChange({
      ...penalties,
      other: newOther,
    });
  };

  return (
    <Card className={cn("bg-gray-900/50 border-gray-800", className)}>
      <CardHeader>
        <CardTitle className="text-lg text-yellow-400 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Penalties
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Standard IDPA Penalties */}
        <div className="space-y-3">
          {/* Procedural Error */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-sm text-gray-300">
                {PENALTY_DESCRIPTIONS.procedural}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => 
                  handleStandardPenaltyChange("procedural", penalties.procedural - 1)
                }
                disabled={disabled || penalties.procedural <= 0}
                className="h-8 w-8 p-0"
              >
                -
              </Button>
              <span className="w-12 text-center font-bold text-yellow-400">
                {penalties.procedural}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => 
                  handleStandardPenaltyChange("procedural", penalties.procedural + 1)
                }
                disabled={disabled}
                className="h-8 w-8 p-0"
              >
                +
              </Button>
            </div>
          </div>

          {/* Hit on Non-Threat */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-sm text-gray-300">
                {PENALTY_DESCRIPTIONS.nonThreat}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => 
                  handleStandardPenaltyChange("nonThreat", penalties.nonThreat - 1)
                }
                disabled={disabled || penalties.nonThreat <= 0}
                className="h-8 w-8 p-0"
              >
                -
              </Button>
              <span className="w-12 text-center font-bold text-yellow-400">
                {penalties.nonThreat}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => 
                  handleStandardPenaltyChange("nonThreat", penalties.nonThreat + 1)
                }
                disabled={disabled}
                className="h-8 w-8 p-0"
              >
                +
              </Button>
            </div>
          </div>

          {/* Failure to Neutralize */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-sm text-gray-300">
                {PENALTY_DESCRIPTIONS.failureToNeutralize}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => 
                  handleStandardPenaltyChange("failureToNeutralize", penalties.failureToNeutralize - 1)
                }
                disabled={disabled || penalties.failureToNeutralize <= 0}
                className="h-8 w-8 p-0"
              >
                -
              </Button>
              <span className="w-12 text-center font-bold text-yellow-400">
                {penalties.failureToNeutralize}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => 
                  handleStandardPenaltyChange("failureToNeutralize", penalties.failureToNeutralize + 1)
                }
                disabled={disabled}
                className="h-8 w-8 p-0"
              >
                +
              </Button>
            </div>
          </div>

          {/* Flagrant Penalty */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-sm text-gray-300">
                {PENALTY_DESCRIPTIONS.flagrant}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => 
                  handleStandardPenaltyChange("flagrant", penalties.flagrant - 1)
                }
                disabled={disabled || penalties.flagrant <= 0}
                className="h-8 w-8 p-0"
              >
                -
              </Button>
              <span className="w-12 text-center font-bold text-yellow-400">
                {penalties.flagrant}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => 
                  handleStandardPenaltyChange("flagrant", penalties.flagrant + 1)
                }
                disabled={disabled}
                className="h-8 w-8 p-0"
              >
                +
              </Button>
            </div>
          </div>

          {/* Failure to Do Right */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-sm text-gray-300">
                {PENALTY_DESCRIPTIONS.ftdr}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => 
                  handleStandardPenaltyChange("ftdr", penalties.ftdr - 1)
                }
                disabled={disabled || penalties.ftdr <= 0}
                className="h-8 w-8 p-0"
              >
                -
              </Button>
              <span className="w-12 text-center font-bold text-yellow-400">
                {penalties.ftdr}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => 
                  handleStandardPenaltyChange("ftdr", penalties.ftdr + 1)
                }
                disabled={disabled}
                className="h-8 w-8 p-0"
              >
                +
              </Button>
            </div>
          </div>
        </div>

        {/* Custom Penalties */}
        {penalties.other.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-gray-700">
            <Label className="text-sm text-gray-400">Custom Penalties</Label>
            {penalties.other.map((penalty, index) => (
              <div key={index} className="space-y-2 p-3 bg-gray-800/50 rounded">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={penalty.type}
                    onChange={(e) => 
                      handleCustomPenaltyChange(index, "type", e.target.value)
                    }
                    placeholder="Penalty type"
                    disabled={disabled}
                    className="flex-1 h-8 bg-gray-900 border-gray-700"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveCustomPenalty(index)}
                    disabled={disabled}
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Count:</Label>
                  <Input
                    type="number"
                    value={penalty.count}
                    onChange={(e) => 
                      handleCustomPenaltyChange(index, "count", parseInt(e.target.value) || 0)
                    }
                    disabled={disabled}
                    className="w-16 h-8 bg-gray-900 border-gray-700"
                  />
                  <Label className="text-xs">Seconds:</Label>
                  <Input
                    type="number"
                    value={penalty.seconds}
                    onChange={(e) => 
                      handleCustomPenaltyChange(index, "seconds", parseInt(e.target.value) || 0)
                    }
                    disabled={disabled}
                    className="w-16 h-8 bg-gray-900 border-gray-700"
                  />
                </div>
                <Input
                  type="text"
                  value={penalty.description || ""}
                  onChange={(e) => 
                    handleCustomPenaltyChange(index, "description", e.target.value)
                  }
                  placeholder="Description (optional)"
                  disabled={disabled}
                  className="h-8 bg-gray-900 border-gray-700"
                />
              </div>
            ))}
          </div>
        )}

        {/* Add Custom Penalty Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddCustomPenalty}
          disabled={disabled}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Penalty
        </Button>

        {/* Total Penalty Time */}
        <div className="pt-3 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-300">
              Total Penalty Time:
            </span>
            <span className="text-xl font-bold text-red-400">
              {totalPenaltyTime} seconds
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}