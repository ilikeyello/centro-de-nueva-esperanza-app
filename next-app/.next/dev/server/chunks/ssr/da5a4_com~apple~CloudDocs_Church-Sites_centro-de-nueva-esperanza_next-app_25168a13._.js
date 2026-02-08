module.exports = [
"[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/lib/churchEnv.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "churchOrgId",
    ()=>churchOrgId,
    "createSupabaseServerClient",
    ()=>createSupabaseServerClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$supabase$2b$supabase$2d$js$40$2$2e$93$2e$3$2b$4789783d1fa00420$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/@supabase+supabase-js@2.93.3+4789783d1fa00420/node_modules/@supabase/supabase-js/dist/index.mjs [app-rsc] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://wreovuejotnudkpaaffz.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZW92dWVqb3RudWRrcGFhZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4ODcwMzMsImV4cCI6MjA4NDQ2MzAzM30.tQRk6TrUpPFTlWTDq5q_7PVkDlSWvu7mAG3rk5fRHhQ");
const churchOrgId = ("TURBOPACK compile-time value", "org_38agxTQYvbrRSYd2jdxcfL5DGXf");
function createSupabaseServerClient() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f40$supabase$2b$supabase$2d$js$40$2$2e$93$2e$3$2b$4789783d1fa00420$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
}
}),
"[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/app/bulletin/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40f56e87d33ccb5ef7e7ddc66562231175898562d7":"createBulletinPost"},"",""] */ __turbopack_context__.s([
    "createBulletinPost",
    ()=>createBulletinPost
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/next@16.1.4+67f6792bdf102c28/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/next@16.1.4+67f6792bdf102c28/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$churchEnv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/lib/churchEnv.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/next@16.1.4+67f6792bdf102c28/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function createBulletinPost(formData) {
    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const authorName = String(formData.get("authorName") ?? "").trim();
    if (!title || !content) {
        return {
            ok: false,
            error: "Title and content are required."
        };
    }
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$churchEnv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["churchOrgId"]) {
        return {
            ok: false,
            error: "Church org ID is missing."
        };
    }
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$churchEnv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createSupabaseServerClient"])();
    if (!supabase) {
        return {
            ok: false,
            error: "Supabase env vars are missing."
        };
    }
    const { error } = await supabase.from("bulletin_posts").insert({
        organization_id: __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$churchEnv$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["churchOrgId"],
        title,
        content,
        author_name: authorName || "Anonymous",
        author_id: null
    });
    if (error) {
        return {
            ok: false,
            error: error.message
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/bulletin");
    return {
        ok: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    createBulletinPost
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createBulletinPost, "40f56e87d33ccb5ef7e7ddc66562231175898562d7", null);
}),
"[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/.next-internal/server/app/bulletin/page/actions.js { ACTIONS_MODULE0 => \"[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/app/bulletin/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$app$2f$bulletin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/app/bulletin/actions.ts [app-rsc] (ecmascript)");
;
}),
"[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/.next-internal/server/app/bulletin/page/actions.js { ACTIONS_MODULE0 => \"[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/app/bulletin/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40f56e87d33ccb5ef7e7ddc66562231175898562d7",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$app$2f$bulletin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createBulletinPost"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f2e$next$2d$internal$2f$server$2f$app$2f$bulletin$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$app$2f$bulletin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/.next-internal/server/app/bulletin/page/actions.js { ACTIONS_MODULE0 => "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/app/bulletin/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$app$2f$bulletin$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/app/bulletin/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=da5a4_com~apple~CloudDocs_Church-Sites_centro-de-nueva-esperanza_next-app_25168a13._.js.map