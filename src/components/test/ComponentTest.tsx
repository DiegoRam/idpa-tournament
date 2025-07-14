"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { IDPA_DIVISIONS, IDPA_CLASSIFICATIONS } from "@/lib/utils";

export function ComponentTest() {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-green-400">UI Component Test</CardTitle>
          <CardDescription>Testing all custom UI components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Button Variants */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Button Variants</h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="tactical">Tactical</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>

          {/* Badge Variants */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Badge Variants</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="tactical">Tactical</Badge>
              <Badge variant="division">Division</Badge>
              <Badge variant="classification">Classification</Badge>
              <Badge variant="status">Status</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          {/* IDPA Divisions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">IDPA Divisions</h4>
            <div className="flex flex-wrap gap-2">
              {IDPA_DIVISIONS.map((division) => (
                <Badge key={division.code} variant="division" title={division.description}>
                  {division.code}
                </Badge>
              ))}
            </div>
          </div>

          {/* IDPA Classifications */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">IDPA Classifications</h4>
            <div className="flex flex-wrap gap-2">
              {IDPA_CLASSIFICATIONS.map((classification) => (
                <Badge key={classification.value} variant="classification" title={classification.description}>
                  {classification.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Input Component */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Input Component</h4>
            <Input placeholder="Test input field..." className="max-w-sm" />
          </div>

          {/* Tactical Effects */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Tactical Effects</h4>
            <div className="space-y-2">
              <div className="p-3 tactical-border rounded-md">
                <p className="text-sm">Tactical Border Effect</p>
              </div>
              <div className="p-3 tactical-glow rounded-md bg-slate-800">
                <p className="text-sm">Tactical Glow Effect</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}