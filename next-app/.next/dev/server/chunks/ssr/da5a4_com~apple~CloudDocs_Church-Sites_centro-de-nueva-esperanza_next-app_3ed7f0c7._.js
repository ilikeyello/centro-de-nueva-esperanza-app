module.exports = [
"[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/lib/churchApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "churchApi",
    ()=>churchApi,
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$supabase$2b$supabase$2d$js$40$2$2e$93$2e$3$2b$4789783d1fa00420$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/@supabase+supabase-js@2.93.3+4789783d1fa00420/node_modules/@supabase/supabase-js/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$mainSiteData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/lib/mainSiteData.ts [app-ssr] (ecmascript)");
;
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://wreovuejotnudkpaaffz.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZW92dWVqb3RudWRrcGFhZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4ODcwMzMsImV4cCI6MjA4NDQ2MzAzM30.tQRk6TrUpPFTlWTDq5q_7PVkDlSWvu7mAG3rk5fRHhQ");
const churchOrgIdEnv = ("TURBOPACK compile-time value", "org_38agxTQYvbrRSYd2jdxcfL5DGXf");
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const churchOrgId = churchOrgIdEnv;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$supabase$2b$supabase$2d$js$40$2$2e$93$2e$3$2b$4789783d1fa00420$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
class ChurchApiService {
    client = supabase;
    orgId = churchOrgId;
    async listSermons() {
        return this.sermons.list();
    }
    sermons = {
        list: async ()=>{
            let localSermons = [];
            try {
                const { data, error } = await this.client.from("sermons").select("*").eq("organization_id", this.orgId).order("created_at", {
                    ascending: false
                }).limit(10);
                if (error) throw error;
                localSermons = (data ?? []).map((s)=>({
                        id: s.id,
                        title: s.title,
                        youtubeUrl: s.youtube_url,
                        createdAt: s.created_at
                    }));
            } catch  {
                localSermons = [];
            }
            return {
                sermons: localSermons
            };
        }
    };
    async listEvents(params) {
        return this.events.list(params);
    }
    events = {
        list: async (params)=>{
            let query = this.client.from("events").select("*, event_rsvps(count)").eq("organization_id", this.orgId);
            if (params.upcoming) {
                query = query.gte("event_date", new Date().toISOString());
            }
            const { data, error } = await query.order("event_date", {
                ascending: false
            });
            if (error) throw error;
            const events = (data ?? []).map((e)=>({
                    id: e.id,
                    organization_id: e.organization_id,
                    titleEn: e.title_en,
                    titleEs: e.title_es,
                    descriptionEn: e.description_en,
                    descriptionEs: e.description_es,
                    eventDate: e.event_date,
                    location: e.location,
                    maxAttendees: e.max_attendees,
                    createdAt: e.created_at,
                    createdBy: e.created_by,
                    rsvpCount: e.event_rsvps?.[0]?.count || 0
                }));
            return {
                events
            };
        }
    };
    async listAnnouncements(params) {
        return this.announcements.list(params);
    }
    announcements = {
        list: async (params)=>{
            const { data, error } = await this.client.from("announcements").select("*").eq("organization_id", this.orgId).order("priority", {
                ascending: true
            }).order("created_at", {
                ascending: false
            }).limit(params.limit || 50);
            if (error) throw error;
            const announcements = (data ?? []).map((a)=>({
                    id: a.id,
                    organization_id: a.organization_id,
                    titleEn: a.title_en ?? a.titleEn ?? a.title ?? "",
                    titleEs: a.title_es ?? a.titleEs ?? a.title ?? "",
                    contentEn: a.content_en ?? a.contentEn ?? a.content ?? "",
                    contentEs: a.content_es ?? a.contentEs ?? a.content ?? "",
                    priority: a.priority ?? "normal",
                    createdAt: a.created_at ?? a.createdAt ?? new Date().toISOString(),
                    createdBy: a.created_by ?? a.createdBy ?? "",
                    imageUrl: a.image_url ?? a.imageUrl ?? null
                }));
            return {
                announcements
            };
        }
    };
    async listPrayerRequests() {
        return this.prayers.list();
    }
    async createPrayerRequest(prayer) {
        return this.prayers.create(prayer);
    }
    async createPrayerComment(comment) {
        return this.prayers.comment(comment);
    }
    async incrementPrayerCount(prayerId) {
        return this.prayers.increment(prayerId);
    }
    prayers = {
        list: async ()=>{
            const { data, error } = await this.client.from("prayer_requests").select("*, prayer_comments(*)").eq("organization_id", this.orgId).order("created_at", {
                ascending: false
            });
            if (error) throw error;
            const prayers = (data ?? []).map((p)=>({
                    id: p.id,
                    organization_id: p.organization_id,
                    title: p.title,
                    description: p.description,
                    isAnonymous: p.is_anonymous,
                    userId: p.user_id,
                    userName: p.user_name,
                    prayerCount: p.prayer_count,
                    createdAt: p.created_at,
                    comments: (p.prayer_comments || []).map((c)=>({
                            id: c.id,
                            prayerRequestId: c.prayer_request_id,
                            organization_id: c.organization_id,
                            authorName: c.author_name,
                            authorId: c.author_id,
                            content: c.content,
                            createdAt: c.created_at
                        })).sort((a, b)=>new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                }));
            return {
                prayers
            };
        },
        create: async (prayer)=>{
            const { data, error } = await this.client.from("prayer_requests").insert({
                organization_id: this.orgId,
                title: prayer.title,
                description: prayer.description,
                is_anonymous: prayer.isAnonymous,
                user_name: prayer.authorName,
                user_id: prayer.userId
            }).select().single();
            if (error) throw error;
            return {
                id: data.id,
                organization_id: data.organization_id,
                title: data.title,
                description: data.description,
                isAnonymous: data.is_anonymous,
                userId: data.user_id,
                userName: data.user_name,
                prayerCount: data.prayer_count,
                createdAt: data.created_at,
                comments: []
            };
        },
        increment: async (prayerId)=>{
            const { data: current, error: fetchError } = await this.client.from("prayer_requests").select("prayer_count").eq("id", prayerId).single();
            if (fetchError) throw fetchError;
            const { error: updateError } = await this.client.from("prayer_requests").update({
                prayer_count: (current?.prayer_count || 0) + 1
            }).eq("id", prayerId);
            if (updateError) throw updateError;
        },
        comment: async (comment)=>{
            const { data, error } = await this.client.from("prayer_comments").insert({
                organization_id: this.orgId,
                prayer_request_id: comment.prayerId,
                content: comment.content,
                author_name: comment.authorName,
                author_id: comment.authorId
            }).select().single();
            if (error) throw error;
            return {
                id: data.id,
                prayerRequestId: data.prayer_request_id,
                organization_id: data.organization_id,
                authorName: data.author_name,
                authorId: data.author_id,
                content: data.content,
                createdAt: data.created_at
            };
        }
    };
    async listBulletinPosts() {
        return this.bulletin.list();
    }
    async createBulletinPost(post) {
        return this.bulletin.create(post);
    }
    async createBulletinComment(comment) {
        return this.bulletin.comment(comment);
    }
    bulletin = {
        list: async ()=>{
            const { data: postsData, error: postsError } = await this.client.from("bulletin_posts").select("id, organization_id, title, content, author_name, created_at").eq("organization_id", this.orgId).order("created_at", {
                ascending: false
            });
            if (postsError) throw postsError;
            const postIds = (postsData ?? []).map((p)=>p.id).filter((id)=>typeof id === "number");
            const { data: commentsData, error: commentsError } = postIds.length ? await this.client.from("bulletin_comments").select("id, bulletin_post_id, organization_id, author_name, author_id, content, created_at").eq("organization_id", this.orgId).in("bulletin_post_id", postIds).order("created_at", {
                ascending: true
            }) : {
                data: [],
                error: null
            };
            if (commentsError) throw commentsError;
            const commentsByPostId = new Map();
            (commentsData ?? []).forEach((c)=>{
                const mapped = {
                    id: c.id,
                    bulletinPostId: c.bulletin_post_id,
                    organization_id: c.organization_id,
                    authorName: c.author_name,
                    authorId: c.author_id,
                    content: c.content,
                    createdAt: c.created_at
                };
                const existing = commentsByPostId.get(mapped.bulletinPostId) ?? [];
                existing.push(mapped);
                commentsByPostId.set(mapped.bulletinPostId, existing);
            });
            const posts = (postsData ?? []).map((p)=>({
                    id: p.id,
                    organization_id: p.organization_id,
                    title: p.title,
                    content: p.content,
                    authorName: p.author_name,
                    createdAt: p.created_at,
                    comments: commentsByPostId.get(p.id) ?? []
                }));
            return {
                posts
            };
        },
        create: async (post)=>{
            const { data, error } = await this.client.from("bulletin_posts").insert({
                organization_id: this.orgId,
                title: post.title,
                content: post.content,
                author_name: post.authorName,
                author_id: post.authorId
            }).select().single();
            if (error) throw error;
            return {
                id: data.id,
                organization_id: data.organization_id,
                title: data.title,
                content: data.content,
                authorName: data.author_name,
                createdAt: data.created_at,
                comments: []
            };
        },
        comment: async (comment)=>{
            const { data, error } = await this.client.from("bulletin_comments").insert({
                organization_id: this.orgId,
                bulletin_post_id: comment.postId,
                content: comment.content,
                author_name: comment.authorName,
                author_id: comment.authorId
            }).select().single();
            if (error) throw error;
            return {
                id: data.id,
                bulletinPostId: data.bulletin_post_id,
                organization_id: data.organization_id,
                authorName: data.author_name,
                authorId: data.author_id,
                content: data.content,
                createdAt: data.created_at
            };
        }
    };
    async getChurchInfo() {
        const { data, error } = await this.client.from("church_info").select("*").eq("organization_id", this.orgId).single();
        if (error && error.code !== "PGRST116") throw error;
        if (!data) return null;
        return {
            id: data.id,
            organization_id: data.organization_id,
            nameEn: data.name_en,
            nameEs: data.name_es,
            address: data.address,
            phone: data.phone,
            email: data.email,
            serviceTimesEn: data.service_times_en,
            serviceTimesEs: data.service_times_es,
            descriptionEn: data.description_en,
            descriptionEs: data.description_es,
            facebookPageUrl: data.facebook_page_url,
            latitude: data.latitude,
            longitude: data.longitude
        };
    }
    async getLivestream() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$mainSiteData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getLivestreamFromMainSite"])();
    }
}
const churchApi = new ChurchApiService();
}),
"[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/hooks/useBackend.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useBackend",
    ()=>useBackend
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$churchApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/lib/churchApi.ts [app-ssr] (ecmascript)");
"use client";
;
function useBackend() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$churchApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["churchApi"];
}
}),
"[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/next@16.1.4+67f6792bdf102c28/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$slot$40$1$2e$2$2e$4$2b$ef1de26e737d6025$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/@radix-ui+react-slot@1.2.4+ef1de26e737d6025/node_modules/@radix-ui/react-slot/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$class$2d$variance$2d$authority$40$0$2e$7$2e$1$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/class-variance-authority@0.7.1/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$class$2d$variance$2d$authority$40$0$2e$7$2e$1$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
            outline: "border bg-background/80 shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-background/40 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-9 px-4 py-2 has-[>svg]:px-3",
            sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
            lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
            icon: "size-9",
            "icon-sm": "size-8",
            "icon-lg": "size-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
function Button({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$slot$40$1$2e$2$2e$4$2b$ef1de26e737d6025$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/button.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/card.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardAction",
    ()=>CardAction,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/next@16.1.4+67f6792bdf102c28/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/lib/utils.ts [app-ssr] (ecmascript)");
;
;
function Card({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/card.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
function CardHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/card.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
function CardTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("leading-none font-semibold", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/card.tsx",
        lineNumber: 29,
        columnNumber: 10
    }, this);
}
function CardDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground text-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/card.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
function CardAction({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-action",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/card.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
function CardContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("px-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/card.tsx",
        lineNumber: 53,
        columnNumber: 10
    }, this);
}
function CardFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center px-6 [.border-t]:pt-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/card.tsx",
        lineNumber: 57,
        columnNumber: 10
    }, this);
}
;
}),
"[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/dialog.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Dialog",
    ()=>Dialog,
    "DialogClose",
    ()=>DialogClose,
    "DialogContent",
    ()=>DialogContent,
    "DialogDescription",
    ()=>DialogDescription,
    "DialogFooter",
    ()=>DialogFooter,
    "DialogHeader",
    ()=>DialogHeader,
    "DialogOverlay",
    ()=>DialogOverlay,
    "DialogPortal",
    ()=>DialogPortal,
    "DialogTitle",
    ()=>DialogTitle,
    "DialogTrigger",
    ()=>DialogTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/next@16.1.4+67f6792bdf102c28/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/@radix-ui+react-dialog@1.1.15+55cb9442da38fd66/node_modules/@radix-ui/react-dialog/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XIcon$3e$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/lucide-react@0.562.0+83d5fd7b249dbeef/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as XIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
;
function Dialog({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "dialog",
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/dialog.tsx",
        lineNumber: 8,
        columnNumber: 10
    }, this);
}
function DialogTrigger({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-slot": "dialog-trigger",
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/dialog.tsx",
        lineNumber: 12,
        columnNumber: 10
    }, this);
}
function DialogPortal({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Portal"], {
        "data-slot": "dialog-portal",
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/dialog.tsx",
        lineNumber: 16,
        columnNumber: 10
    }, this);
}
function DialogClose({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Close"], {
        "data-slot": "dialog-close",
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/dialog.tsx",
        lineNumber: 20,
        columnNumber: 10
    }, this);
}
function DialogOverlay({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Overlay"], {
        "data-slot": "dialog-overlay",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/dialog.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
function DialogContent({ className, children, showCloseButton = true, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogPortal, {
        "data-slot": "dialog-portal",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogOverlay, {}, void 0, false, {
                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/dialog.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Content"], {
                "data-slot": "dialog-content",
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg", className),
                ...props,
                children: [
                    children,
                    showCloseButton && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Close"], {
                        "data-slot": "dialog-close",
                        className: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XIcon$3e$__["XIcon"], {}, void 0, false, {
                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/dialog.tsx",
                                lineNumber: 64,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "sr-only",
                                children: "Close"
                            }, void 0, false, {
                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/dialog.tsx",
                                lineNumber: 65,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/dialog.tsx",
                        lineNumber: 60,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/dialog.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/dialog.tsx",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
function DialogHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "dialog-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex flex-col gap-2 text-center sm:text-left", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/dialog.tsx",
        lineNumber: 74,
        columnNumber: 10
    }, this);
}
function DialogFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "dialog-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/dialog.tsx",
        lineNumber: 78,
        columnNumber: 10
    }, this);
}
function DialogTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Title"], {
        "data-slot": "dialog-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-lg leading-none font-semibold", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/dialog.tsx",
        lineNumber: 85,
        columnNumber: 10
    }, this);
}
function DialogDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$dialog$40$1$2e$1$2e$15$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Description"], {
        "data-slot": "dialog-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground text-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/dialog.tsx",
        lineNumber: 92,
        columnNumber: 10
    }, this);
}
;
}),
"[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/input.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/next@16.1.4+67f6792bdf102c28/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/lib/utils.ts [app-ssr] (ecmascript)");
;
;
function Input({ className, type, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        "data-slot": "input",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]", "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/input.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/label.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Label",
    ()=>Label
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/next@16.1.4+67f6792bdf102c28/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$label$40$2$2e$1$2e$8$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/@radix-ui+react-label@2.1.8+55cb9442da38fd66/node_modules/@radix-ui/react-label/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
function Label({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$label$40$2$2e$1$2e$8$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "label",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/label.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/textarea.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Textarea",
    ()=>Textarea
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/next@16.1.4+67f6792bdf102c28/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/lib/utils.ts [app-ssr] (ecmascript)");
;
;
function Textarea({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
        "data-slot": "textarea",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/textarea.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Select",
    ()=>Select,
    "SelectContent",
    ()=>SelectContent,
    "SelectGroup",
    ()=>SelectGroup,
    "SelectItem",
    ()=>SelectItem,
    "SelectLabel",
    ()=>SelectLabel,
    "SelectScrollDownButton",
    ()=>SelectScrollDownButton,
    "SelectScrollUpButton",
    ()=>SelectScrollUpButton,
    "SelectSeparator",
    ()=>SelectSeparator,
    "SelectTrigger",
    ()=>SelectTrigger,
    "SelectValue",
    ()=>SelectValue
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/next@16.1.4+67f6792bdf102c28/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/@radix-ui+react-select@2.2.6+55cb9442da38fd66/node_modules/@radix-ui/react-select/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckIcon$3e$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/lucide-react@0.562.0+83d5fd7b249dbeef/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript) <export default as CheckIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/lucide-react@0.562.0+83d5fd7b249dbeef/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-ssr] (ecmascript) <export default as ChevronDownIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUpIcon$3e$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/lucide-react@0.562.0+83d5fd7b249dbeef/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-ssr] (ecmascript) <export default as ChevronUpIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
;
function Select({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "select",
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
        lineNumber: 8,
        columnNumber: 10
    }, this);
}
function SelectGroup({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"], {
        "data-slot": "select-group",
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
        lineNumber: 12,
        columnNumber: 10
    }, this);
}
function SelectValue({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Value"], {
        "data-slot": "select-value",
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
        lineNumber: 16,
        columnNumber: 10
    }, this);
}
function SelectTrigger({ className, size = "default", children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-slot": "select-trigger",
        "data-size": size,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
        ...props,
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
                asChild: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                    className: "size-4 opacity-50"
                }, void 0, false, {
                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
                    lineNumber: 39,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
function SelectContent({ className, children, position = "popper", align = "center", ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Portal"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Content"], {
            "data-slot": "select-content",
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
            position: position,
            align: align,
            ...props,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SelectScrollUpButton, {}, void 0, false, {
                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
                    lineNumber: 66,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Viewport"], {
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
                    children: children
                }, void 0, false, {
                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
                    lineNumber: 67,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SelectScrollDownButton, {}, void 0, false, {
                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
                    lineNumber: 76,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
            lineNumber: 54,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
function SelectLabel({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
        "data-slot": "select-label",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground px-2 py-1.5 text-xs", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
        lineNumber: 86,
        columnNumber: 10
    }, this);
}
function SelectItem({ className, children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Item"], {
        "data-slot": "select-item",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "absolute right-2 flex size-3.5 items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ItemIndicator"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckIcon$3e$__["CheckIcon"], {
                        className: "size-4"
                    }, void 0, false, {
                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
                        lineNumber: 105,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
                    lineNumber: 104,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
                lineNumber: 103,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ItemText"], {
                children: children
            }, void 0, false, {
                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
function SelectSeparator({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Separator"], {
        "data-slot": "select-separator",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("bg-border pointer-events-none -mx-1 my-1 h-px", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
        lineNumber: 117,
        columnNumber: 10
    }, this);
}
function SelectScrollUpButton({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ScrollUpButton"], {
        "data-slot": "select-scroll-up-button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex cursor-default items-center justify-center py-1", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUpIcon$3e$__["ChevronUpIcon"], {
            className: "size-4"
        }, void 0, false, {
            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
            lineNumber: 130,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
        lineNumber: 125,
        columnNumber: 5
    }, this);
}
function SelectScrollDownButton({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$radix$2d$ui$2b$react$2d$select$40$2$2e$2$2e$6$2b$55cb9442da38fd66$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ScrollDownButton"], {
        "data-slot": "select-scroll-down-button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex cursor-default items-center justify-center py-1", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
            className: "size-4"
        }, void 0, false, {
            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
            lineNumber: 145,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx",
        lineNumber: 140,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NewsPage",
    ()=>NewsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/next@16.1.4+67f6792bdf102c28/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/next@16.1.4+67f6792bdf102c28/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$tanstack$2b$react$2d$query$40$5$2e$90$2e$7$2b$83d5fd7b249dbeef$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/@tanstack+react-query@5.90.7+83d5fd7b249dbeef/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$tanstack$2b$react$2d$query$40$5$2e$90$2e$7$2b$83d5fd7b249dbeef$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/@tanstack+react-query@5.90.7+83d5fd7b249dbeef/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$tanstack$2b$react$2d$query$40$5$2e$90$2e$7$2b$83d5fd7b249dbeef$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/@tanstack+react-query@5.90.7+83d5fd7b249dbeef/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/lucide-react@0.562.0+83d5fd7b249dbeef/node_modules/lucide-react/dist/esm/icons/calendar.js [app-ssr] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/lucide-react@0.562.0+83d5fd7b249dbeef/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-ssr] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/lucide-react@0.562.0+83d5fd7b249dbeef/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/lucide-react@0.562.0+83d5fd7b249dbeef/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/lucide-react@0.562.0+83d5fd7b249dbeef/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-ssr] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/lucide-react@0.562.0+83d5fd7b249dbeef/node_modules/lucide-react/dist/esm/icons/bell.js [app-ssr] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/lucide-react@0.562.0+83d5fd7b249dbeef/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$hooks$2f$useBackend$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/hooks/useBackend.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/input.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/label.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/textarea.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$use$2d$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/use-toast.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/contexts/LanguageContext.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const RSVP_PARTICIPANT_ID_KEY = "cne-event-participant-id";
const RSVP_EVENTS_KEY = "cne-rsvped-event-ids";
const RSVP_NAME_KEY = "cne-rsvp-name";
const NEWS_DEFAULT_TAB_KEY = "cne-news-default-tab";
function NewsPage() {
    const backend = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$hooks$2f$useBackend$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useBackend"])();
    const { language, t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLanguage"])();
    const { toast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$use$2d$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useToast"])();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$tanstack$2b$react$2d$query$40$5$2e$90$2e$7$2b$83d5fd7b249dbeef$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    const [announcementDialogOpen, setAnnouncementDialogOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const priorityOptions = [
        "normal",
        "urgent"
    ];
    const normalizePriority = (value)=>priorityOptions.includes(value) ? value : "normal";
    const [priority, setPriority] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("normal");
    const [announcementPasscode, setAnnouncementPasscode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [eventPasscode, setEventPasscode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [deleteDialogOpen, setDeleteDialogOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [announcementToDelete, setAnnouncementToDelete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [deletePasscode, setDeletePasscode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [eventDialogOpen, setEventDialogOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [rsvpDialogOpen, setRsvpDialogOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedEvent, setSelectedEvent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [rsvpParticipantId, setRsvpParticipantId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [rsvpedEventIds, setRsvpedEventIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>new Set());
    const [rsvpName, setRsvpName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return "announcements";
    });
    const { data: announcementsData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$tanstack$2b$react$2d$query$40$5$2e$90$2e$7$2b$83d5fd7b249dbeef$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "announcements"
        ],
        queryFn: ()=>backend.listAnnouncements({
                limit: 50
            })
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        let storedId;
        const storedRsvps = undefined;
        const storedName = undefined;
    }, []);
    const ensureParticipantId = ()=>{
        if (rsvpParticipantId) return rsvpParticipantId;
        if ("TURBOPACK compile-time truthy", 1) return null;
        //TURBOPACK unreachable
        ;
        let storedId;
    };
    const { data: eventsData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$tanstack$2b$react$2d$query$40$5$2e$90$2e$7$2b$83d5fd7b249dbeef$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "events"
        ],
        queryFn: ()=>backend.listEvents({
                upcoming: false
            })
    });
    const upcomingEvents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!eventsData?.events) return [];
        const now = Date.now();
        return [
            ...eventsData.events
        ].filter((eventItem)=>new Date(eventItem.eventDate).getTime() >= now).sort((a, b)=>new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    }, [
        eventsData
    ]);
    const createAnnouncement = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$tanstack$2b$react$2d$query$40$5$2e$90$2e$7$2b$83d5fd7b249dbeef$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async (_data)=>Promise.reject(new Error("Announcement creation not implemented")),
        onSuccess: ()=>{
            queryClient.invalidateQueries({
                queryKey: [
                    "announcements"
                ]
            });
            setAnnouncementDialogOpen(false);
            setPriority("normal");
            setAnnouncementPasscode("");
            toast({
                title: t("Success", "Éxito"),
                description: t("Announcement created successfully", "Anuncio creado exitosamente")
            });
        },
        onError: (error)=>{
            toast({
                title: t("Error", "Error"),
                description: error.message,
                variant: "destructive"
            });
        }
    });
    const createEvent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$tanstack$2b$react$2d$query$40$5$2e$90$2e$7$2b$83d5fd7b249dbeef$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async (_data)=>Promise.reject(new Error("Event creation not implemented")),
        onSuccess: ()=>{
            queryClient.invalidateQueries({
                queryKey: [
                    "events"
                ]
            });
            setEventDialogOpen(false);
            setEventPasscode("");
            toast({
                title: t("Success", "Éxito"),
                description: t("Event created successfully", "Evento creado exitosamente")
            });
        },
        onError: (error)=>{
            toast({
                title: t("Error", "Error"),
                description: error.message,
                variant: "destructive"
            });
        }
    });
    const rsvpForEvent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$tanstack$2b$react$2d$query$40$5$2e$90$2e$7$2b$83d5fd7b249dbeef$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async (_data)=>Promise.reject(new Error("RSVP not implemented")),
        onSuccess: (_data, variables)=>{
            setRsvpedEventIds((previous)=>{
                const updated = new Set(previous);
                updated.add(variables.eventId);
                try {
                    window.localStorage.setItem(RSVP_EVENTS_KEY, JSON.stringify(Array.from(updated)));
                } catch  {
                // ignore
                }
                return updated;
            });
            queryClient.invalidateQueries({
                queryKey: [
                    "events"
                ]
            });
            setRsvpDialogOpen(false);
            if (variables.name) {
                try {
                    window.localStorage.setItem(RSVP_NAME_KEY, variables.name);
                } catch  {
                // ignore
                }
                setRsvpName(variables.name);
            }
            toast({
                title: t("Success", "Éxito"),
                description: t("RSVP submitted successfully", "RSVP enviado exitosamente")
            });
        },
        onError: (error)=>{
            toast({
                title: t("Error", "Error"),
                description: error.message,
                variant: "destructive"
            });
        }
    });
    const deleteAnnouncement = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$tanstack$2b$react$2d$query$40$5$2e$90$2e$7$2b$83d5fd7b249dbeef$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async (_data)=>Promise.reject(new Error("Delete not implemented")),
        onSuccess: (_data, variables)=>{
            queryClient.setQueryData([
                "announcements"
            ], (oldData)=>{
                if (!oldData) return oldData;
                return {
                    announcements: oldData.announcements.filter((item)=>item.id !== variables.id)
                };
            });
            toast({
                title: t("Success", "Éxito"),
                description: t("Announcement deleted", "Anuncio eliminado")
            });
            setDeleteDialogOpen(false);
            setAnnouncementToDelete(null);
            setDeletePasscode("");
        },
        onError: (error)=>{
            toast({
                title: t("Error", "Error"),
                description: error.message,
                variant: "destructive"
            });
        }
    });
    const handleCreateAnnouncement = (e)=>{
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createAnnouncement.mutate({
            titleEn: formData.get("titleEn"),
            titleEs: formData.get("titleEs"),
            contentEn: formData.get("contentEn"),
            contentEs: formData.get("contentEs"),
            priority,
            passcode: announcementPasscode,
            imageUrl: formData.get("imageUrl") || ""
        });
    };
    const handleCreateEvent = (e)=>{
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createEvent.mutate({
            titleEn: formData.get("titleEn"),
            titleEs: formData.get("titleEs"),
            descriptionEn: formData.get("descriptionEn"),
            descriptionEs: formData.get("descriptionEs"),
            eventDate: formData.get("eventDate"),
            location: formData.get("location"),
            maxAttendees: parseInt(formData.get("maxAttendees")) || 0,
            passcode: eventPasscode
        });
    };
    const handleRsvp = (e)=>{
        e.preventDefault();
        if (!selectedEvent) return;
        const formData = new FormData(e.currentTarget);
        rsvpForEvent.mutate({
            eventId: selectedEvent.id,
            attendees: parseInt(formData.get("attendees")) || 1,
            participantId: ensureParticipantId(),
            name: rsvpName.trim().length > 0 ? rsvpName.trim() : null
        });
    };
    const handleDeleteAnnouncement = (e)=>{
        e.preventDefault();
        if (!announcementToDelete) return;
        deleteAnnouncement.mutate({
            id: announcementToDelete.id,
            passcode: deletePasscode
        });
    };
    const getPriorityIcon = (priorityLevel)=>{
        switch(priorityLevel){
            case "urgent":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                    className: "h-5 w-5 text-orange-500"
                }, void 0, false, {
                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                    lineNumber: 296,
                    columnNumber: 16
                }, this);
            case "normal":
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                    className: "h-5 w-5 text-blue-500"
                }, void 0, false, {
                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                    lineNumber: 299,
                    columnNumber: 16
                }, this);
        }
    };
    const getPriorityColor = (priorityLevel)=>{
        switch(priorityLevel){
            case "urgent":
                return "border-orange-600 bg-orange-950/30";
            case "normal":
            default:
                return "border-neutral-700 bg-neutral-900/50";
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "container mx-auto space-y-8 px-4 py-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold text-white",
                                children: activeTab === "announcements" ? t("News & Announcements", "Noticias y Anuncios") : t("Upcoming Events", "Próximos Eventos")
                            }, void 0, false, {
                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                lineNumber: 318,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                            lineNumber: 317,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col items-stretch gap-4 md:flex-row md:items-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex w-full items-center gap-2 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/60 p-1 md:w-auto",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setActiveTab("announcements"),
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors text-center md:flex-none", activeTab === "announcements" ? "bg-red-600 text-white" : "text-neutral-300 hover:text-white"),
                                            children: t("Announcements", "Anuncios")
                                        }, void 0, false, {
                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                            lineNumber: 326,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setActiveTab("events"),
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors text-center md:flex-none", activeTab === "events" ? "bg-red-600 text-white" : "text-neutral-300 hover:text-white"),
                                            children: t("Events", "Eventos")
                                        }, void 0, false, {
                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                            lineNumber: 336,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                    lineNumber: 325,
                                    columnNumber: 13
                                }, this),
                                activeTab === "announcements" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Dialog"], {
                                    open: announcementDialogOpen,
                                    onOpenChange: setAnnouncementDialogOpen,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogTrigger"], {
                                            asChild: true,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                size: "icon",
                                                className: "h-10 w-10 bg-red-600 hover:bg-red-700",
                                                "aria-label": t("Create a new announcement", "Crear un nuevo anuncio"),
                                                onClick: ()=>setAnnouncementDialogOpen(true),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                        lineNumber: 356,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "sr-only",
                                                        children: t("Create a new announcement", "Crear un nuevo anuncio")
                                                    }, void 0, false, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                        lineNumber: 357,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                lineNumber: 350,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                            lineNumber: 349,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogContent"], {
                                            className: "border-neutral-800 bg-neutral-900",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogHeader"], {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogTitle"], {
                                                        className: "text-white",
                                                        children: t("Create Announcement", "Crear Anuncio")
                                                    }, void 0, false, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                        lineNumber: 362,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                    lineNumber: 361,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                    onSubmit: handleCreateAnnouncement,
                                                    className: "space-y-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "titleEn",
                                                                    className: "text-neutral-200",
                                                                    children: t("Title (English)", "Título (Inglés)")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 366,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                                    id: "titleEn",
                                                                    name: "titleEn",
                                                                    required: true,
                                                                    className: "border-neutral-700 bg-neutral-800 text-white"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 367,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 365,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "titleEs",
                                                                    className: "text-neutral-200",
                                                                    children: t("Title (Spanish)", "Título (Español)")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 370,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                                    id: "titleEs",
                                                                    name: "titleEs",
                                                                    required: true,
                                                                    className: "border-neutral-700 bg-neutral-800 text-white"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 371,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 369,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "contentEn",
                                                                    className: "text-neutral-200",
                                                                    children: t("Content (English)", "Contenido (Inglés)")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 374,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Textarea"], {
                                                                    id: "contentEn",
                                                                    name: "contentEn",
                                                                    required: true,
                                                                    className: "border-neutral-700 bg-neutral-800 text-white"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 375,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 373,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "contentEs",
                                                                    className: "text-neutral-200",
                                                                    children: t("Content (Spanish)", "Contenido (Español)")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 378,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Textarea"], {
                                                                    id: "contentEs",
                                                                    name: "contentEs",
                                                                    required: true,
                                                                    className: "border-neutral-700 bg-neutral-800 text-white"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 379,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 377,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "imageUrl",
                                                                    className: "text-neutral-200",
                                                                    children: t("Image URL (optional)", "URL de imagen (opcional)")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 382,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                                    id: "imageUrl",
                                                                    name: "imageUrl",
                                                                    className: "border-neutral-700 bg-neutral-800 text-white"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 383,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 381,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                                    className: "text-neutral-200",
                                                                    children: t("Priority", "Prioridad")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 386,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Select"], {
                                                                    value: priority,
                                                                    onValueChange: (value)=>setPriority(normalizePriority(value)),
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                            className: "border-neutral-700 bg-neutral-800 text-white",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectValue"], {}, void 0, false, {
                                                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                                lineNumber: 389,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                            lineNumber: 388,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                            className: "border-neutral-700 bg-neutral-800",
                                                                            children: priorityOptions.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                    value: option,
                                                                                    children: t(option === "normal" ? "Normal" : "Urgent", option === "normal" ? "Normal" : "Urgente")
                                                                                }, option, false, {
                                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                                    lineNumber: 393,
                                                                                    columnNumber: 29
                                                                                }, this))
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                            lineNumber: 391,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 387,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 385,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "announcementPasscode",
                                                                    className: "text-neutral-200",
                                                                    children: t("Passcode", "Código")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 401,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                                    id: "announcementPasscode",
                                                                    type: "password",
                                                                    value: announcementPasscode,
                                                                    onChange: (event)=>setAnnouncementPasscode(event.target.value),
                                                                    required: true,
                                                                    className: "border-neutral-700 bg-neutral-800 text-white"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 402,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 400,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                            type: "submit",
                                                            className: "w-full bg-red-600 hover:bg-red-700",
                                                            children: t("Create Announcement", "Crear Anuncio")
                                                        }, void 0, false, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 411,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                    lineNumber: 364,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                            lineNumber: 360,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                    lineNumber: 348,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Dialog"], {
                                    open: eventDialogOpen,
                                    onOpenChange: setEventDialogOpen,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogTrigger"], {
                                            asChild: true,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                size: "icon",
                                                className: "h-10 w-10 bg-red-600 hover:bg-red-700",
                                                "aria-label": t("Create a new event", "Crear un nuevo evento"),
                                                onClick: ()=>setEventDialogOpen(true),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                        lineNumber: 424,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "sr-only",
                                                        children: t("Create a new event", "Crear un nuevo evento")
                                                    }, void 0, false, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                        lineNumber: 425,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                lineNumber: 418,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                            lineNumber: 417,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogContent"], {
                                            className: "border-neutral-800 bg-neutral-900",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogHeader"], {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogTitle"], {
                                                        className: "text-white",
                                                        children: t("Create New Event", "Crear Nuevo Evento")
                                                    }, void 0, false, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                        lineNumber: 430,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                    lineNumber: 429,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                    onSubmit: handleCreateEvent,
                                                    className: "space-y-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "titleEn",
                                                                    className: "text-neutral-200",
                                                                    children: t("Title (English)", "Título (Inglés)")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 434,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                                    id: "titleEn",
                                                                    name: "titleEn",
                                                                    required: true,
                                                                    className: "border-neutral-700 bg-neutral-800 text-white"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 435,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 433,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "titleEs",
                                                                    className: "text-neutral-200",
                                                                    children: t("Title (Spanish)", "Título (Español)")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 438,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                                    id: "titleEs",
                                                                    name: "titleEs",
                                                                    required: true,
                                                                    className: "border-neutral-700 bg-neutral-800 text-white"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 439,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 437,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "descriptionEn",
                                                                    className: "text-neutral-200",
                                                                    children: t("Description (English)", "Descripción (Inglés)")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 442,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Textarea"], {
                                                                    id: "descriptionEn",
                                                                    name: "descriptionEn",
                                                                    className: "border-neutral-700 bg-neutral-800 text-white"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 443,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 441,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "descriptionEs",
                                                                    className: "text-neutral-200",
                                                                    children: t("Description (Spanish)", "Descripción (Español)")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 446,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Textarea"], {
                                                                    id: "descriptionEs",
                                                                    name: "descriptionEs",
                                                                    className: "border-neutral-700 bg-neutral-800 text-white"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 447,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 445,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "eventDate",
                                                                    className: "text-neutral-200",
                                                                    children: t("Date & Time", "Fecha y Hora")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 450,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                                    id: "eventDate",
                                                                    name: "eventDate",
                                                                    type: "datetime-local",
                                                                    required: true,
                                                                    className: "border-neutral-700 bg-neutral-800 text-white"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 451,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 449,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "location",
                                                                    className: "text-neutral-200",
                                                                    children: t("Location", "Ubicación")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 454,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                                    id: "location",
                                                                    name: "location",
                                                                    required: true,
                                                                    className: "border-neutral-700 bg-neutral-800 text-white"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 455,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 453,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "maxAttendees",
                                                                    className: "text-neutral-200",
                                                                    children: t("Max Attendees (optional)", "Máximo de Asistentes (opcional)")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 458,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                                    id: "maxAttendees",
                                                                    name: "maxAttendees",
                                                                    type: "number",
                                                                    min: "1",
                                                                    className: "border-neutral-700 bg-neutral-800 text-white"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 459,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 457,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                                    htmlFor: "eventPasscode",
                                                                    className: "text-neutral-200",
                                                                    children: t("Passcode", "Código")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 462,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                                    id: "eventPasscode",
                                                                    type: "password",
                                                                    value: eventPasscode,
                                                                    onChange: (event)=>setEventPasscode(event.target.value),
                                                                    required: true,
                                                                    className: "border-neutral-700 bg-neutral-800 text-white"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                    lineNumber: 463,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 461,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                            type: "submit",
                                                            className: "w-full bg-red-600 hover:bg-red-700",
                                                            children: t("Create Event", "Crear Evento")
                                                        }, void 0, false, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 472,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                    lineNumber: 432,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                            lineNumber: 428,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                    lineNumber: 416,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                            lineNumber: 324,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                    lineNumber: 316,
                    columnNumber: 9
                }, this),
                activeTab === "announcements" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: [
                        (announcementsData?.announcements ?? []).map((announcement)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("border-2", getPriorityColor(normalizePriority(announcement.priority))),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                                            className: "flex items-center gap-2 text-white",
                                                            children: [
                                                                getPriorityIcon(normalizePriority(announcement.priority)),
                                                                language === "en" ? announcement.titleEn : announcement.titleEs
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 487,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "mt-1 text-xs text-neutral-400",
                                                            children: new Date(announcement.createdAt).toLocaleDateString()
                                                        }, void 0, false, {
                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                            lineNumber: 491,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                    lineNumber: 486,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "ghost",
                                                    size: "icon",
                                                    className: "text-neutral-400 hover:bg-red-950/40 hover:text-red-400",
                                                    onClick: ()=>{
                                                        setAnnouncementToDelete(announcement);
                                                        setDeletePasscode("");
                                                        setDeleteDialogOpen(true);
                                                    },
                                                    "aria-label": t("Delete announcement", "Eliminar anuncio"),
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                        lineNumber: 504,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                    lineNumber: 493,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                            lineNumber: 485,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                        lineNumber: 484,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                        children: [
                                            announcement.imageUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-3 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950/60",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: announcement.imageUrl,
                                                    alt: language === "en" ? announcement.titleEn : announcement.titleEs,
                                                    className: "max-h-64 w-full object-cover"
                                                }, void 0, false, {
                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                    lineNumber: 511,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                lineNumber: 510,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "whitespace-pre-wrap text-neutral-300",
                                                children: language === "en" ? announcement.contentEn : announcement.contentEs
                                            }, void 0, false, {
                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                lineNumber: 518,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                        lineNumber: 508,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, announcement.id, true, {
                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                lineNumber: 483,
                                columnNumber: 15
                            }, this)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Dialog"], {
                            open: deleteDialogOpen,
                            onOpenChange: (open)=>{
                                setDeleteDialogOpen(open);
                                if (!open) {
                                    setAnnouncementToDelete(null);
                                    setDeletePasscode("");
                                }
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogContent"], {
                                className: "border-neutral-800 bg-neutral-900",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogHeader"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogTitle"], {
                                                className: "text-white",
                                                children: t("Delete Announcement", "Eliminar Anuncio")
                                            }, void 0, false, {
                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                lineNumber: 532,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-neutral-400",
                                                children: t("Enter the passcode to permanently delete this announcement.", "Ingresa el código para eliminar este anuncio permanentemente.")
                                            }, void 0, false, {
                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                lineNumber: 533,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                        lineNumber: 531,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                        onSubmit: handleDeleteAnnouncement,
                                        className: "space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                        htmlFor: "deletePasscode",
                                                        className: "text-neutral-200",
                                                        children: t("Passcode", "Código")
                                                    }, void 0, false, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                        lineNumber: 542,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                        id: "deletePasscode",
                                                        type: "password",
                                                        value: deletePasscode,
                                                        onChange: (event)=>setDeletePasscode(event.target.value),
                                                        required: true,
                                                        className: "border-neutral-700 bg-neutral-800 text-white"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                        lineNumber: 543,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                lineNumber: 541,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-end gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                        type: "button",
                                                        variant: "outline",
                                                        onClick: ()=>{
                                                            setDeleteDialogOpen(false);
                                                            setAnnouncementToDelete(null);
                                                            setDeletePasscode("");
                                                        },
                                                        className: "border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800",
                                                        children: t("Cancel", "Cancelar")
                                                    }, void 0, false, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                        lineNumber: 553,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                        type: "submit",
                                                        className: "bg-red-600 hover:bg-red-700",
                                                        children: t("Delete", "Eliminar")
                                                    }, void 0, false, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                        lineNumber: 565,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                lineNumber: 552,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                        lineNumber: 540,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                lineNumber: 530,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                            lineNumber: 523,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                    lineNumber: 481,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: [
                        upcomingEvents.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-neutral-400",
                            children: t("No upcoming events.", "No hay eventos próximos.")
                        }, void 0, false, {
                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                            lineNumber: 574,
                            columnNumber: 15
                        }, this) : upcomingEvents.map((eventItem)=>{
                            const alreadyRsvped = rsvpedEventIds.has(eventItem.id);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                                className: "border-neutral-700 bg-neutral-900/50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                                className: "text-white",
                                                children: language === "en" ? eventItem.titleEn : eventItem.titleEs
                                            }, void 0, false, {
                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                lineNumber: 581,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-2 flex flex-col gap-2 text-sm text-neutral-300 sm:flex-row sm:items-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                                className: "h-4 w-4 text-red-400"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                lineNumber: 584,
                                                                columnNumber: 27
                                                            }, this),
                                                            new Date(eventItem.eventDate).toLocaleString(language === "en" ? "en-US" : "es-ES")
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                        lineNumber: 583,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                                className: "h-4 w-4 text-red-400"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                lineNumber: 588,
                                                                columnNumber: 27
                                                            }, this),
                                                            eventItem.location
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                        lineNumber: 587,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "inline-flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                                className: "h-4 w-4 text-red-400"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                                lineNumber: 592,
                                                                columnNumber: 27
                                                            }, this),
                                                            eventItem.rsvpCount
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                        lineNumber: 591,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                lineNumber: 582,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                        lineNumber: 580,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                        className: "space-y-3",
                                        children: [
                                            (language === "en" ? eventItem.descriptionEn : eventItem.descriptionEs) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-neutral-300 whitespace-pre-wrap",
                                                children: language === "en" ? eventItem.descriptionEn : eventItem.descriptionEs
                                            }, void 0, false, {
                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                lineNumber: 599,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                type: "button",
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(alreadyRsvped ? "bg-neutral-800 text-neutral-300" : "bg-red-600 hover:bg-red-700"),
                                                disabled: alreadyRsvped,
                                                onClick: ()=>{
                                                    setSelectedEvent(eventItem);
                                                    setRsvpDialogOpen(true);
                                                },
                                                children: alreadyRsvped ? t("RSVP'd", "Confirmado") : t("RSVP", "Confirmar")
                                            }, void 0, false, {
                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                lineNumber: 603,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                        lineNumber: 597,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, eventItem.id, true, {
                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                lineNumber: 579,
                                columnNumber: 19
                            }, this);
                        }),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Dialog"], {
                            open: rsvpDialogOpen,
                            onOpenChange: setRsvpDialogOpen,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogContent"], {
                                className: "border-neutral-800 bg-neutral-900",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogHeader"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogTitle"], {
                                            className: "text-white",
                                            children: t("RSVP", "Confirmar")
                                        }, void 0, false, {
                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                            lineNumber: 623,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                        lineNumber: 622,
                                        columnNumber: 17
                                    }, this),
                                    selectedEvent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                        onSubmit: handleRsvp,
                                        className: "space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                        htmlFor: "rsvpName",
                                                        className: "text-neutral-200",
                                                        children: t("Name (optional)", "Nombre (opcional)")
                                                    }, void 0, false, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                        lineNumber: 628,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                        id: "rsvpName",
                                                        value: rsvpName,
                                                        onChange: (e)=>setRsvpName(e.target.value),
                                                        className: "border-neutral-700 bg-neutral-800 text-white"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                        lineNumber: 629,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                lineNumber: 627,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                        htmlFor: "attendees",
                                                        className: "text-neutral-200",
                                                        children: t("Attendees", "Asistentes")
                                                    }, void 0, false, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                        lineNumber: 637,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                        id: "attendees",
                                                        name: "attendees",
                                                        type: "number",
                                                        min: "1",
                                                        defaultValue: "1",
                                                        required: true,
                                                        className: "border-neutral-700 bg-neutral-800 text-white"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                        lineNumber: 638,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                lineNumber: 636,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                type: "submit",
                                                className: "w-full bg-red-600 hover:bg-red-700",
                                                children: t("Submit", "Enviar")
                                            }, void 0, false, {
                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                                lineNumber: 648,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                        lineNumber: 626,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                                lineNumber: 621,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                            lineNumber: 620,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
                    lineNumber: 572,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
            lineNumber: 315,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/NewsPage.tsx",
        lineNumber: 314,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=da5a4_com~apple~CloudDocs_Church-Sites_centro-de-nueva-esperanza_next-app_3ed7f0c7._.js.map