"use client";

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
import { useLanguage } from "@/contexts/LanguageContext";
import { useBackend } from "@/hooks/useBackend";

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
    backend.listBulletinPosts(),
  ]);

  return {
    prayers: prayersResult.prayers.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      isAnonymous: p.isAnonymous,
      userName: p.userName,
      prayerCount: p.prayerCount,
      createdAt: p.createdAt,
      comments: p.comments || [],
    })),
    posts: postsResult.posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      authorName: p.authorName,
      createdAt: p.createdAt,
      comments: p.comments || [],
    })),
  };
};

interface CommentFormState {
  authorName: string;
  content: string;
}

type CommentKey = `post-${number}` | `prayer-${number}`;

type Tab = "community" | "prayers";

const emptyComment: CommentFormState = {
  authorName: "",
  content: "",
};

const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleString();
  } catch {
    return date;
  }
};

export function BulletinBoardPage() {
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

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bulletin-board"],
    queryFn: () => fetchBoard(backend),
    retry: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let storedUserId = window.localStorage.getItem(USER_ID_KEY);
    if (!storedUserId) {
      storedUserId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      window.localStorage.setItem(USER_ID_KEY, storedUserId);
    }
    setUserId(storedUserId);

    const storedName = window.localStorage.getItem(USER_NAME_KEY);
    if (storedName) {
      setNewPost((prev) => ({ ...prev, authorName: storedName }));
      setNewPrayer((prev) => ({ ...prev, authorName: storedName }));
    }

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
      } catch {
        // ignore
      }
    }
  }, []);

  const prayers = data?.prayers ?? [];
  const posts = data?.posts ?? [];

  const createPostMutation = useMutation({
    mutationFn: (payload: { title: string; content: string; authorName: string; authorId: string | null }) =>
      backend.createBulletinPost({
        title: payload.title,
        content: payload.content,
        authorName: payload.authorName,
        authorId: payload.authorId,
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
    onError: (e: Error) => {
      toast({ title: t("Error", "Error"), description: e.message, variant: "destructive" });
    },
  });

  const createPrayerMutation = useMutation({
    mutationFn: (payload: { title: string; description: string; authorName: string; userId: string | null }) =>
      backend.createPrayerRequest({
        title: payload.title,
        description: payload.description,
        isAnonymous: payload.authorName.trim().length === 0,
        authorName: payload.authorName.trim().length ? payload.authorName.trim() : null,
        userId: payload.userId,
      }),
    onSuccess: () => {
      const savedName = newPrayer.authorName.trim();
      if (savedName && typeof window !== "undefined") {
        window.localStorage.setItem(USER_NAME_KEY, savedName);
      }
      setNewPrayer({ title: "", description: "", authorName: savedName });
      queryClient.invalidateQueries({ queryKey: ["bulletin-board"] });
      setPrayerDialogOpen(false);
      toast({
        title: t("Prayer submitted", "Petición enviada"),
        description: t("Your request is now visible.", "Tu petición ya está visible."),
      });
    },
    onError: (e: Error) => {
      toast({ title: t("Error", "Error"), description: e.message, variant: "destructive" });
    },
  });

  const createCommentMutation = useMutation<unknown, Error, { key: CommentKey; content: string; authorName: string }>({
    mutationFn: async (payload) => {
      const [type, idStr] = payload.key.split("-");
      const id = Number(idStr);
      if (type === "post") {
        return await backend.createBulletinComment({
          postId: id,
          content: payload.content,
          authorName: payload.authorName,
          authorId: userId,
        });
      }

      return await backend.createPrayerComment({
        prayerId: id,
        content: payload.content,
        authorName: payload.authorName,
        authorId: participantId,
      });
    },
    onSuccess: (_data, vars) => {
      setCommentForms((prev) => ({ ...prev, [vars.key]: emptyComment }));
      queryClient.invalidateQueries({ queryKey: ["bulletin-board"] });
    },
    onError: (e: Error) => {
      toast({ title: t("Error", "Error"), description: e.message, variant: "destructive" });
    },
  });

  const prayMutation = useMutation({
    mutationFn: async (prayerId: number) => {
      await backend.incrementPrayerCount(prayerId);
      return prayerId;
    },
    onSuccess: (prayerId) => {
      const updated = new Set(prayedPrayerIds);
      updated.add(prayerId);
      setPrayedPrayerIds(updated);
      try {
        window.localStorage.setItem(PRAYED_PRAYERS_KEY, JSON.stringify(Array.from(updated)));
      } catch {
        // ignore
      }
      queryClient.invalidateQueries({ queryKey: ["bulletin-board"] });
    },
  });

  const handleCommentChange = (key: CommentKey, field: keyof CommentFormState, value: string) => {
    setCommentForms((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] ?? emptyComment),
        [field]: value,
      },
    }));
  };

  const getCommentForm = (key: CommentKey): CommentFormState => {
    return commentForms[key] ?? emptyComment;
  };

  const displayedPrayers = useMemo(() => {
    if (activeTab !== "prayers") return [];
    return prayers;
  }, [activeTab, prayers]);

  const displayedPosts = useMemo(() => {
    if (activeTab !== "community") return [];
    return posts;
  }, [activeTab, posts]);

  return (
    <div className="container mx-auto space-y-6 px-4 pt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
            {t("Community", "Comunidad")}
          </p>
          <h1 className="text-2xl font-bold text-white">{t("Bulletin Board", "Tablón")}</h1>
          <p className="mt-1 text-sm text-neutral-400">
            {t("Share updates and encouragement.", "Comparte actualizaciones y ánimo.")}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={activeTab === "community" ? "default" : "outline"}
            onClick={() => setActiveTab("community")}
          >
            {t("Posts", "Publicaciones")}
          </Button>
          <Button
            variant={activeTab === "prayers" ? "default" : "outline"}
            onClick={() => setActiveTab("prayers")}
          >
            {t("Prayers", "Oraciones")}
          </Button>
        </div>
      </div>

      {isError && (
        <p className="text-sm text-red-400">{t("Error loading posts.", "Error al cargar.")} {String((error as Error)?.message ?? error)}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4" />
              {t("New post", "Nueva publicación")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Create a post", "Crear publicación")}</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                createPostMutation.mutate({
                  title: newPost.title.trim(),
                  content: newPost.content.trim(),
                  authorName: newPost.authorName.trim() || t("Anonymous", "Anónimo"),
                  authorId: userId,
                });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="post-title">{t("Title", "Título")}</Label>
                <Input
                  id="post-title"
                  value={newPost.title}
                  onChange={(e) => setNewPost((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-content">{t("Content", "Contenido")}</Label>
                <Textarea
                  id="post-content"
                  value={newPost.content}
                  onChange={(e) => setNewPost((prev) => ({ ...prev, content: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-author">{t("Name", "Nombre")}</Label>
                <Input
                  id="post-author"
                  value={newPost.authorName}
                  onChange={(e) => setNewPost((prev) => ({ ...prev, authorName: e.target.value }))}
                />
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={createPostMutation.isPending}>
                {createPostMutation.isPending ? t("Posting...", "Publicando...") : t("Post", "Publicar")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={prayerDialogOpen} onOpenChange={setPrayerDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <User className="h-4 w-4" />
              {t("New prayer", "Nueva oración")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Submit a prayer", "Enviar oración")}</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                createPrayerMutation.mutate({
                  title: newPrayer.title.trim(),
                  description: newPrayer.description.trim(),
                  authorName: newPrayer.authorName.trim(),
                  userId: participantId,
                });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="prayer-title">{t("Title", "Título")}</Label>
                <Input
                  id="prayer-title"
                  value={newPrayer.title}
                  onChange={(e) => setNewPrayer((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prayer-desc">{t("Description", "Descripción")}</Label>
                <Textarea
                  id="prayer-desc"
                  value={newPrayer.description}
                  onChange={(e) => setNewPrayer((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prayer-author">{t("Name (optional)", "Nombre (opcional)")}</Label>
                <Input
                  id="prayer-author"
                  value={newPrayer.authorName}
                  onChange={(e) => setNewPrayer((prev) => ({ ...prev, authorName: e.target.value }))}
                />
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={createPrayerMutation.isPending}>
                {createPrayerMutation.isPending ? t("Submitting...", "Enviando...") : t("Submit", "Enviar")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {activeTab === "community" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="h-24 animate-pulse rounded-xl bg-neutral-900/40" />
          ) : displayedPosts.length === 0 ? (
            <p className="text-sm text-neutral-400">{t("No community posts yet.", "No hay publicaciones aún.")}</p>
          ) : (
            displayedPosts.map((post) => (
              <Card key={post.id} className="border-neutral-800 bg-neutral-900/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white">{post.title}</CardTitle>
                  <p className="text-xs text-neutral-400">{post.authorName} • {formatDate(post.createdAt)}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-neutral-200 whitespace-pre-wrap">{post.content}</p>
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{t("Comments", "Comentarios")}</p>
                    {post.comments.length === 0 ? (
                      <p className="text-sm text-neutral-400">{t("No comments yet.", "Sin comentarios aún.")}</p>
                    ) : (
                      <div className="space-y-2">
                        {post.comments.map((c) => (
                          <div key={c.id} className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
                            <p className="text-xs text-neutral-400">{c.authorName} • {formatDate(c.createdAt)}</p>
                            <p className="text-sm text-neutral-200 whitespace-pre-wrap">{c.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <form
                      className="space-y-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const key = `post-${post.id}` as const;
                        const form = getCommentForm(key);
                        const content = form.content.trim();
                        if (!content) return;
                        createCommentMutation.mutate({
                          key,
                          content,
                          authorName: form.authorName.trim() || t("Anonymous", "Anónimo"),
                        });
                      }}
                    >
                      <Input
                        value={getCommentForm(`post-${post.id}`).authorName}
                        onChange={(e) => handleCommentChange(`post-${post.id}`, "authorName", e.target.value)}
                        placeholder={t("Name (optional)", "Nombre (opcional)")}
                      />
                      <Textarea
                        value={getCommentForm(`post-${post.id}`).content}
                        onChange={(e) => handleCommentChange(`post-${post.id}`, "content", e.target.value)}
                        placeholder={t("Write a comment...", "Escribe un comentario...")}
                        rows={3}
                      />
                      <Button type="submit" variant="outline" className="w-full">
                        {t("Comment", "Comentar")}
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "prayers" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="h-24 animate-pulse rounded-xl bg-neutral-900/40" />
          ) : displayedPrayers.length === 0 ? (
            <p className="text-sm text-neutral-400">{t("No prayers yet.", "No hay oraciones aún.")}</p>
          ) : (
            displayedPrayers.map((prayer) => {
              const prayed = prayedPrayerIds.has(prayer.id);
              const key = `prayer-${prayer.id}` as const;
              return (
                <Card key={prayer.id} className="border-neutral-800 bg-neutral-900/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white">{prayer.title}</CardTitle>
                    <p className="text-xs text-neutral-400">
                      {(prayer.isAnonymous ? t("Anonymous", "Anónimo") : prayer.userName) || t("Anonymous", "Anónimo")} • {formatDate(prayer.createdAt)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-neutral-200 whitespace-pre-wrap">{prayer.description}</p>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        className={cn("flex-1", prayed ? "bg-neutral-800 text-neutral-300" : "bg-red-600 hover:bg-red-700")}
                        disabled={prayed || prayMutation.isPending}
                        onClick={() => {
                          setActivePrayerId(prayer.id);
                          prayMutation.mutate(prayer.id);
                        }}
                      >
                        {prayed ? t("Prayed", "Orado") : t("Pray", "Orar")} • {prayer.prayerCount}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{t("Comments", "Comentarios")}</p>
                      {prayer.comments.length === 0 ? (
                        <p className="text-sm text-neutral-400">{t("No comments yet.", "Sin comentarios aún.")}</p>
                      ) : (
                        <div className="space-y-2">
                          {prayer.comments.map((c) => (
                            <div key={c.id} className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
                              <p className="text-xs text-neutral-400">{c.authorName} • {formatDate(c.createdAt)}</p>
                              <p className="text-sm text-neutral-200 whitespace-pre-wrap">{c.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <form
                        className="space-y-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = getCommentForm(key);
                          const content = form.content.trim();
                          if (!content) return;
                          createCommentMutation.mutate({
                            key,
                            content,
                            authorName: form.authorName.trim() || t("Anonymous", "Anónimo"),
                          });
                        }}
                      >
                        <Input
                          value={getCommentForm(key).authorName}
                          onChange={(e) => handleCommentChange(key, "authorName", e.target.value)}
                          placeholder={t("Name (optional)", "Nombre (opcional)")}
                        />
                        <Textarea
                          value={getCommentForm(key).content}
                          onChange={(e) => handleCommentChange(key, "content", e.target.value)}
                          placeholder={t("Write a comment...", "Escribe un comentario...")}
                          rows={3}
                        />
                        <Button type="submit" variant="outline" className="w-full">
                          {t("Comment", "Comentar")}
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
