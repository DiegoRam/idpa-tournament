"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api, Id } from "@/lib/convex";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Eye } from "lucide-react";
import { StageDesigner } from "@/components/features/stages/StageDesigner";
import { StageViewer } from "@/components/features/stages/StageViewer";
import { StageDiagram } from "@/types/stage-designer";
import { toast } from "sonner";

export default function StageDesignPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.tournamentId as Id<"tournaments">;
  const stageId = params.stageId as Id<"stages">;
  
  const [isPreview, setIsPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localDiagram, setLocalDiagram] = useState<StageDiagram | null>(null);
  
  const currentUser = useQuery(api.userAuth.getCurrentUser);
  const tournament = useQuery(api.tournaments.getTournamentById, { tournamentId });
  const stage = useQuery(api.stages.getStageById, { stageId });
  
  const updateDiagram = useMutation(api.stages.updateStageDiagram);
  
  // Initialize local diagram from stage data
  useEffect(() => {
    if (stage && !localDiagram) {
      setLocalDiagram(stage.diagram as StageDiagram);
    }
  }, [stage, localDiagram]);
  
  // Check access - only admins and club owners can design stages
  const hasAccess = currentUser && (
    currentUser.role === "admin" || 
    (currentUser.role === "clubOwner" && tournament?.clubId === currentUser.clubId)
  );
  
  const handleDiagramChange = (newDiagram: StageDiagram) => {
    setLocalDiagram(newDiagram);
    setHasUnsavedChanges(true);
  };
  
  const handleSave = async () => {
    if (!localDiagram) return;
    
    try {
      await updateDiagram({
        stageId,
        diagram: localDiagram,
      });
      
      setHasUnsavedChanges(false);
      toast.success("Stage diagram saved successfully");
    } catch (error) {
      console.error("Failed to save diagram:", error);
      toast.error("Failed to save stage diagram");
    }
  };
  
  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
  
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
              Only tournament administrators can design stages.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!tournament || !stage || !localDiagram) {
    return null;
  }
  
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (hasUnsavedChanges) {
                  if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
                    router.push(`/scoring/${tournamentId}/stages`);
                  }
                } else {
                  router.push(`/scoring/${tournamentId}/stages`);
                }
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Stages
            </Button>
            <div>
              <h1 className="text-xl font-bold text-green-400">
                Stage {stage.stageNumber}: {stage.name}
              </h1>
              <p className="text-sm text-gray-400">
                {tournament.name} - Stage Designer
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="text-sm text-yellow-500">
                Unsaved changes
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreview ? "Edit" : "Preview"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {isPreview ? (
          <StageViewer
            diagram={localDiagram}
            stageInfo={{
              name: stage.name,
              description: stage.description,
              stageNumber: stage.stageNumber,
            }}
          />
        ) : (
          <StageDesigner
            diagram={localDiagram}
            onChange={handleDiagramChange}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}