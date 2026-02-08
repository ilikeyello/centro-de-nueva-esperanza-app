import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, User, Heart, MessageCircle, Send, Mail, X } from "lucide-react";
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
const LIKED_POSTS_KEY = "cne-liked-post-ids";
const USER_NAME_KEY = "cne-user-name";
const USER_ID_KEY = "cne-user-id";

interface BulletinComment {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
}

interface PrayerItem {
  id: number;
  title: string;
  description: string;
  isAnonymous: boolean;
  userName: string | null;
  prayerCount: number;
  createdAt: string;
}

interface BulletinPost {
  id: number;
  title: string;
  content: string;
  authorName: string;
  likeCount: number;
  createdAt: string;
  comments: BulletinComment[];
}

interface BoardResponse {
  prayers: PrayerItem[];
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
    })),
    posts: postsResult.posts.map(p => ({
      id: p.id,
      title: p.title,
      content: p.content,
      authorName: p.authorName,
      likeCount: p.likeCount ?? 0,
      createdAt: p.createdAt,
      comments: p.comments || []
    }))
  };
};

interface CommentFormState {
  authorName: string;
  content: string;
}

type CommentKey = `post-${number}`;

const emptyComment: CommentFormState = {
  authorName: "",
  content: "",
};

const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return date;
  }
};

const getInitials = (name: string) => {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name[0] || "?").toUpperCase();
};

type Tab = "community" | "prayers";

export function BulletinBoard({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const backend = useBackend();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>("community");
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [prayerDialogOpen, setPrayerDialogOpen] = useState(false);
  const [commentDialogPostId, setCommentDialogPostId] = useState<number | null>(null);
  const [isCommenting, setIsCommenting] = useState(false);

  const [newPost, setNewPost] = useState({ title: "", content: "", authorName: "" });
  const [userId, setUserId] = useState<string | null>(null);
  const [newPrayer, setNewPrayer] = useState({ title: "", description: "", authorName: "" });

  const [commentForms, setCommentForms] = useState<Record<CommentKey, CommentFormState>>({});
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [prayedPrayerIds, setPrayedPrayerIds] = useState<Set<number>>(() => new Set());
  const [likedPostIds, setLikedPostIds] = useState<Set<number>>(() => new Set());
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
      setNewPost(prev => ({ ...prev, authorName: storedName }));
      setNewPrayer(prev => ({ ...prev, authorName: storedName }));
    }

    let storedId = window.localStorage.getItem(PRAYER_PARTICIPANT_ID_KEY);
    if (!storedId) {
      storedId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      window.localStorage.setItem(PRAYER_PARTICIPANT_ID_KEY, storedId);
    }
    setParticipantId(storedId);

    const storedPrayed = window.localStorage.getItem(PRAYED_PRAYERS_KEY);
    if (storedPrayed) {
      try { setPrayedPrayerIds(new Set(JSON.parse(storedPrayed) as number[])); } catch { /* ignore */ }
    }

    const storedLiked = window.localStorage.getItem(LIKED_POSTS_KEY);
    if (storedLiked) {
      try { setLikedPostIds(new Set(JSON.parse(storedLiked) as number[])); } catch { /* ignore */ }
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
    },
    onMutate: async (variables) => {
      setActivePrayerId(variables.prayerId);
      await queryClient.cancelQueries({ queryKey: ["bulletin-board"] });
      const previous = queryClient.getQueryData<BoardResponse>(["bulletin-board"]);
      if (previous) {
        queryClient.setQueryData<BoardResponse>(["bulletin-board"], {
          ...previous,
          prayers: previous.prayers.map(p => p.id === variables.prayerId ? { ...p, prayerCount: p.prayerCount + 1 } : p),
        });
      }
      setPrayedPrayerIds((prev) => {
        const updated = new Set(prev);
        updated.add(variables.prayerId);
        if (typeof window !== "undefined") window.localStorage.setItem(PRAYED_PRAYERS_KEY, JSON.stringify(Array.from(updated)));
        return updated;
      });
      return { previous };
    },
    onSuccess: () => {
      toast({ title: t("Thank you for praying", "Gracias por orar"), description: t("We've recorded your prayer.", "Hemos registrado tu oración.") });
      queryClient.invalidateQueries({ queryKey: ["bulletin-board"] });
    },
    onError: (err: Error, variables, context) => {
      if (context?.previous) queryClient.setQueryData(["bulletin-board"], context.previous);
      setPrayedPrayerIds((prev) => { const updated = new Set(prev); updated.delete(variables.prayerId); return updated; });
      toast({ title: t("Error", "Error"), description: err.message, variant: "destructive" });
    },
    onSettled: () => { setActivePrayerId(null); },
  });

  const likeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: number; isLiked: boolean }) => {
      if (isLiked) {
        await backend.decrementLikeCount(postId);
      } else {
        await backend.incrementLikeCount(postId);
      }
    },
    onMutate: async ({ postId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ["bulletin-board"] });
      const previous = queryClient.getQueryData<BoardResponse>(["bulletin-board"]);
      if (previous) {
        queryClient.setQueryData<BoardResponse>(["bulletin-board"], {
          ...previous,
          posts: previous.posts.map(p => p.id === postId ? { ...p, likeCount: (p.likeCount || 0) + (isLiked ? -1 : 1) } : p),
        });
      }
      setLikedPostIds((prev) => {
        const updated = new Set(prev);
        if (isLiked) {
          updated.delete(postId);
        } else {
          updated.add(postId);
        }
        if (typeof window !== "undefined") window.localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify(Array.from(updated)));
        return updated;
      });
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bulletin-board"] });
    },
    onError: (err: Error, { postId, isLiked }, context) => {
      if (context?.previous) queryClient.setQueryData(["bulletin-board"], context.previous);
      setLikedPostIds((prev) => { 
        const updated = new Set(prev);
        if (isLiked) {
          updated.add(postId);
        } else {
          updated.delete(postId);
        }
        return updated;
      });
      toast({ title: t("Error", "Error"), description: err.message, variant: "destructive" });
    },
  });

  const handlePray = (prayerId: number) => {
    if (prayedPrayerIds.has(prayerId)) return;
    const id = ensureParticipantId();
    prayMutation.mutate({ prayerId, participantId: id });
  };

  const handleLike = (postId: number) => {
    const isLiked = likedPostIds.has(postId);
    likeMutation.mutate({ postId, isLiked });
  };

  const createPostMutation = useMutation({
    mutationFn: (data: { title: string; content: string; authorName: string; authorId: string | null; organizationId: string }) =>
      backend.createBulletinPost({ title: data.title, content: data.content, authorName: data.authorName, authorId: data.authorId }),
    onSuccess: () => {
      const savedName = newPost.authorName.trim();
      if (savedName && typeof window !== "undefined") window.localStorage.setItem(USER_NAME_KEY, savedName);
      setNewPost({ title: "", content: "", authorName: savedName });
      queryClient.invalidateQueries({ queryKey: ["bulletin-board"] });
      setPostDialogOpen(false);
      toast({ title: t("Post created", "Publicación creada"), description: t("Your bulletin post is now live.", "Tu publicación ya está visible.") });
    },
    onError: (err: Error) => { toast({ title: t("Error", "Error"), description: err.message, variant: "destructive" }); },
  });

  const createPrayerMutation = useMutation({
    mutationFn: (data: { title: string; description: string; isAnonymous: boolean; authorName?: string | null; userId: string | null; organizationId: string }) =>
      backend.createPrayerRequest({ title: data.title, description: data.description, isAnonymous: data.isAnonymous, authorName: data.authorName, userId: data.userId }),
    onSuccess: () => {
      const savedName = newPrayer.authorName.trim();
      if (savedName && typeof window !== "undefined") window.localStorage.setItem(USER_NAME_KEY, savedName);
      setNewPrayer({ title: "", description: "", authorName: savedName });
      setPrayerDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["bulletin-board"] });
      toast({ title: t("Prayer shared", "Petición compartida"), description: t("We're praying with you.", "Estamos orando contigo.") });
    },
    onError: (err: Error) => { toast({ title: t("Error", "Error"), description: err.message, variant: "destructive" }); },
  });

  const commentMutation = useMutation({
    mutationFn: async (data: { targetId: number; authorName: string; authorId: string | null; content: string }) => {
      return backend.createBulletinComment({ postId: data.targetId, content: data.content, authorName: data.authorName, authorId: data.authorId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bulletin-board"] });
      toast({ title: t("Comment added", "Comentario añadido"), description: t("Thank you for contributing.", "Gracias por contribuir.") });
    },
    onError: (err: Error) => { toast({ title: t("Error", "Error"), description: err.message, variant: "destructive" }); },
  });

  const prayers = useMemo(() => data?.prayers ?? [], [data]);
  const posts = useMemo(() => data?.posts ?? [], [data]);
  const commentDialogPost = useMemo(() => posts.find(p => p.id === commentDialogPostId) ?? null, [posts, commentDialogPostId]);

  const handleSubmitPost = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const orgId = import.meta.env.VITE_CHURCH_ORG_ID;
    if (!orgId) { toast({ title: t("Error", "Error"), description: "Organization ID not configured", variant: "destructive" }); return; }
    createPostMutation.mutate({ title: newPost.title.trim(), content: newPost.content.trim(), authorName: newPost.authorName.trim() || t("Anonymous", "Anónimo"), authorId: userId, organizationId: orgId });
  };

  const handleSubmitPrayer = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const orgId = import.meta.env.VITE_CHURCH_ORG_ID;
    if (!orgId) { toast({ title: t("Error", "Error"), description: "Organization ID not configured", variant: "destructive" }); return; }
    const trimmedName = newPrayer.authorName.trim();
    createPrayerMutation.mutate({ title: newPrayer.title.trim(), description: newPrayer.description.trim(), isAnonymous: trimmedName.length === 0, authorName: trimmedName.length > 0 ? trimmedName : null, userId: userId, organizationId: orgId });
  };

  const handleCommentChange = (key: CommentKey, field: keyof CommentFormState, value: string) => {
    setCommentForms((prev) => ({ ...prev, [key]: { ...(prev[key] ?? emptyComment), [field]: value } }));
  };

  const handleSubmitComment = (event: React.FormEvent<HTMLFormElement>, targetId: number) => {
    event.preventDefault();
    const key: CommentKey = `post-${targetId}`;
    const form = commentForms[key] ?? emptyComment;
    commentMutation.mutate(
      { targetId, authorName: form.authorName.trim() || t("Anonymous", "Anónimo"), authorId: userId, content: form.content.trim() },
      { onSuccess: () => { setCommentForms((prev) => ({ ...prev, [key]: emptyComment })); } }
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
              {t("Share updates, testimonies, and prayer needs with our bilingual church family.", "Comparte actualizaciones, testimonios y peticiones de oración con nuestra familia bilingüe.")}
            </p>
          </div>
          <div className="flex w-full items-center gap-2 overflow-hidden rounded-lg border-2 border-neutral-300 bg-neutral-50 p-1 md:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("community")}
              style={activeTab === "community" ? { backgroundColor: "#C73E1D", color: "white", borderBottomColor: "#C73E1D" } : {}}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-all text-center md:flex-none border-b-4",
                activeTab === "community" ? "shadow-md" : "text-neutral-600 hover:text-[#C73E1D] hover:bg-white border-b-transparent"
              )}
            >
              {t("Community", "Comunidad")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("prayers")}
              style={activeTab === "prayers" ? { backgroundColor: "#C73E1D", color: "white", borderBottomColor: "#C73E1D" } : {}}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-all text-center md:flex-none border-b-4",
                activeTab === "prayers" ? "shadow-md" : "text-neutral-600 hover:text-[#C73E1D] hover:bg-white border-b-transparent"
              )}
            >
              {t("Prayer Requests", "Peticiones de Oración")}
            </button>
          </div>
        </div>

        {activeTab === "community" ? (
          <>
            <section className="space-y-4">
              {isLoading && <p className="text-sm text-neutral-400">{t("Loading posts...", "Cargando publicaciones...")}</p>}
              {isError && <p className="text-sm text-red-400">{t("Error loading posts.", "Error al cargar publicaciones.")} {String((error as Error)?.message ?? error)}</p>}

              <div className="space-y-4">
                {posts.map((post) => {
                  const liked = likedPostIds.has(post.id);
                  return (
                    <article key={post.id} className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70">
                      <div className="flex items-center gap-3 px-5 pt-5 pb-2">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-sm font-bold text-red-400">
                          {getInitials(post.authorName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">{post.authorName}</p>
                          <p className="text-xs text-neutral-500">{formatDate(post.createdAt)}</p>
                        </div>
                      </div>

                      <div className="px-5 pt-2 pb-3">
                        <h3 className="mb-1 text-base font-bold text-white">{post.title}</h3>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">{post.content}</p>
                      </div>

                      <div className="flex items-center gap-4 border-t border-neutral-800 px-5 py-3">
                        <button
                          type="button"
                          onClick={() => handleLike(post.id)}
                          className={cn(
                            "flex items-center gap-1.5 text-sm transition-colors",
                            liked ? "text-red-500" : "text-red-400/60 active:text-red-500"
                          )}
                        >
                          <Heart 
                            className={cn("h-5 w-5", liked && "fill-red-500")} 
                            style={liked ? { fill: '#C73E1D' } : {}}
                          />
                          <span>{post.likeCount || 0}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCommentDialogPostId(post.id);
                            setIsCommenting(false);
                          }}
                          className="flex items-center gap-1.5 text-sm text-neutral-400 transition-colors active:text-white"
                        >
                          <MessageCircle className="h-5 w-5" />
                          <span>{post.comments.length}</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {!isLoading && !isError && posts.length === 0 && (
                <p className="text-center text-sm text-neutral-500 py-12">
                  {t("No community posts yet. Start the conversation!", "No hay publicaciones aún. ¡Comienza la conversación!")}
                </p>
              )}
            </section>

            <Dialog open={commentDialogPostId !== null} onOpenChange={(open) => { if (!open) setCommentDialogPostId(null); }}>
              <DialogContent className="flex max-h-[85vh] flex-col border-neutral-700 bg-neutral-900 text-white sm:max-w-lg">
                {commentDialogPost && (
                  <>
                    <DialogHeader className="shrink-0 border-b border-neutral-800 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <DialogTitle className="text-white">{commentDialogPost.title}</DialogTitle>
                          <div className="flex items-center gap-2 pt-1 text-xs text-neutral-400">
                            <span>{commentDialogPost.authorName}</span>
                            <span>•</span>
                            <span>{formatDate(commentDialogPost.createdAt)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCommentDialogPostId(null)}
                          className="rounded-full p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </DialogHeader>

                    <div className="flex-1 space-y-4 overflow-y-auto py-4">
                      <p className="whitespace-pre-wrap text-sm text-neutral-300">{commentDialogPost.content}</p>

                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleLike(commentDialogPost.id)}
                          className={cn(
                            "flex items-center gap-1.5 text-sm transition-colors",
                            likedPostIds.has(commentDialogPost.id) ? "text-red-500" : "text-red-400/60 active:text-red-500"
                          )}
                        >
                          <Heart 
                          className={cn("h-5 w-5", likedPostIds.has(commentDialogPost.id) && "fill-red-500")} 
                          style={likedPostIds.has(commentDialogPost.id) ? { fill: '#C73E1D' } : {}}
                        />
                          <span>{commentDialogPost.likeCount || 0}</span>
                        </button>
                        <div className="h-px bg-neutral-800 flex-1" />
                      </div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        {t("Comments", "Comentarios")} ({commentDialogPost.comments.length})
                      </p>

                      {commentDialogPost.comments.length === 0 && (
                        <p className="text-sm text-neutral-500">
                          {t("No comments yet. Be the first to respond.", "Sin comentarios aún. Sé el primero en responder.")}
                        </p>
                      )}

                      {commentDialogPost.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warm-red text-xs font-bold text-white">
                            {getInitials(comment.authorName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="rounded-xl border border-neutral-300 bg-white px-3 py-2">
                              <p className="text-xs font-semibold text-black">{comment.authorName}</p>
                              <p className="text-sm text-black">{comment.content}</p>
                            </div>
                            <p className="mt-0.5 pl-3 text-[0.65rem] text-neutral-500">{formatDate(comment.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form
                      className="shrink-0 flex items-end gap-2 border-t border-neutral-800 pt-3"
                      onSubmit={(event) => handleSubmitComment(event, commentDialogPost.id)}
                    >
                      <div className="flex-1 space-y-2">
                        <Input
                          value={commentForms[`post-${commentDialogPost.id}`]?.authorName || ""}
                          onChange={(e) => handleCommentChange(`post-${commentDialogPost.id}`, "authorName", e.target.value)}
                          onClick={() => setIsCommenting(true)}
                          onFocus={() => setIsCommenting(true)}
                          placeholder={t("Your name (optional)", "Tu nombre (opcional)")}
                          className={cn(
                            "border-neutral-700 text-sm placeholder:text-neutral-500",
                            isCommenting ? "bg-white text-black" : "bg-neutral-100 text-black"
                          )}
                          readOnly={!isCommenting}
                        />
                        <Textarea
                          value={commentForms[`post-${commentDialogPost.id}`]?.content || ""}
                          onChange={(e) => handleCommentChange(`post-${commentDialogPost.id}`, "content", e.target.value)}
                          onClick={() => setIsCommenting(true)}
                          onFocus={() => setIsCommenting(true)}
                          placeholder={t("Write a comment...", "Escribe un comentario...")}
                          required
                          rows={2}
                          className={cn(
                            "border-neutral-700 text-sm placeholder:text-neutral-500",
                            isCommenting ? "bg-white text-black" : "bg-neutral-100 text-black"
                          )}
                          readOnly={!isCommenting}
                        />
                      </div>
                      <Button
                        type="submit"
                        size="icon"
                        disabled={commentMutation.isPending || !(commentForms[`post-${commentDialogPost.id}`]?.content || "").trim()}
                        className="mb-0.5 h-10 w-10 shrink-0 rounded-full bg-red-600 hover:bg-red-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-red-600 text-white shadow-xl transition-transform hover:scale-105 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-300 md:bottom-12 md:right-12"
                  aria-label={t("Create a new community post", "Crear una nueva publicación comunitaria")}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="warm-card">
                <DialogHeader>
                  <DialogTitle className="serif-heading text-neutral-900">
                    {t("Create Post", "Crear Publicación")}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitPost} className="space-y-4">
                  <div>
                    <Label htmlFor="bulletin-title" className="text-neutral-700">{t("Title", "Título")}</Label>
                    <Input id="bulletin-title" value={newPost.title} onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))} required className="border-neutral-300 bg-white text-neutral-900" />
                  </div>
                  <div>
                    <Label htmlFor="bulletin-content" className="text-neutral-700">{t("Description", "Descripción")}</Label>
                    <Textarea id="bulletin-content" value={newPost.content} onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))} required className="border-neutral-300 bg-white text-neutral-900" rows={4} />
                  </div>
                  <div>
                    <Label htmlFor="bulletin-author" className="text-neutral-700">{t("Name", "Nombre")}</Label>
                    <Input id="bulletin-author" value={newPost.authorName} onChange={(e) => setNewPost(prev => ({ ...prev, authorName: e.target.value }))} placeholder={t("Optional", "Opcional")} className="border-neutral-300 bg-white text-neutral-900" />
                  </div>
                  <Button type="submit" disabled={createPostMutation.isPending || newPost.content.trim().length === 0 || newPost.title.trim().length === 0} className="warm-button-primary w-full">
                    {t("Publish", "Publicar")}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <>
            <section className="space-y-6">
              <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {t("Need to share something more personal?", "¿Necesitas compartir algo más personal?")}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      {t(
                        "If your prayer request is private, you can reach out to us directly. Your message will be kept confidential.",
                        "Si tu petición de oración es privada, puedes comunicarte con nosotros directamente. Tu mensaje será confidencial."
                      )}
                    </p>
                    <Button
                      type="button"
                      onClick={() => onNavigate?.("contact")}
                      className="mt-3 bg-red-600 hover:bg-red-700 text-sm"
                      size="sm"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {t("Contact Us Privately", "Contáctanos en Privado")}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {t("Prayer Requests", "Peticiones de Oración")}
                </h2>
                <p className="text-sm text-neutral-400">
                  {t("Lift each other up in prayer and stand together in faith.", "Elévense mutuamente en oración y permanezcan juntos en fe.")}
                </p>
              </div>

              {isLoading && <p className="text-sm text-neutral-400">{t("Loading prayers...", "Cargando oraciones...")}</p>}

              <div className="grid gap-4 md:grid-cols-2">
                {prayers.map((prayer) => {
                  const prayed = prayedPrayerIds.has(prayer.id);
                  return (
                    <article key={prayer.id} className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70">
                      <div className="flex items-center gap-3 px-5 pt-5 pb-2">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-sm font-bold text-red-400">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">
                            {prayer.isAnonymous ? t("Anonymous", "Anónimo") : prayer.userName || t("Guest", "Invitado")}
                          </p>
                          <p className="text-xs text-neutral-500">{formatDate(prayer.createdAt)}</p>
                        </div>
                        <span className="rounded-full bg-red-600/20 px-3 py-1 text-xs font-medium text-red-400">
                          🙏 {prayer.prayerCount}
                        </span>
                      </div>

                      <div className="px-5 pt-2 pb-3">
                        <h3 className="mb-1 text-base font-bold text-white">{prayer.title}</h3>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">{prayer.description}</p>
                      </div>

                      <div className="border-t border-neutral-800 px-5 py-3">
                        <Button
                          type="button"
                          onClick={() => handlePray(prayer.id)}
                          disabled={prayed || activePrayerId === prayer.id}
                          className={cn(
                            "w-full",
                            prayed ? "bg-neutral-800 text-neutral-400" : "bg-red-600 hover:bg-red-700"
                          )}
                        >
                          {prayed
                            ? `✓ ${t("Prayed", "Orado")}`
                            : activePrayerId === prayer.id
                            ? t("Recording...", "Registrando...")
                            : `🙏 ${t("I Prayed", "Oré")}`}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {!isLoading && prayers.length === 0 && (
                <p className="text-center text-sm text-neutral-500 py-12">
                  {t("No prayer requests yet. Share one below.", "No hay peticiones de oración aún. Comparte una abajo.")}
                </p>
              )}
            </section>

            <Dialog open={prayerDialogOpen} onOpenChange={setPrayerDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-red-600 text-white shadow-xl transition-transform hover:scale-105 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-300 md:bottom-12 md:right-12"
                  aria-label={t("Share a new prayer request", "Compartir una nueva petición de oración")}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="warm-card">
                <DialogHeader>
                  <DialogTitle className="serif-heading text-neutral-900">
                    {t("Share Prayer Request", "Compartir Petición de Oración")}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitPrayer} className="space-y-4">
                  <div>
                    <Label htmlFor="prayer-title" className="text-neutral-700">{t("Title", "Título")}</Label>
                    <Input id="prayer-title" value={newPrayer.title} onChange={(e) => setNewPrayer(prev => ({ ...prev, title: e.target.value }))} required className="border-neutral-300 bg-white text-neutral-900" />
                  </div>
                  <div>
                    <Label htmlFor="prayer-description" className="text-neutral-700">{t("Description", "Descripción")}</Label>
                    <Textarea id="prayer-description" value={newPrayer.description} onChange={(e) => setNewPrayer(prev => ({ ...prev, description: e.target.value }))} required className="border-neutral-300 bg-white text-neutral-900" rows={4} />
                  </div>
                  <div>
                    <Label htmlFor="prayer-author" className="text-neutral-700">{t("Name", "Nombre")}</Label>
                    <Input id="prayer-author" value={newPrayer.authorName} onChange={(e) => setNewPrayer(prev => ({ ...prev, authorName: e.target.value }))} placeholder={t("Optional — leave blank for anonymous", "Opcional — dejar vacío para anónimo")} className="border-neutral-300 bg-white text-neutral-900" />
                  </div>
                  <Button type="submit" disabled={createPrayerMutation.isPending || newPrayer.title.trim().length === 0 || newPrayer.description.trim().length === 0} className="warm-button-primary w-full">
                    {createPrayerMutation.isPending ? t("Sharing...", "Compartiendo...") : t("Share Request", "Compartir Petición")}
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
