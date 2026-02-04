import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Download, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export default function SharedSkill() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/skills/shared");
  const [skillData, setSkillData] = useState<any>(null);
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState<"edit" | "split" | "preview">("preview");

  const utils = trpc.useUtils();

  // Parse skill data from URL
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const data = urlParams.get("data");
      
      if (!data) {
        setError("No skill data found in the link");
        return;
      }

      // Decode base64 and parse JSON
      const decoded = decodeURIComponent(atob(data));
      const parsed = JSON.parse(decoded);
      
      setSkillData(parsed);
    } catch (err) {
      console.error("Failed to parse skill data:", err);
      setError("Invalid share link. Please check the link and try again.");
    }
  }, []);

  const createMutation = trpc.skills.createCustom.useMutation({
    onSuccess: () => {
      toast.success("Skill installed successfully!");
      utils.skills.list.invalidate();
      navigate("/skills");
    },
    onError: (error) => {
      toast.error(`Failed to install skill: ${error.message}`);
    },
  });

  const handleInstall = () => {
    if (!skillData) return;

    createMutation.mutate({
      name: skillData.name,
      description: skillData.description,
      category: skillData.category,
      content: skillData.content,
    });
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>Error Loading Shared Skill</CardTitle>
            </div>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/skills")}>
              Go to Skills Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!skillData) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Parsing shared skill data...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            <CardTitle>{skillData.name}</CardTitle>
          </div>
          <CardDescription>{skillData.description}</CardDescription>
          <div className="flex gap-2 mt-4">
            <Button
              variant={previewMode === "preview" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode("preview")}
            >
              Preview
            </Button>
            <Button
              variant={previewMode === "split" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode("split")}
            >
              Split View
            </Button>
            <Button
              variant={previewMode === "edit" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode("edit")}
            >
              Source
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Content Preview */}
          <div>
            <label className="text-sm font-medium mb-2 block">Skill Content</label>
            <div className="border rounded-lg overflow-hidden">
              {previewMode === "split" && (
                <div className="grid grid-cols-2 gap-4 p-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Source</h4>
                    <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-[400px]">
                      {skillData.content}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Preview</h4>
                    <div className="prose prose-sm dark:prose-invert max-w-none p-4 overflow-auto max-h-[400px]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                        {skillData.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
              {previewMode === "preview" && (
                <div className="prose prose-sm dark:prose-invert max-w-none p-4 overflow-auto max-h-[500px]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                    {skillData.content}
                  </ReactMarkdown>
                </div>
              )}
              {previewMode === "edit" && (
                <pre className="text-sm bg-muted p-4 overflow-auto max-h-[500px]">
                  {skillData.content}
                </pre>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Category:</span>{" "}
              <span className="text-muted-foreground capitalize">{skillData.category}</span>
            </div>
            <div>
              <span className="font-medium">Provider:</span>{" "}
              <span className="text-muted-foreground">Custom</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleInstall}
              disabled={createMutation.isPending}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              {createMutation.isPending ? "Installing..." : "Install Skill"}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/skills")}
            >
              Go to Skills Marketplace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
