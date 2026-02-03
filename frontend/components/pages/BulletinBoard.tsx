import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useLanguage } from "../../contexts/LanguageContext";
import { useBackend } from "../../hooks/useBackend";

const PRAYER_PARTICIPANT_ID_KEY = "cne-prayer-participant-id";
const PRAYED_PRAYERS_KEY = "cne-prayed-prayer-ids";
const USER_NAME_KEY = "cne-user-name";
const USER_ID_KEY = "cne-user-id";

interface BulletinComment {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
}

interface PrayerWithComments {
  id: number;
  title: string;
  description: string;
  isAnonymous: boolean;
  userName: string | null;
  prayerCount: number;
  createdAt: string;
  comments: BulletinComment[];
}

interface BulletinPost {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  comments: BulletinComment[];
}

interface BoardResponse {
  prayers: PrayerWithComments[];
  posts: BulletinPost[];
}


const fetchBoard = async (backend: ReturnType<typeof useBackend>): Promise<BoardResponse> => {
  const [prayersResult, postsResult] = await Promise.all([
    backend.listPrayerRequests(),
    backend.listBulletinPosts()
  ]);

  return {
    prayers: prayersResult.prayers.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      isAnonymous: p.isAnonymous,
      userName: p.userName,
      prayerCount: p.prayerCount,
      createdAt: p.createdAt,
      comments: p.comments || []
    })),
    posts: postsResult.posts.map(p => ({
      id: p.id,
      title: p.title,
      content: p.content,
      authorName: p.authorName,
      createdAt: p.createdAt,
      comments: p.comments || []
    }))
  };
};

interface CommentFormState {
  authorName: string;
  content: string;
}

type CommentKey = `post-${number}` | `prayer-${number}`;

const emptyComment: CommentFormState = {
  authorName: "",
  content: "",
};

const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleString();
  } catch (error) {
    console.error(error);
    return date;
  }
};

type Tab = "community" | "prayers";

export function BulletinBoard() {
  const backend = useBackend();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>("community");

  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [prayerDialogOpen, setPrayerDialogOpen] = useState(false);

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    authorName: "",
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [newPrayer, setNewPrayer] = useState({
    title: "",
    description: "",
    authorName: "",
  });

  const [commentForms, setCommentForms] = useState<Record<CommentKey, CommentFormState>>({});
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [prayedPrayerIds, setPrayedPrayerIds] = useState<Set<number>>(() => new Set());
  const [activePrayerId, setActivePrayerId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["bulletin-board"],
    queryFn: () => fetchBoard(backend),
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load or create user ID
    let storedUserId = window.localStorage.getItem(USER_ID_KEY);
    if (!storedUserId) {
      storedUserId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      window.localStorage.setItem(USER_ID_KEY, storedUserId);
    }
    setUserId(storedUserId);

    // Load saved user name
    const storedName = window.localStorage.getItem(USER_NAME_KEY);
    if (storedName) {
      setNewPost(prev => ({ ...prev, authorName: storedName }));
      setNewPrayer(prev => ({ ...prev, authorName: storedName }));
    }

    // Load participant ID for prayers
    let storedId = window.localStorage.getItem(PRAYER_PARTICIPANT_ID_KEY);
    if (!storedId) {
      storedId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      window.localStorage.setItem(PRAYER_PARTICIPANT_ID_KEY, storedId);
    }
    setParticipantId(storedId);

    const storedPrayed = window.localStorage.getItem(PRAYED_PRAYERS_KEY);
    if (storedPrayed) {
      try {
        const parsed = JSON.parse(storedPrayed) as number[];
        setPrayedPrayerIds(new Set(parsed));
      } catch (error) {
        console.error("Failed to parse prayed prayers from storage", error);
      }
    }
  }, []);

  const ensureParticipantId = () => {
    if (participantId) return participantId;
    if (typeof window === "undefined") return null;

    let storedId = window.localStorage.getItem(PRAYER_PARTICIPANT_ID_KEY);
    if (!storedId) {
      storedId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      window.localStorage.setItem(PRAYER_PARTICIPANT_ID_KEY, storedId);
    }
    setParticipantId(storedId);
    return storedId;
  };

  const prayMutation = useMutation({
    mutationFn: async (variables: { prayerId: number; participantId?: string | null }) => {
      await backend.incrementPrayerCount(variables.prayerId);
      return { prayerCount: 0 }; // We rely on invalidation to get fresh count
    },
    onMutate: (variables) => {
      setActivePrayerId(variables.prayerId);
    },
    onSuccess: (result, variables) => {
      setPrayedPrayerIds((previous) => {
        const updated = new Set(previous);
        updated.add(variables.prayerId);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(PRAYED_PRAYERS_KEY, JSON.stringify(Array.from(updated)));
        }
        return updated;
      });

      toast({
        title: t("Thank you for praying", "Gracias por orar"),
        description: t("We've recorded your prayer.", "Hemos registrado tu oración."),
      });

      queryClient.invalidateQueries({ queryKey: ["bulletin-board"] });
    },
    onError: (error: Error) => {
      toast({
        title: t("Error", "Error"),
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setActivePrayerId(null);
    },
  });

  const handlePray = (prayerId: number) => {
    if (prayedPrayerIds.has(prayerId)) {
      return;
    }
    const id = ensureParticipantId();
    prayMutation.mutate({ prayerId, participantId: id });
  };

  const createPostMutation = useMutation({
    mutationFn: (data: { title: string; content: string; authorName: string; authorId: string | null; organizationId: string }) => 
      backend.createBulletinPost({
        title: data.title,
        content: data.content,
        authorName: data.authorName,
        authorId: data.authorId
      }),
    onSuccess: () => {
      const savedName = newPost.authorName.trim();
      if (savedName && typeof window !== "undefined") {
        window.localStorage.setItem(USER_NAME_KEY, savedName);
      }
      setNewPost({ title: "", content: "", authorName: savedName });
      queryClient.invalidateQueries({ queryKey: ["bulletin-board"] });
      setPostDialogOpen(false);
      toast({
        title: t("Post created", "Publicación creada"),
        description: t("Your bulletin post is now live.", "Tu publicación ya está visible."),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("Error", "Error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createPrayerMutation = useMutation({
    mutationFn: (data: { title: string; description: string; isAnonymous: boolean; authorName?: string | null; userId: string | null; organizationId: string }) =>
      backend.createPrayerRequest({
        title: data.title,
        description: data.description,
        isAnonymous: data.isAnonymous,
        authorName: data.authorName,
        userId: data.userId
      }),
    onSuccess: () => {
      const savedName = newPrayer.authorName.trim();
      if (savedName && typeof window !== "undefined") {
        window.localStorage.setItem(USER_NAME_KEY, savedName);
      }
      setNewPrayer({ title: "", description: "", authorName: savedName });
      setPrayerDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["bulletin-board"] });
      toast({
        title: t("Prayer shared", "Petición compartida"),
        description: t("We're praying with you.", "Estamos orando contigo."),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("Error", "Error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (data: {
      targetType: "post" | "prayer";
      targetId: number;
      authorName: string;
      authorId: string | null;
      content: string;
      organizationId: string;
    }) => {
      if (data.targetType === "post") {
        return backend.createBulletinComment({
          postId: data.targetId,
          content: data.content,
          authorName: data.authorName,
          authorId: data.authorId
        });
      } else {
        return backend.createPrayerComment({
          prayerId: data.targetId,
          content: data.content,
          authorName: data.authorName,
          authorId: data.authorId
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bulletin-board"] });
      toast({
        title: t("Comment added", "Comentario añadido"),
        description: t("Thank you for contributing.", "Gracias por contribuir."),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("Error", "Error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const prayers = useMemo(() => data?.prayers ?? [], [data]);
  const posts = useMemo(() => data?.posts ?? [], [data]);

  const handleSubmitPost = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const orgId = import.meta.env.VITE_CHURCH_ORG_ID;
    if (!orgId) {
      toast({
        title: t("Error", "Error"),
        description: "Organization ID not configured",
        variant: "destructive",
      });
      return;
    }
    createPostMutation.mutate({
      title: newPost.title.trim(),
      content: newPost.content.trim(),
      authorName: newPost.authorName.trim() || t("Anonymous", "Anónimo"),
      authorId: userId,
      organizationId: orgId,
    });
  };

  const handleSubmitPrayer = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const orgId = import.meta.env.VITE_CHURCH_ORG_ID;
    if (!orgId) {
      toast({
        title: t("Error", "Error"),
        description: "Organization ID not configured",
        variant: "destructive",
      });
      return;
    }
    const trimmedName = newPrayer.authorName.trim();
    createPrayerMutation.mutate({
      title: newPrayer.title.trim(),
      description: newPrayer.description.trim(),
      isAnonymous: trimmedName.length === 0,
      authorName: trimmedName.length > 0 ? trimmedName : null,
      userId: userId,
      organizationId: orgId,
    });
  };

  const handleCommentChange = (key: CommentKey, field: keyof CommentFormState, value: string) => {
    setCommentForms((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] ?? emptyComment),
        [field]: value,
      },
    }));
  };

  const handleSubmitComment = (event: React.FormEvent<HTMLFormElement>, targetId: number, targetType: "post" | "prayer") => {
    event.preventDefault();
    const key: CommentKey = `${targetType}-${targetId}` as CommentKey;
    const form = commentForms[key] ?? emptyComment;

    const orgId = import.meta.env.VITE_CHURCH_ORG_ID;
    if (!orgId) {
      toast({
        title: t("Error", "Error"),
        description: "Organization ID not configured",
        variant: "destructive",
      });
      return;
    }
    commentMutation.mutate(
      {
        targetType,
        targetId,
        authorName: form.authorName.trim() || t("Anonymous", "Anónimo"),
        authorId: userId,
        content: form.content.trim(),
        organizationId: orgId,
      },
      {
        onSuccess: () => {
          setCommentForms((prev) => ({
            ...prev,
            [key]: emptyComment,
          }));
        },
      }
    );
  };

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {t("Community Hub", "Centro Comunitario")}
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              {t(
                "Share updates, testimonies, and prayer needs with our bilingual church family.",
                "Comparte actualizaciones, testimonios y peticiones de oración con nuestra familia bilingüe."
              )}
            </p>
          </div>
          <div className="flex w-full items-center gap-2 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/60 p-1 md:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("community")}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors text-center md:flex-none",
                activeTab === "community" ? "bg-red-600 text-white" : "text-neutral-300 hover:text-white"
              )}
            >
              {t("Community", "Comunidad")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("prayers")}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors text-center md:flex-none",
                activeTab === "prayers" ? "bg-red-600 text-white" : "text-neutral-300 hover:text-white"
              )}
            >
              {t("Prayer Wall", "Muro de Oración")}
            </button>
          </div>
        </div>

        {activeTab === "community" ? (
          <>
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {t("Community Posts", "Publicaciones de la Comunidad")}
                </h2>
                <p className="text-sm text-neutral-400">
                  {t("Share updates, testimonies, and encouragement with everyone.", "Comparte actualizaciones, testimonios y ánimo con todos.")}
                </p>
              </div>

              {isLoading && (
                <p className="text-sm text-neutral-400">
                  {t("Loading posts...", "Cargando publicaciones...")}
                </p>
              )}

              <div className="space-y-6">
                {posts.map((post) => {
                  const commentKey: CommentKey = `post-${post.id}` as CommentKey;
                  const commentForm = commentForms[commentKey] ?? emptyComment;

                  return (
                    <Card key={post.id} className="border-neutral-800 bg-neutral-900/60">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <CardTitle className="text-white">{post.title}</CardTitle>
                            <div className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
                              <User className="h-3 w-3" />
                              <span>{post.authorName}</span>
                              <span>•</span>
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="whitespace-pre-wrap text-sm text-neutral-300">{post.content}</p>

                        <div className="space-y-3">
                          {post.comments.length > 0 ? (
                            post.comments.map((comment) => (
                              <div key={comment.id} className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3 text-sm">
                                <div className="mb-1 flex items-center justify-between text-xs text-neutral-400">
                                  <span>{comment.authorName}</span>
                                  <span>{formatDate(comment.createdAt)}</span>
                                </div>
                                <p className="text-neutral-200">{comment.content}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-neutral-500">
                              {t("No comments yet. Be the first to respond.", "Sin comentarios aún. Sé el primero en responder.")}
                            </p>
                          )}
                        </div>

                        <div className="h-px bg-neutral-800" />

                        <form className="space-y-3" onSubmit={(event) => handleSubmitComment(event, post.id, "post")}>
                          <div className="grid gap-2">
                            <Label className="text-neutral-300" htmlFor={`post-comment-name-${post.id}`}>
                              {t("Name", "Nombre")}
                            </Label>
                            <Input
                              id={`post-comment-name-${post.id}`}
                              value={commentForm.authorName}
                              onChange={(event) => handleCommentChange(commentKey, "authorName", event.target.value)}
                              placeholder={t("Optional", "Opcional")}
                              className="border-neutral-700 bg-neutral-800 text-white"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-neutral-300" htmlFor={`post-comment-content-${post.id}`}>
                              {t("Comment", "Comentario")}
                            </Label>
                            <Textarea
                              id={`post-comment-content-${post.id}`}
                              value={commentForm.content}
                              onChange={(event) => handleCommentChange(commentKey, "content", event.target.value)}
                              required
                              className="border-neutral-700 bg-neutral-800 text-white"
                              rows={2}
                            />
                          </div>
                          <Button
                            type="submit"
                            disabled={commentMutation.isPending || commentForm.content.trim().length === 0}
                            className="w-full bg-red-600 hover:bg-red-700"
                          >
                            {t("Add Comment", "Agregar Comentario")}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {!isLoading && posts.length === 0 && (
                <p className="text-sm text-neutral-400">
                  {t("No community posts yet. Start the conversation above!", "No hay publicaciones aún. ¡Comienza la conversación arriba!")}
                </p>
              )}
            </section>

            <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-red-600 text-white shadow-xl transition-transform hover:scale-105 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-300 md:bottom-12 md:right-12"
                  aria-label={t("Create a new community post", "Crear una nueva publicación comunitaria")}
                >
                  <Plus className="h-6 w-6" />
                  <span className="sr-only">
                    {t("Create a new community post", "Crear una nueva publicación comunitaria")}
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="border-neutral-800 bg-neutral-900">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {t("Create Post", "Crear Publicación")}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitPost} className="space-y-4">
                  <div>
                    <Label htmlFor="bulletin-title" className="text-neutral-200">
                      {t("Title", "Título")}
                    </Label>
                    <Input
                      id="bulletin-title"
                      value={newPost.title}
                      onChange={(event) => setNewPost((prev) => ({ ...prev, title: event.target.value }))}
                      required
                      className="border-neutral-700 bg-neutral-800 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bulletin-content" className="text-neutral-200">
                      {t("Description", "Descripción")}
                    </Label>
                    <Textarea
                      id="bulletin-content"
                      value={newPost.content}
                      onChange={(event) => setNewPost((prev) => ({ ...prev, content: event.target.value }))}
                      required
                      className="border-neutral-700 bg-neutral-800 text-white"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bulletin-author" className="text-neutral-200">
                      {t("Name", "Nombre")}
                    </Label>
                    <Input
                      id="bulletin-author"
                      value={newPost.authorName}
                      onChange={(event) => setNewPost((prev) => ({ ...prev, authorName: event.target.value }))}
                      placeholder={t("Optional", "Opcional")}
                      className="border-neutral-700 bg-neutral-800 text-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      createPostMutation.isPending ||
                      newPost.content.trim().length === 0 ||
                      newPost.title.trim().length === 0
                    }
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {t("Publish", "Publicar")}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <>
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {t("Prayer Requests", "Peticiones de Oración")}
                </h2>
                <p className="text-sm text-neutral-400">
                  {t(
                    "These requests were shared through the home page form—add a comment to encourage and pray.",
                    "Estas peticiones fueron enviadas desde el formulario de la página principal; agrega un comentario para animar y orar."
                  )}
                </p>
              </div>

              {isLoading && (
                <p className="text-sm text-neutral-400">
                  {t("Loading prayers...", "Cargando oraciones...")}
                </p>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                {prayers.map((prayer) => (
                  <Card key={prayer.id} className="border-neutral-800 bg-neutral-900/60">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
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
                            <span>{formatDate(prayer.createdAt)}</span>
                          </div>
                        </div>
                        <span className="rounded-full bg-red-600/20 px-3 py-1 text-xs font-medium text-red-400">
                          {t("Prayers", "Oraciones")}: {prayer.prayerCount}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="whitespace-pre-wrap text-sm text-neutral-300">{prayer.description}</p>
                      
                      <Button
                        type="button"
                        onClick={() => handlePray(prayer.id)}
                        disabled={prayedPrayerIds.has(prayer.id) || activePrayerId === prayer.id}
                        className={cn(
                          "w-full",
                          prayedPrayerIds.has(prayer.id)
                            ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-800"
                            : "bg-red-600 hover:bg-red-700"
                        )}
                      >
                        {prayedPrayerIds.has(prayer.id)
                          ? t("Prayed", "Orado")
                          : activePrayerId === prayer.id
                          ? t("Recording...", "Registrando...")
                          : t("I prayed", "Oré")}
                      </Button>

                      <div className="h-px bg-neutral-800" />

                      <div className="space-y-3">
                        {prayer.comments.length > 0 ? (
                          prayer.comments.map((comment) => (
                            <div key={comment.id} className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3 text-sm">
                              <div className="mb-1 flex items-center justify-between text-xs text-neutral-400">
                                <span>{comment.authorName}</span>
                                <span>{formatDate(comment.createdAt)}</span>
                              </div>
                              <p className="text-neutral-200">{comment.content}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-neutral-500">
                            {t("No comments yet. Share a word of encouragement.", "Sin comentarios aún. Comparte una palabra de aliento.")}
                          </p>
                        )}
                      </div>

                      <div className="h-px bg-neutral-800" />

                      <form className="space-y-3" onSubmit={(event) => handleSubmitComment(event, prayer.id, "prayer")}>
                        <div className="grid gap-2">
                          <Label className="text-neutral-300" htmlFor={`prayer-comment-name-${prayer.id}`}>
                            {t("Name", "Nombre")}
                          </Label>
                          <Input
                            id={`prayer-comment-name-${prayer.id}`}
                            value={commentForms[`prayer-${prayer.id}`]?.authorName || ""}
                            onChange={(event) => handleCommentChange(`prayer-${prayer.id}`, "authorName", event.target.value)}
                            placeholder={t("Optional", "Opcional")}
                            className="border-neutral-700 bg-neutral-800 text-white"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-neutral-300" htmlFor={`prayer-comment-content-${prayer.id}`}>
                            {t("Comment", "Comentario")}
                          </Label>
                          <Textarea
                            id={`prayer-comment-content-${prayer.id}`}
                            value={commentForms[`prayer-${prayer.id}`]?.content || ""}
                            onChange={(event) => handleCommentChange(`prayer-${prayer.id}`, "content", event.target.value)}
                            required
                            className="border-neutral-700 bg-neutral-800 text-white"
                            rows={2}
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={commentMutation.isPending || (commentForms[`prayer-${prayer.id}`]?.content || "").trim().length === 0}
                          className="w-full bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                        >
                          {t("Add Comment", "Agregar Comentario")}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <Dialog open={prayerDialogOpen} onOpenChange={setPrayerDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-red-600 text-white shadow-xl transition-transform hover:scale-105 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-300 md:bottom-12 md:right-12"
                  aria-label={t("Share a new prayer request", "Compartir una nueva petición de oración")}
                >
                  <Plus className="h-6 w-6" />
                  <span className="sr-only">
                    {t("Share a new prayer request", "Compartir una nueva petición de oración")}
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="border-neutral-800 bg-neutral-900">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {t("Share Prayer Request", "Compartir Petición de Oración")}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitPrayer} className="space-y-4">
                  <div>
                    <Label htmlFor="prayer-title" className="text-neutral-200">
                      {t("Title", "Título")}
                    </Label>
                    <Input
                      id="prayer-title"
                      value={newPrayer.title}
                      onChange={(event) => setNewPrayer((prev) => ({ ...prev, title: event.target.value }))}
                      required
                      className="border-neutral-700 bg-neutral-800 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prayer-description" className="text-neutral-200">
                      {t("Description", "Descripción")}
                    </Label>
                    <Textarea
                      id="prayer-description"
                      value={newPrayer.description}
                      onChange={(event) => setNewPrayer((prev) => ({ ...prev, description: event.target.value }))}
                      required
                      className="border-neutral-700 bg-neutral-800 text-white"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="prayer-author" className="text-neutral-200">
                      {t("Name", "Nombre")}
                    </Label>
                    <Input
                      id="prayer-author"
                      value={newPrayer.authorName}
                      onChange={(event) => setNewPrayer((prev) => ({ ...prev, authorName: event.target.value }))}
                      placeholder={t("Optional", "Opcional")}
                      className="border-neutral-700 bg-neutral-800 text-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      createPrayerMutation.isPending ||
                      newPrayer.title.trim().length === 0 ||
                      newPrayer.description.trim().length === 0
                    }
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {createPrayerMutation.isPending
                      ? t("Sharing...", "Compartiendo...")
                      : t("Share Request", "Compartir Petición")}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}
