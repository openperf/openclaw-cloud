import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/I18nContext";
import { FolderOpen, Package, Plus, Trash2, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Collections() {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const { data: collections, isLoading } = trpc.collections.list.useQuery();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = trpc.collections.create.useMutation({
    onSuccess: () => {
      utils.collections.list.invalidate();
      setOpen(false);
      setName("");
      setDescription("");
      toast.success(t('common.success'));
    },
    onError: (error) => {
      toast.error(`${t('common.error')}: ${error.message}`);
    },
  });

  const deleteMutation = trpc.collections.delete.useMutation({
    onSuccess: () => {
      utils.collections.list.invalidate();
      toast.success(t('common.success'));
    },
    onError: (error) => {
      toast.error(`${t('common.error')}: ${error.message}`);
    },
  });

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error(t('collections.collectionName') + " " + t('common.error'));
      return;
    }
    createMutation.mutate({ name, description, skillIds: [] });
  };

  const handleDelete = (id: number) => {
    if (confirm(t('common.confirm') + "?")) {
      deleteMutation.mutate({ id });
    }
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('collections.title')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('collections.description')}
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('collections.createCollection')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('collections.createCollectionTitle')}</DialogTitle>
                <DialogDescription>
                  {t('collections.createCollectionDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('collections.collectionName')}</Label>
                  <Input
                    id="name"
                    placeholder={t('collections.collectionNamePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t('collections.collectionDescription')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('collections.collectionDescriptionPlaceholder')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? t('common.loading') : t('common.create')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {collections && collections.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Card key={collection.id} className="hover-lift overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{collection.name}</CardTitle>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-3">
                    {collection.description || t('collections.noDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>
                        {t('collections.skillCount', { count: collection.skillIds?.length || 0 })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="flex-1 gap-2"
                        disabled
                      >
                        <Download className="h-4 w-4" />
                        {t('collections.installAll')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(collection.id)}
                        disabled={deleteMutation.isPending}
                        className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4 text-center">
                {t('collections.noCollections')}
              </p>
              <Button onClick={() => setOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('collections.createCollection')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
