import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Heart, Plus, User } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";
import type { PrayerRequest } from "../../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "../../contexts/LanguageContext";

interface PrayersProps {
  onNavigate?: (page: string) => void;
}

export function Prayers({ onNavigate }: PrayersProps) {
  const backend = useBackend();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { data: prayersData } = useQuery({
    queryKey: ["prayers"],
    queryFn: () => backend.listPrayerRequests(),
  });

  // Prayer creation
  const createMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      isAnonymous: boolean;
      authorName: string;
    }) => {
      return backend.createPrayerRequest({
        title: data.title,
        description: data.description,
        isAnonymous: data.isAnonymous,
        authorName: data.isAnonymous ? null : (data.authorName || t("Anonymous", "Anónimo")),
        userId: null, // Could use a stored user ID if available
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayers"] });
      setShowCreateDialog(false);
      setIsAnonymous(false);
      toast({
        title: t("Success", "Éxito"),
        description: t("Prayer request submitted", "Petición de oración enviada"),
      });
    },
    onError: (error: Error) => {
      console.error(error);
      toast({
        title: t("Error", "Error"),
        description: error.message || t("Failed to submit prayer request", "Error al enviar petición"),
        variant: "destructive",
      });
    },
  });

  // Prayer functionality
  const prayMutation = useMutation({
    mutationFn: (prayerId: number) => backend.incrementPrayerCount(prayerId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["prayers"] });
      toast({
        title: t("Thank you", "Gracias"),
        description: t("Your prayer has been recorded", "Tu oración ha sido registrada"),
      });
    },
    onError: (error: Error) => {
      console.error(error);
      toast({
        title: t("Error", "Error"),
        description: error.message || t("Failed to record prayer", "Error al registrar oración"),
        variant: "destructive",
      });
    },
  });

  const handleCreatePrayer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      authorName: formData.get("authorName") as string,
      isAnonymous,
    });
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {onNavigate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("home")}
              className="text-[--ink-mid] hover:text-[--ink-dark]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-3xl font-bold text-[--ink-dark]">
            {t("Prayer Wall", "Muro de Oración")}
          </h1>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <button className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-[--sage] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[--sage-mid] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              <Plus className="mr-2 h-4 w-4" />
              {t("Submit Request", "Enviar Petición")}
            </button>
          </DialogTrigger>
          <DialogContent className="border-[--border-color] bg-[--surface]">
            <DialogHeader>
              <DialogTitle className="text-[--ink-dark]">
                {t("Submit Prayer Request", "Enviar Petición de Oración")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePrayer} className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-[--ink-mid]">
                  {t("Title", "Título")}
                </Label>
                <Input
                  id="title"
                  name="title"
                  required
                  className="border-[--border-color] bg-[--surface-mid] text-[--ink-dark]"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-[--ink-mid]">
                  {t("Description", "Descripción")}
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  className="border-[--border-color] bg-[--surface-mid] text-[--ink-dark]"
                />
              </div>
              <div>
                <Label htmlFor="authorName" className="text-[--ink-mid]">
                  {t("Name", "Nombre")}
                </Label>
                <Input
                  id="authorName"
                  name="authorName"
                  placeholder={t("Optional if anonymous", "Opcional si es anónimo")}
                  className="border-[--border-color] bg-[--surface-mid] text-[--ink-dark]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked === true)}
                />
                <Label htmlFor="anonymous" className="text-sm text-[--ink-mid]">
                  {t("Submit anonymously", "Enviar de forma anónima")}
                </Label>
              </div>
              <Button type="submit" className="w-full bg-[--sage] hover:bg-[--sage-mid]">
                {t("Submit Prayer Request", "Enviar Petición")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {prayersData?.prayers.map((prayer: PrayerRequest) => (
          <Card key={prayer.id} className="border-[--border-color] bg-[--surface]/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-[--ink-dark]">{prayer.title}</CardTitle>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[--ink-light]">
                    <User className="h-3 w-3" />
                    <span>
                      {prayer.isAnonymous
                        ? t("Anonymous", "Anónimo")
                        : prayer.userName || t("Guest", "Invitado")}
                    </span>
                    <span>•</span>
                    <span>{new Date(prayer.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => prayMutation.mutate(prayer.id)}
                  className="border-[--border-color] bg-[--surface-mid] hover:bg-[--surface]"
                >
                  <Heart className="mr-1 h-4 w-4 fill-red-500 text-red-500" />
                  <span>{prayer.prayerCount}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-[--ink-mid]">
                {prayer.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
