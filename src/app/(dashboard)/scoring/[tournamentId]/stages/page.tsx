"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api, Id } from "@/lib/convex";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft,
  Target, 
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Save,
  X
} from "lucide-react";

export default function StageManagementPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.tournamentId as Id<"tournaments">;
  
  const currentUser = useQuery(api.userAuth.getCurrentUser);
  const tournament = useQuery(api.tournaments.getTournamentById, { tournamentId });
  const stages = useQuery(api.stages.getStagesByTournament, { tournamentId });
  
  const deleteStage = useMutation(api.stages.deleteStage);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  
  // Check access - only admins and club owners can manage stages
  const hasAccess = currentUser && (
    currentUser.role === "admin" || 
    (currentUser.role === "clubOwner" && tournament?.clubId === currentUser.clubId)
  );
  
  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-red-900/20 border-red-800">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Only tournament administrators can manage stages.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!tournament || !stages) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/scoring/${tournamentId}`)}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournament
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-400">
              Stage Management
            </h1>
            <p className="text-gray-400">
              {tournament.name}
            </p>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Stage
              </Button>
            </DialogTrigger>
            <DialogContent>
              <CreateStageForm
                tournamentId={tournamentId}
                nextStageNumber={stages.length + 1}
                onSuccess={() => setIsCreating(false)}
                onCancel={() => setIsCreating(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Stages List */}
      <div className="space-y-4">
        {stages.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Target className="h-12 w-12 text-gray-600 mb-4" />
              <p className="text-gray-400 mb-2">No stages created yet</p>
              <p className="text-sm text-gray-500">
                Add stages to define the course of fire for this tournament
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {stages.map((stage) => (
              <StageCard
                key={stage._id}
                stage={stage}
                isEditing={editingStage === stage._id}
                onEdit={() => setEditingStage(stage._id)}
                onCancelEdit={() => setEditingStage(null)}
                onDelete={async () => {
                  if (confirm(`Delete Stage ${stage.stageNumber}: ${stage.name}?`)) {
                    try {
                      await deleteStage({ stageId: stage._id });
                    } catch {
                      alert("Cannot delete stage with existing scores");
                    }
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface StageCardProps {
  stage: {
    _id: Id<"stages">;
    stageNumber: number;
    name: string;
    description: string;
    strings: number;
    roundCount: number;
    parTime?: number;
  };
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}

function StageCard({ stage, isEditing, onEdit, onCancelEdit, onDelete }: StageCardProps) {
  const updateStage = useMutation(api.stages.updateStage);
  const [formData, setFormData] = useState({
    name: stage.name,
    description: stage.description,
    parTime: stage.parTime || undefined,
  });
  
  const handleSave = async () => {
    try {
      await updateStage({
        stageId: stage._id,
        ...formData,
      });
      onCancelEdit();
    } catch {
      alert("Failed to update stage");
    }
  };
  
  if (isEditing) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-green-400">
              Stage {stage.stageNumber}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSave}
                className="text-green-400 hover:text-green-300"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancelEdit}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Stage Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-gray-800 border-gray-700"
              rows={3}
            />
          </div>
          <div>
            <Label>Par Time (seconds)</Label>
            <Input
              type="number"
              value={formData.parTime || ""}
              onChange={(e) => setFormData({ 
                ...formData, 
                parTime: e.target.value ? Number(e.target.value) : undefined 
              })}
              className="bg-gray-800 border-gray-700"
              placeholder="Optional"
            />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-green-400">
              Stage {stage.stageNumber}: {stage.name}
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              {stage.strings} strings • {stage.roundCount} rounds per string
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onEdit}
              className="text-gray-400 hover:text-gray-300"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-300 mb-3">{stage.description}</p>
        {stage.parTime && (
          <Badge variant="outline" className="text-xs">
            Par Time: {stage.parTime}s
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

interface CreateStageFormProps {
  tournamentId: Id<"tournaments">;
  nextStageNumber: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function CreateStageForm({ tournamentId, nextStageNumber, onSuccess, onCancel }: CreateStageFormProps) {
  const createStage = useMutation(api.stages.createStage);
  const [formData, setFormData] = useState({
    stageNumber: nextStageNumber,
    name: "",
    description: "",
    strings: 1,
    roundCount: 10,
    parTime: undefined as number | undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createStage({
        tournamentId,
        ...formData,
      });
      onSuccess();
    } catch {
      alert("Failed to create stage");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Create New Stage</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Stage Number</Label>
            <Input
              type="number"
              value={formData.stageNumber}
              onChange={(e) => setFormData({ ...formData, stageNumber: Number(e.target.value) })}
              className="bg-gray-800 border-gray-700"
              required
            />
          </div>
          <div>
            <Label>Stage Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-gray-800 border-gray-700"
              placeholder="e.g., Standards"
              required
            />
          </div>
        </div>
        
        <div>
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="bg-gray-800 border-gray-700"
            rows={3}
            placeholder="Describe the course of fire..."
            required
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Strings</Label>
            <Input
              type="number"
              value={formData.strings}
              onChange={(e) => setFormData({ ...formData, strings: Number(e.target.value) })}
              className="bg-gray-800 border-gray-700"
              min={1}
              required
            />
          </div>
          <div>
            <Label>Rounds/String</Label>
            <Input
              type="number"
              value={formData.roundCount}
              onChange={(e) => setFormData({ ...formData, roundCount: Number(e.target.value) })}
              className="bg-gray-800 border-gray-700"
              min={1}
              required
            />
          </div>
          <div>
            <Label>Par Time (s)</Label>
            <Input
              type="number"
              value={formData.parTime || ""}
              onChange={(e) => setFormData({ 
                ...formData, 
                parTime: e.target.value ? Number(e.target.value) : undefined 
              })}
              className="bg-gray-800 border-gray-700"
              placeholder="Optional"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? "Creating..." : "Create Stage"}
        </Button>
      </div>
    </form>
  );
}