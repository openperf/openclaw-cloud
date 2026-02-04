import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/I18nContext";
import { Download, Layers, Search, Star, RefreshCw, Plus, Edit, Trash2, Eye, FileEdit, Upload, FileDown, Share2, Copy, Check, Maximize2, Minimize2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.min.css";
import { QRCodeSVG } from "qrcode.react";

// Helper function to export skill as markdown file
const exportSkillAsMarkdown = (skill: any) => {
  const metadata = typeof skill.metadata === 'string' ? JSON.parse(skill.metadata) : skill.metadata;
  const content = metadata.content || '';
  
  const frontmatter = `---
name: ${skill.name}
description: ${skill.description}
category: ${skill.category}
provider: custom
---

`;
  
  const fullContent = frontmatter + content;
  const blob = new Blob([fullContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${skill.name}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Helper function to generate share link for skill
const generateShareLink = (skill: any) => {
  const metadata = typeof skill.metadata === 'string' ? JSON.parse(skill.metadata) : skill.metadata;
  const skillData = {
    name: skill.name,
    description: skill.description,
    category: skill.category,
    content: metadata.content || ''
  };
  
  const encoded = btoa(encodeURIComponent(JSON.stringify(skillData)));
  const baseUrl = window.location.origin;
  return `${baseUrl}/skills/shared?data=${encoded}`;
};

export default function Skills() {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingSkillId, setDeletingSkillId] = useState<number | null>(null);
  const [deletingSkillName, setDeletingSkillName] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [sharingSkill, setSharingSkill] = useState<any>(null);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [skillName, setSkillName] = useState("");
  const [skillDescription, setSkillDescription] = useState("");
  const [skillContent, setSkillContent] = useState("");
  const [skillCategory, setSkillCategory] = useState("general");
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState<"edit" | "preview" | "split">("split");
  const [importOpen, setImportOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: skills, isLoading } = trpc.skills.list.useQuery();
  const { data: instances } = trpc.instances.list.useQuery();

  const syncMutation = trpc.skills.sync.useMutation({
    onSuccess: () => {
      utils.skills.list.invalidate();
      toast.success(t('common.success'));
    },
    onError: (error) => {
      toast.error(`${t('common.error')}: ${error.message}`);
    },
  });

  const installMutation = trpc.skills.install.useMutation({
    onSuccess: () => {
      utils.skills.getInstalled.invalidate();
      utils.skills.list.invalidate();
      setSelectedSkill(null);
      setSelectedInstance("");
      toast.success(t('common.success'));
    },
    onError: (error) => {
      toast.error(`${t('common.error')}: ${error.message}`);
    },
  });

  const createMutation = trpc.skills.createCustom.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      setCreateOpen(false);
      resetForm();
      utils.skills.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    },
  });

  const updateMutation = trpc.skills.updateCustom.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      setEditOpen(false);
      setEditingSkillId(null);
      resetForm();
      utils.skills.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    },
  });

  const deleteMutation = trpc.skills.deleteCustom.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      setDeleteOpen(false);
      setDeletingSkillId(null);
      setDeletingSkillName("");
      utils.skills.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    },
  });

  const importMutation = trpc.skills.importCustom.useMutation({
    onSuccess: () => {
      utils.skills.list.invalidate();
      toast.success(t('common.success'));
    },
    onError: (error) => {
      toast.error(error.message || t('common.error'));
    },
  });

  const resetForm = () => {
    setSkillName("");
    setSkillDescription("");
    setSkillContent("");
    setSkillCategory("general");
    setSkillTags([]);
  };

  const filteredSkills = skills?.filter((skill) => {
    const matchesSearch = skill.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(skills?.map((s) => s.category).filter(Boolean))) as string[];

  const handleInstall = () => {
    if (!selectedInstance || !selectedSkill) {
      toast.error(t('skills.selectInstancePlaceholder'));
      return;
    }
    installMutation.mutate({
      instanceId: parseInt(selectedInstance),
      skillId: selectedSkill,
    });
  };

  const handleCreateSkill = () => {
    if (!skillName || !skillDescription || !skillContent) return;
    createMutation.mutate({
      name: skillName,
      description: skillDescription,
      category: skillCategory,
      content: skillContent,
      tags: skillTags,
    });
  };

  const handleEditSkill = (skill: any) => {
    setEditingSkillId(skill.id);
    setSkillName(skill.name);
    setSkillDescription(skill.description || "");
    setSkillCategory(skill.category || "general");
    setSkillTags(skill.tags || []);
    setSkillContent(skill.metadata?.content || "");
    setEditOpen(true);
  };

  const handleUpdateSkill = () => {
    if (!editingSkillId || !skillName || !skillDescription || !skillContent) return;
    updateMutation.mutate({
      id: editingSkillId,
      name: skillName,
      description: skillDescription,
      category: skillCategory,
      content: skillContent,
      tags: skillTags,
    });
  };

  const handleDeleteSkill = (skill: any) => {
    setDeletingSkillId(skill.id);
    setDeletingSkillName(skill.displayName);
    setDeleteOpen(true);
  };

  const confirmDeleteSkill = () => {
    if (!deletingSkillId) return;
    deleteMutation.mutate({ id: deletingSkillId });
  };

  const handleShareSkill = (skill: any) => {
    setSharingSkill(skill);
    const link = generateShareLink(skill);
    setShareLink(link);
    setShareOpen(true);
    setCopied(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success(t('skills.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error(t('common.error'));
    }
  };

  const handleImportFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        const frontmatterMatch = text.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
        if (!frontmatterMatch) {
          toast.error(`Invalid format in ${file.name}`);
          continue;
        }

        const [, frontmatter, content] = frontmatterMatch;
        const metadata: Record<string, string> = {};
        frontmatter.split('\n').forEach(line => {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            metadata[key.trim()] = valueParts.join(':').trim();
          }
        });

        if (!metadata.name) {
          toast.error(`Invalid format in ${file.name}`);
          continue;
        }

        await importMutation.mutateAsync({
          name: metadata.name,
          description: metadata.description || '',
          content: content.trim(),
          category: metadata.category || 'general',
        });
      } catch (error) {
        console.error(`Error importing ${file.name}:`, error);
      }
    }
    e.target.value = '';
  };

  // Form content for create/edit dialog
  const FormContent = () => (
    <div className="space-y-5 py-4 overflow-y-auto flex-1 flex flex-col">
      {/* Basic Info Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('skills.skillName')}</Label>
          <Input
            placeholder={t('skills.skillNamePlaceholder')}
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('skills.category')}</Label>
          <Select value={skillCategory} onValueChange={setSkillCategory}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="communication">Communication</SelectItem>
              <SelectItem value="automation">Automation</SelectItem>
              <SelectItem value="analysis">Analysis</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Description Row */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t('skills.skillDescription')}</Label>
        <Input
          placeholder={t('skills.skillDescriptionPlaceholder')}
          value={skillDescription}
          onChange={(e) => setSkillDescription(e.target.value)}
          className="h-11"
        />
      </div>
      
      {/* Content Editor - Takes remaining space */}
      <div className="space-y-3 flex-1 flex flex-col" style={{ minHeight: isFullscreen ? 'calc(100vh - 280px)' : '520px' }}>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{t('skills.skillContent')}</Label>
          <div className="flex gap-1 border rounded-lg p-1 bg-muted/50">
            <Button
              size="sm"
              variant={previewMode === "edit" ? "default" : "ghost"}
              className="h-8 px-3 text-xs"
              onClick={() => setPreviewMode("edit")}
            >
              <FileEdit className="h-3.5 w-3.5 mr-1.5" />
              {t('skills.editor')}
            </Button>
            <Button
              size="sm"
              variant={previewMode === "split" ? "default" : "ghost"}
              className="h-8 px-3 text-xs"
              onClick={() => setPreviewMode("split")}
            >
              {t('skills.split')}
            </Button>
            <Button
              size="sm"
              variant={previewMode === "preview" ? "default" : "ghost"}
              className="h-8 px-3 text-xs"
              onClick={() => setPreviewMode("preview")}
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              {t('skills.preview')}
            </Button>
          </div>
        </div>
        <div className="flex gap-4 flex-1" style={{ minHeight: '450px' }}>
          {(previewMode === "edit" || previewMode === "split") && (
            <textarea
              className={`${previewMode === "split" ? "w-1/2" : "w-full"} h-full p-4 border rounded-xl font-mono text-sm resize-none bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed`}
              placeholder={t('skills.skillContentPlaceholder')}
              value={skillContent}
              onChange={(e) => setSkillContent(e.target.value)}
              style={{ minHeight: '450px' }}
            />
          )}
          {(previewMode === "preview" || previewMode === "split") && (
            <div 
              className={`${previewMode === "split" ? "w-1/2" : "w-full"} h-full p-4 border rounded-xl overflow-y-auto prose prose-sm max-w-none dark:prose-invert bg-card`}
              style={{ minHeight: '450px' }}
            >
              {skillContent ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {skillContent}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground text-sm">{t('skills.preview')}...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('skills.title')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('skills.description')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('skills.createSkill')}
            </Button>
            <Button onClick={() => setImportOpen(true)} variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              {t('skills.importSkills')}
            </Button>
            <Button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              {syncMutation.isPending ? t('skills.syncing') : t('skills.syncSkills')}
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('skills.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px] h-10">
              <SelectValue placeholder={t('skills.allCategories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('skills.allCategories')}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredSkills && filteredSkills.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSkills.map((skill) => (
              <Card key={skill.id} className="hover-lift overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{skill.displayName}</CardTitle>
                          {skill.provider === "builtin" && (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                              {t('skills.builtIn')}
                            </span>
                          )}
                          {skill.provider === "custom" && (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400">
                              {t('skills.custom')}
                            </span>
                          )}
                        </div>
                        {skill.category && (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 mt-1">
                            {skill.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-3 line-clamp-2">
                    {skill.description || t('dashboard.noDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Download className="h-4 w-4" />
                        <span>{skill.downloadCount || 0}</span>
                      </div>
                      {skill.rating && skill.rating > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{skill.rating}</span>
                        </div>
                      )}
                    </div>
                    {skill.provider === "custom" ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditSkill(skill)}
                            className="h-8 px-2"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              exportSkillAsMarkdown(skill);
                              toast.success(t('skills.export'));
                            }}
                            className="h-8 px-2"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShareSkill(skill)}
                            className="h-8 px-2"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSkill(skill)}
                            className="h-8 px-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <Button
                          className="w-full gap-2"
                          size="sm"
                          onClick={() => setSelectedSkill(skill.id)}
                        >
                          <Download className="h-4 w-4" />
                          {t('skills.install')}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full gap-2"
                        size="sm"
                        onClick={() => setSelectedSkill(skill.id)}
                      >
                        <Download className="h-4 w-4" />
                        {t('skills.install')}
                      </Button>
                    )}
                    {skill.author && (
                      <p className="text-xs text-muted-foreground text-center">
                        by {skill.author}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4 text-center">
                {searchQuery || selectedCategory !== "all"
                  ? t('skills.noSkills')
                  : t('skills.noSkills')}
              </p>
              <Button onClick={() => syncMutation.mutate()} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                {t('skills.syncSkills')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Skill Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) setIsFullscreen(false); }}>
        <DialogContent className={`${isFullscreen ? '!max-w-full w-screen h-screen !m-0 !rounded-none !translate-x-0 !translate-y-0 !top-0 !left-0' : 'max-w-6xl w-[95vw] max-h-[90vh]'} overflow-hidden flex flex-col`}>
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle>{t('skills.createCustomSkill')}</DialogTitle>
                <DialogDescription>
                  {t('skills.createCustomSkillDesc')}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-2"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </DialogHeader>
          <FormContent />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreateSkill}
              disabled={!skillName || !skillDescription || !skillContent || createMutation.isPending}
            >
              {createMutation.isPending ? t('common.loading') : t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Skill Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setIsFullscreen(false); }}>
        <DialogContent className={`${isFullscreen ? '!max-w-full w-screen h-screen !m-0 !rounded-none !translate-x-0 !translate-y-0 !top-0 !left-0' : 'max-w-6xl w-[95vw] max-h-[90vh]'} overflow-hidden flex flex-col`}>
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle>{t('skills.editCustomSkill')}</DialogTitle>
                <DialogDescription>
                  {t('skills.editCustomSkillDesc')}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-2"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </DialogHeader>
          <FormContent />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleUpdateSkill}
              disabled={!skillName || !skillDescription || !skillContent || updateMutation.isPending}
            >
              {updateMutation.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Install Skill Dialog */}
      <Dialog open={selectedSkill !== null} onOpenChange={() => setSelectedSkill(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('skills.selectInstance')}</DialogTitle>
            <DialogDescription>
              {t('skills.selectInstancePlaceholder')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedInstance} onValueChange={setSelectedInstance}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder={t('skills.selectInstancePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {instances && instances.length > 0 ? (
                  instances.map((instance) => (
                    <SelectItem key={instance.id} value={instance.id.toString()}>
                      {instance.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    {t('instances.noInstancesYet')}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSkill(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleInstall}
              disabled={!selectedInstance || installMutation.isPending}
            >
              {installMutation.isPending ? t('skills.installing') : t('skills.install')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('skills.deleteSkill')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('skills.deleteSkillConfirm')} "{deletingSkillName}"? {t('skills.deleteSkillWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSkill}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? t('common.loading') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('skills.shareSkill')}</DialogTitle>
            <DialogDescription>
              {t('skills.shareSkillDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">{t('skills.copyLink')}</Label>
              <div className="flex gap-2">
                <Input value={shareLink} readOnly className="flex-1 h-10" />
                <Button variant="outline" size="icon" onClick={handleCopyLink} className="h-10 w-10">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label className="mb-2 block">QR Code</Label>
              <div className="flex justify-center p-4 bg-white rounded-xl">
                <QRCodeSVG value={shareLink} size={180} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareOpen(false)}>
              {t('common.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('skills.importSkills')}</DialogTitle>
            <DialogDescription>
              Upload .md files to import custom skills.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="file"
              accept=".md"
              multiple
              onChange={handleImportFiles}
              className="h-10"
            />
            <pre className="text-xs bg-muted p-3 rounded-lg mt-3 overflow-x-auto">
{`---
name: skill-name
description: Skill description
category: general
---

# Skill Content
...`}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              {t('common.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
