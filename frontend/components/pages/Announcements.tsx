import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Plus, AlertCircle, Info, AlertTriangle, Bell } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";
import type { Announcement } from "../../hooks/useBackend";
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
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");

  const { data: announcementsData } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => backend.listAnnouncements({ limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      titleEn: string;
      titleEs: string;
      contentEn: string;
      contentEs: string;
      priority: "normal" | "urgent";
      passcode: string;
    }) => {
      return backend.createAnnouncement({
        titleEn: data.titleEn,
        titleEs: data.titleEs,
        contentEn: data.contentEn,
        contentEs: data.contentEs,
        priority: data.priority,
      });
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
      passcode: formData.get("passcode") as string,
    });
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "normal":
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-red-500 bg-red-50";
      case "normal":
      default:
        return "border-neutral-200 bg-white";
    }
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900">
          {t("Church Announcements", "Anuncios de la Iglesia")}
        </h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              {t("New Announcement", "Nuevo Anuncio")}
            </Button>
          </DialogTrigger>
          <DialogContent className="border-neutral-200 bg-white shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-neutral-900">
                {t("Create Announcement", "Crear Anuncio")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <Label htmlFor="titleEn" className="text-neutral-700">
                  {t("Title (English)", "Título (Inglés)")}
                </Label>
                <Input
                  id="titleEn"
                  name="titleEn"
                  required
                  className="border-neutral-300 bg-white text-neutral-900"
                />
              </div>
              <div>
                <Label htmlFor="titleEs" className="text-neutral-700">
                  {t("Title (Spanish)", "Título (Español)")}
                </Label>
                <Input
                  id="titleEs"
                  name="titleEs"
                  required
                  className="border-neutral-300 bg-white text-neutral-900"
                />
              </div>
              <div>
                <Label htmlFor="contentEn" className="text-neutral-700">
                  {t("Content (English)", "Contenido (Inglés)")}
                </Label>
                <Textarea
                  id="contentEn"
                  name="contentEn"
                  required
                  className="border-neutral-300 bg-white text-neutral-900"
                />
              </div>
              <div>
                <Label htmlFor="contentEs" className="text-neutral-700">
                  {t("Content (Spanish)", "Contenido (Español)")}
                </Label>
                <Textarea
                  id="contentEs"
                  name="contentEs"
                  required
                  className="border-neutral-300 bg-white text-neutral-900"
                />
              </div>
              <div>
                <Label htmlFor="imageUrl" className="text-neutral-700">
                  {t("Image URL (optional)", "URL de imagen (opcional)")}
                </Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  placeholder={t("https://example.com/image.jpg", "https://ejemplo.com/imagen.jpg")}
                  className="border-neutral-300 bg-white text-neutral-900"
                />
              </div>
              <div>
                <Label className="text-neutral-700">
                  {t("Priority", "Prioridad")}
                </Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                  <SelectTrigger className="border-neutral-300 bg-white text-neutral-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-neutral-200 bg-white">
                    <SelectItem value="normal">{t("Normal", "Normal")}</SelectItem>
                    <SelectItem value="urgent">{t("Urgent", "Urgente")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="passcode" className="text-neutral-700">
                  {t("Passcode", "Contraseña")}
                </Label>
                <Input
                  id="passcode"
                  name="passcode"
                  type="password"
                  required
                  placeholder={t("Enter a passcode for editing/deleting", "Ingrese una contraseña para editar/eliminar")}
                  className="border-neutral-300 bg-white text-neutral-900"
                />
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                {t("Create Announcement", "Crear Anuncio")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {announcementsData?.announcements.map((announcement: Announcement) => (
          <Card
            key={announcement.id}
            className={cn("border-2", getPriorityColor(announcement.priority))}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-neutral-900">
                    {getPriorityIcon(announcement.priority)}
                    {language === "en" ? announcement.titleEn : announcement.titleEs}
                  </CardTitle>
                  <p className="mt-1 text-xs text-neutral-500">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {announcement.imageUrl && (
                <div className="mb-3 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                  <img
                    src={announcement.imageUrl}
                    alt={language === "en" ? announcement.titleEn : announcement.titleEs}
                    className="max-h-64 w-full object-cover"
                  />
                </div>
              )}
              <p className="whitespace-pre-wrap text-neutral-700">
                {language === "en" ? announcement.contentEn : announcement.contentEs}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
