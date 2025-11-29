import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Plus, AlertCircle, Info, AlertTriangle, Bell } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";
import type { Announcement } from "~announcements/list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "../../contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function Announcements() {
  const backend = useBackend();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");

  const { data: announcementsData } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => backend.announcements.list({ limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      titleEn: string;
      titleEs: string;
      contentEn: string;
      contentEs: string;
      priority: "low" | "normal" | "high" | "urgent";
    }) => {
      return backend.announcements.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setShowCreateDialog(false);
      setPriority("normal");
      toast({
        title: t("Success", "Éxito"),
        description: t("Announcement created successfully", "Anuncio creado exitosamente"),
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: t("Error", "Error"),
        description: t("Failed to create announcement", "Error al crear anuncio"),
        variant: "destructive",
      });
    },
  });

  const handleCreateAnnouncement = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      titleEn: formData.get("titleEn") as string,
      titleEs: formData.get("titleEs") as string,
      contentEn: formData.get("contentEn") as string,
      contentEs: formData.get("contentEs") as string,
      priority,
    });
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Bell className="h-5 w-5 text-red-500" />;
      case "high":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case "normal":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "low":
        return <AlertTriangle className="h-5 w-5 text-neutral-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-red-600 bg-red-950/30";
      case "high":
        return "border-orange-600 bg-orange-950/30";
      case "normal":
        return "border-neutral-700 bg-neutral-900/50";
      case "low":
        return "border-neutral-800 bg-neutral-900/30";
      default:
        return "border-neutral-700 bg-neutral-900/50";
    }
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">
          {t("Church Announcements", "Anuncios de la Iglesia")}
        </h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              {t("New Announcement", "Nuevo Anuncio")}
            </Button>
          </DialogTrigger>
          <DialogContent className="border-neutral-800 bg-neutral-900">
            <DialogHeader>
              <DialogTitle className="text-white">
                {t("Create Announcement", "Crear Anuncio")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <Label htmlFor="titleEn" className="text-neutral-200">
                  {t("Title (English)", "Título (Inglés)")}
                </Label>
                <Input
                  id="titleEn"
                  name="titleEn"
                  required
                  className="border-neutral-700 bg-neutral-800 text-white"
                />
              </div>
              <div>
                <Label htmlFor="titleEs" className="text-neutral-200">
                  {t("Title (Spanish)", "Título (Español)")}
                </Label>
                <Input
                  id="titleEs"
                  name="titleEs"
                  required
                  className="border-neutral-700 bg-neutral-800 text-white"
                />
              </div>
              <div>
                <Label htmlFor="contentEn" className="text-neutral-200">
                  {t("Content (English)", "Contenido (Inglés)")}
                </Label>
                <Textarea
                  id="contentEn"
                  name="contentEn"
                  required
                  className="border-neutral-700 bg-neutral-800 text-white"
                />
              </div>
              <div>
                <Label htmlFor="contentEs" className="text-neutral-200">
                  {t("Content (Spanish)", "Contenido (Español)")}
                </Label>
                <Textarea
                  id="contentEs"
                  name="contentEs"
                  required
                  className="border-neutral-700 bg-neutral-800 text-white"
                />
              </div>
              <div>
                <Label className="text-neutral-200">
                  {t("Priority", "Prioridad")}
                </Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                  <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-neutral-700 bg-neutral-800">
                    <SelectItem value="low">{t("Low", "Baja")}</SelectItem>
                    <SelectItem value="normal">{t("Normal", "Normal")}</SelectItem>
                    <SelectItem value="high">{t("High", "Alta")}</SelectItem>
                    <SelectItem value="urgent">{t("Urgent", "Urgente")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                {t("Create Announcement", "Crear Anuncio")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {announcementsData?.announcements.map((announcement) => (
          <Card
            key={announcement.id}
            className={cn("border-2", getPriorityColor(announcement.priority))}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-white">
                    {getPriorityIcon(announcement.priority)}
                    {language === "en" ? announcement.titleEn : announcement.titleEs}
                  </CardTitle>
                  <p className="mt-1 text-xs text-neutral-400">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-neutral-300">
                {language === "en" ? announcement.contentEn : announcement.contentEs}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
