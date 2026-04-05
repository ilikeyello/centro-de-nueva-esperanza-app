import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";
// MediaItem interface - placeholder for future implementation
interface MediaItem {
  id: string;
  url: string;
  title?: string;
  name?: string; // Added for compatibility
}
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "../../contexts/LanguageContext";

export function Gallery() {
  const backend = useBackend();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPasscode, setUploadPasscode] = useState("");
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);

  // Media functionality not yet implemented in Supabase
  const { data: mediaData } = useQuery({
    queryKey: ["media"],
    queryFn: () => Promise.resolve({ media: [] }),
    enabled: false,
  });

  // Upload functionality not yet implemented in Supabase
  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; passcode: string }) => {
      throw new Error("Media upload not yet implemented");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      setShowUploadDialog(false);
      setSelectedFile(null);
      setUploadPasscode("");
      toast({
        title: t("Success", "Éxito"),
        description: t("Media uploaded successfully", "Medio subido exitosamente"),
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: t("Error", "Error"),
        description: t("Media upload not yet implemented", "Subida de medios no implementada"),
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      uploadMutation.mutate({ file: selectedFile, passcode: uploadPasscode.trim() });
    }
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[--ink-dark]">
          {t("Photo Gallery", "Galería de Fotos")}
        </h1>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[--sage] hover:bg-[--sage-mid]">
              <Upload className="mr-2 h-4 w-4" />
              {t("Upload Photo", "Subir Foto")}
            </Button>
          </DialogTrigger>
          <DialogContent className="border-[--border-color] bg-[--surface]">
            <DialogHeader>
              <DialogTitle className="text-[--ink-dark]">
                {t("Upload Photo", "Subir Foto")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="file" className="text-[--ink-mid]">
                  {t("Select Image", "Seleccionar Imagen")}
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  required
                  className="border-[--border-color] bg-[--surface-mid] text-[--ink-dark]"
                />
              </div>
              {selectedFile && (
                <div className="text-sm text-[--ink-light]">
                  {t("Selected:", "Seleccionado:")} {selectedFile.name}
                </div>
              )}
              <div>
                <Label htmlFor="uploadPasscode" className="text-[--ink-mid]">
                  {t("Passcode", "Código")}
                </Label>
                <Input
                  id="uploadPasscode"
                  type="password"
                  value={uploadPasscode}
                  onChange={(event) => setUploadPasscode(event.target.value)}
                  required
                  className="border-[--border-color] bg-[--surface-mid] text-[--ink-dark]"
                />
              </div>
              <Button
                type="submit"
                disabled={!selectedFile || uploadMutation.isPending || uploadPasscode.trim().length === 0}
                className="w-full bg-[--sage] hover:bg-[--sage-mid]"
              >
                {uploadMutation.isPending
                  ? t("Uploading...", "Subiendo...")
                  : t("Upload", "Subir")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {mediaData?.media?.map((item: MediaItem) => (
          <button
            key={item.id}
            onClick={() => setSelectedImage(item)}
            className="group relative aspect-square overflow-hidden rounded-lg border border-[--border-color] bg-[--surface] transition-transform hover:scale-105"
          >
            <img
              src={item.url}
              alt={item.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl border-[--border-color] bg-[--surface]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-[--ink-dark]">{selectedImage?.name}</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
