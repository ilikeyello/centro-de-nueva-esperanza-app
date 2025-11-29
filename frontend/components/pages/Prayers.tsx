import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Heart, Plus, User } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";
import type { Prayer } from "~prayers/list";
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
    queryFn: () => backend.prayers.list({ limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      isAnonymous: boolean;
    }) => {
      return backend.prayers.create(data);
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
    onError: (error) => {
      console.error(error);
      toast({
        title: t("Error", "Error"),
        description: t("Failed to submit prayer request", "Error al enviar petición"),
        variant: "destructive",
      });
    },
  });

  const prayMutation = useMutation({
    mutationFn: (prayerId: number) => {
      return backend.prayers.pray({ prayerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayers"] });
      toast({
        title: t("Thank you", "Gracias"),
        description: t("Your prayer has been recorded", "Tu oración ha sido registrada"),
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: t("Error", "Error"),
        description: t("Failed to record prayer", "Error al registrar oración"),
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
              className="text-neutral-300 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-3xl font-bold text-white">
            {t("Prayer Wall", "Muro de Oración")}
          </h1>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              {t("Submit Request", "Enviar Petición")}
            </Button>
          </DialogTrigger>
          <DialogContent className="border-neutral-800 bg-neutral-900">
            <DialogHeader>
              <DialogTitle className="text-white">
                {t("Submit Prayer Request", "Enviar Petición de Oración")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePrayer} className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-neutral-200">
                  {t("Title", "Título")}
                </Label>
                <Input
                  id="title"
                  name="title"
                  required
                  className="border-neutral-700 bg-neutral-800 text-white"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-neutral-200">
                  {t("Description", "Descripción")}
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  className="border-neutral-700 bg-neutral-800 text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked === true)}
                />
                <Label htmlFor="anonymous" className="text-sm text-neutral-200">
                  {t("Submit anonymously", "Enviar de forma anónima")}
                </Label>
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                {t("Submit Prayer Request", "Enviar Petición")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {prayersData?.prayers.map((prayer) => (
          <Card key={prayer.id} className="border-neutral-800 bg-neutral-900/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white">{prayer.title}</CardTitle>
                  <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
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
                  className="border-neutral-700 bg-neutral-800 hover:bg-neutral-700"
                >
                  <Heart className="mr-1 h-4 w-4 fill-red-500 text-red-500" />
                  <span>{prayer.prayerCount}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-neutral-300">
                {prayer.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
