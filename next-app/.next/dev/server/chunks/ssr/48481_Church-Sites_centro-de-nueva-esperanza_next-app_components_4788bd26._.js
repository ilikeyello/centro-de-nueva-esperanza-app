module.exports = [
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
"[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BiblePage",
    ()=>BiblePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/next@16.1.4+67f6792bdf102c28/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/next@16.1.4+67f6792bdf102c28/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/lucide-react@0.562.0+83d5fd7b249dbeef/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/lucide-react@0.562.0+83d5fd7b249dbeef/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-ssr] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/node_modules/.bun/lucide-react@0.562.0+83d5fd7b249dbeef/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/input.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/select.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/contexts/LanguageContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$use$2d$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/ui/use-toast.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/lib/utils.ts [app-ssr] (ecmascript)");
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
const API_BASE = process.env.NEXT_PUBLIC_CLIENT_TARGET || "https://prod-cne-sh82.encr.app";
const BIBLE_STORAGE_KEY = "cne:bible:selection";
const FALLBACK_BIBLE_VERSIONS = [
    {
        id: "kjv",
        name: "King James Version",
        abbreviation: "KJV"
    },
    {
        id: "rv1909",
        name: "Reina-Valera 1909",
        abbreviation: "RV1909"
    },
    {
        id: "spnbes",
        name: "La Biblia en Español Sencillo",
        abbreviation: "SPNBES"
    }
];
const SPANISH_BOOK_NAMES = {
    genesis: "Génesis",
    exodus: "Éxodo",
    leviticus: "Levítico",
    numbers: "Números",
    deuteronomy: "Deuteronomio",
    joshua: "Josué",
    judges: "Jueces",
    ruth: "Rut",
    "1-samuel": "1 Samuel",
    "2-samuel": "2 Samuel",
    "1-kings": "1 Reyes",
    "2-kings": "2 Reyes",
    "1-chronicles": "1 Crónicas",
    "2-chronicles": "2 Crónicas",
    ezra: "Esdras",
    nehemiah: "Nehemías",
    esther: "Ester",
    job: "Job",
    psalms: "Salmos",
    proverbs: "Proverbios",
    ecclesiastes: "Eclesiastés",
    "song-of-solomon": "Cantares",
    isaiah: "Isaías",
    jeremiah: "Jeremías",
    lamentations: "Lamentaciones",
    ezekiel: "Ezequiel",
    daniel: "Daniel",
    hosea: "Oseas",
    joel: "Joel",
    amos: "Amós",
    obadiah: "Abdías",
    jonah: "Jonás",
    micah: "Miqueas",
    nahum: "Nahúm",
    habakkuk: "Habacuc",
    zephaniah: "Sofonías",
    haggai: "Hageo",
    zechariah: "Zacarías",
    malachi: "Malaquías",
    matthew: "Mateo",
    mark: "Marcos",
    luke: "Lucas",
    john: "Juan",
    acts: "Hechos",
    romans: "Romanos",
    "1-corinthians": "1 Corintios",
    "2-corinthians": "2 Corintios",
    galatians: "Gálatas",
    ephesians: "Efesios",
    philippians: "Filipenses",
    colossians: "Colosenses",
    "1-thessalonians": "1 Tesalonicenses",
    "2-thessalonians": "2 Tesalonicenses",
    "1-timothy": "1 Timoteo",
    "2-timothy": "2 Timoteo",
    titus: "Tito",
    philemon: "Filemón",
    hebrews: "Hebreos",
    james: "Santiago",
    "1-peter": "1 Pedro",
    "2-peter": "2 Pedro",
    "1-john": "1 Juan",
    "2-john": "2 Juan",
    "3-john": "3 Juan",
    jude: "Judas",
    revelation: "Apocalipsis"
};
const FALLBACK_BIBLE_BOOKS = [
    {
        id: "genesis",
        name: "Genesis",
        testament: "OT",
        chapters: 50
    },
    {
        id: "exodus",
        name: "Exodus",
        testament: "OT",
        chapters: 40
    },
    {
        id: "leviticus",
        name: "Leviticus",
        testament: "OT",
        chapters: 27
    },
    {
        id: "numbers",
        name: "Numbers",
        testament: "OT",
        chapters: 36
    },
    {
        id: "deuteronomy",
        name: "Deuteronomy",
        testament: "OT",
        chapters: 34
    },
    {
        id: "joshua",
        name: "Joshua",
        testament: "OT",
        chapters: 24
    },
    {
        id: "judges",
        name: "Judges",
        testament: "OT",
        chapters: 21
    },
    {
        id: "ruth",
        name: "Ruth",
        testament: "OT",
        chapters: 4
    },
    {
        id: "1-samuel",
        name: "1 Samuel",
        testament: "OT",
        chapters: 31
    },
    {
        id: "2-samuel",
        name: "2 Samuel",
        testament: "OT",
        chapters: 24
    },
    {
        id: "1-kings",
        name: "1 Kings",
        testament: "OT",
        chapters: 22
    },
    {
        id: "2-kings",
        name: "2 Kings",
        testament: "OT",
        chapters: 25
    },
    {
        id: "1-chronicles",
        name: "1 Chronicles",
        testament: "OT",
        chapters: 29
    },
    {
        id: "2-chronicles",
        name: "2 Chronicles",
        testament: "OT",
        chapters: 36
    },
    {
        id: "ezra",
        name: "Ezra",
        testament: "OT",
        chapters: 10
    },
    {
        id: "nehemiah",
        name: "Nehemiah",
        testament: "OT",
        chapters: 13
    },
    {
        id: "esther",
        name: "Esther",
        testament: "OT",
        chapters: 10
    },
    {
        id: "job",
        name: "Job",
        testament: "OT",
        chapters: 42
    },
    {
        id: "psalms",
        name: "Psalms",
        testament: "OT",
        chapters: 150
    },
    {
        id: "proverbs",
        name: "Proverbs",
        testament: "OT",
        chapters: 31
    },
    {
        id: "ecclesiastes",
        name: "Ecclesiastes",
        testament: "OT",
        chapters: 12
    },
    {
        id: "song-of-solomon",
        name: "Song of Solomon",
        testament: "OT",
        chapters: 8
    },
    {
        id: "isaiah",
        name: "Isaiah",
        testament: "OT",
        chapters: 66
    },
    {
        id: "jeremiah",
        name: "Jeremiah",
        testament: "OT",
        chapters: 52
    },
    {
        id: "lamentations",
        name: "Lamentations",
        testament: "OT",
        chapters: 5
    },
    {
        id: "ezekiel",
        name: "Ezekiel",
        testament: "OT",
        chapters: 48
    },
    {
        id: "daniel",
        name: "Daniel",
        testament: "OT",
        chapters: 12
    },
    {
        id: "hosea",
        name: "Hosea",
        testament: "OT",
        chapters: 14
    },
    {
        id: "joel",
        name: "Joel",
        testament: "OT",
        chapters: 3
    },
    {
        id: "amos",
        name: "Amos",
        testament: "OT",
        chapters: 9
    },
    {
        id: "obadiah",
        name: "Obadiah",
        testament: "OT",
        chapters: 1
    },
    {
        id: "jonah",
        name: "Jonah",
        testament: "OT",
        chapters: 4
    },
    {
        id: "micah",
        name: "Micah",
        testament: "OT",
        chapters: 7
    },
    {
        id: "nahum",
        name: "Nahum",
        testament: "OT",
        chapters: 3
    },
    {
        id: "habakkuk",
        name: "Habakkuk",
        testament: "OT",
        chapters: 3
    },
    {
        id: "zephaniah",
        name: "Zephaniah",
        testament: "OT",
        chapters: 3
    },
    {
        id: "haggai",
        name: "Haggai",
        testament: "OT",
        chapters: 2
    },
    {
        id: "zechariah",
        name: "Zechariah",
        testament: "OT",
        chapters: 14
    },
    {
        id: "malachi",
        name: "Malachi",
        testament: "OT",
        chapters: 4
    },
    {
        id: "matthew",
        name: "Matthew",
        testament: "NT",
        chapters: 28
    },
    {
        id: "mark",
        name: "Mark",
        testament: "NT",
        chapters: 16
    },
    {
        id: "luke",
        name: "Luke",
        testament: "NT",
        chapters: 24
    },
    {
        id: "john",
        name: "John",
        testament: "NT",
        chapters: 21
    },
    {
        id: "acts",
        name: "Acts",
        testament: "NT",
        chapters: 28
    },
    {
        id: "romans",
        name: "Romans",
        testament: "NT",
        chapters: 16
    },
    {
        id: "1-corinthians",
        name: "1 Corinthians",
        testament: "NT",
        chapters: 16
    },
    {
        id: "2-corinthians",
        name: "2 Corinthians",
        testament: "NT",
        chapters: 13
    },
    {
        id: "galatians",
        name: "Galatians",
        testament: "NT",
        chapters: 6
    },
    {
        id: "ephesians",
        name: "Ephesians",
        testament: "NT",
        chapters: 6
    },
    {
        id: "philippians",
        name: "Philippians",
        testament: "NT",
        chapters: 4
    },
    {
        id: "colossians",
        name: "Colossians",
        testament: "NT",
        chapters: 4
    },
    {
        id: "1-thessalonians",
        name: "1 Thessalonians",
        testament: "NT",
        chapters: 5
    },
    {
        id: "2-thessalonians",
        name: "2 Thessalonians",
        testament: "NT",
        chapters: 3
    },
    {
        id: "1-timothy",
        name: "1 Timothy",
        testament: "NT",
        chapters: 6
    },
    {
        id: "2-timothy",
        name: "2 Timothy",
        testament: "NT",
        chapters: 4
    },
    {
        id: "titus",
        name: "Titus",
        testament: "NT",
        chapters: 3
    },
    {
        id: "philemon",
        name: "Philemon",
        testament: "NT",
        chapters: 1
    },
    {
        id: "hebrews",
        name: "Hebrews",
        testament: "NT",
        chapters: 13
    },
    {
        id: "james",
        name: "James",
        testament: "NT",
        chapters: 5
    },
    {
        id: "1-peter",
        name: "1 Peter",
        testament: "NT",
        chapters: 5
    },
    {
        id: "2-peter",
        name: "2 Peter",
        testament: "NT",
        chapters: 3
    },
    {
        id: "1-john",
        name: "1 John",
        testament: "NT",
        chapters: 5
    },
    {
        id: "2-john",
        name: "2 John",
        testament: "NT",
        chapters: 1
    },
    {
        id: "3-john",
        name: "3 John",
        testament: "NT",
        chapters: 1
    },
    {
        id: "jude",
        name: "Jude",
        testament: "NT",
        chapters: 1
    },
    {
        id: "revelation",
        name: "Revelation",
        testament: "NT",
        chapters: 22
    }
];
function BiblePage() {
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLanguage"])();
    const { toast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$use$2d$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useToast"])();
    const [selectedVersion, setSelectedVersion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        try {
            if ("TURBOPACK compile-time truthy", 1) return "kjv";
            //TURBOPACK unreachable
            ;
            const raw = undefined;
            const parsed = undefined;
            const version = undefined;
        } catch  {
            return "kjv";
        }
    });
    const [selectedBook, setSelectedBook] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        try {
            if ("TURBOPACK compile-time truthy", 1) return "john";
            //TURBOPACK unreachable
            ;
            const raw = undefined;
            const parsed = undefined;
            const book = undefined;
        } catch  {
            return "john";
        }
    });
    const [selectedChapter, setSelectedChapter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        try {
            if ("TURBOPACK compile-time truthy", 1) return 3;
            //TURBOPACK unreachable
            ;
            const raw = undefined;
            const parsed = undefined;
            const book = undefined;
            const currentBook = undefined;
            const maxChapters = undefined;
            const chapter = undefined;
        } catch  {
            return 3;
        }
    });
    const [chapter, setChapter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [booksLoading, setBooksLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [bibleBooks, setBibleBooks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [versionsLoading, setVersionsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [bibleVersions, setBibleVersions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [selectorsOpen, setSelectorsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [highlightedVerse, setHighlightedVerse] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pendingVersion, setPendingVersion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(selectedVersion);
    const [pendingBook, setPendingBook] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(selectedBook);
    const [pendingChapter, setPendingChapter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(selectedChapter);
    const currentBook = bibleBooks.find((book)=>book.id === selectedBook) || FALLBACK_BIBLE_BOOKS.find((book)=>book.id === selectedBook);
    const chapters = currentBook ? Array.from({
        length: currentBook.chapters
    }, (_, i)=>i + 1) : [];
    const displayBooks = bibleBooks.length > 0 ? bibleBooks : FALLBACK_BIBLE_BOOKS;
    const displayVersions = bibleVersions.length > 0 ? bibleVersions : FALLBACK_BIBLE_VERSIONS;
    const getLocalizedName = (book)=>{
        if ((selectedVersion === "rv1909" || selectedVersion === "spnbes") && SPANISH_BOOK_NAMES[book.id]) {
            return SPANISH_BOOK_NAMES[book.id];
        }
        return book.name;
    };
    const getLocalizedNameForVersion = (book, version)=>{
        if ((version === "rv1909" || version === "spnbes") && SPANISH_BOOK_NAMES[book.id]) {
            return SPANISH_BOOK_NAMES[book.id];
        }
        return book.name;
    };
    const fetchTranslations = async ()=>{
        try {
            const response = await fetch(`${API_BASE}/bible/translations`, {
                cache: "no-store"
            });
            if (response.ok) {
                const data = await response.json();
                const apiVersions = Array.isArray(data?.translations) ? data.translations.map((v)=>({
                        id: String(v.id),
                        name: String(v.name ?? v.id),
                        abbreviation: String(v.id ?? "").toUpperCase(),
                        attribution: typeof v.attribution === "string" ? v.attribution : undefined
                    })) : [];
                setBibleVersions(apiVersions);
                const valid = apiVersions.some((v)=>v.id === selectedVersion);
                if (!valid && apiVersions.length > 0) {
                    setSelectedVersion(apiVersions[0].id);
                }
            }
        } catch  {
        // ignore
        } finally{
            setVersionsLoading(false);
        }
    };
    const fetchBooks = async ()=>{
        try {
            const response = await fetch(`${API_BASE}/bible/books`, {
                cache: "no-store"
            });
            if (response.ok) {
                const data = await response.json();
                setBibleBooks(data.books);
                const bookExists = data.books.some((b)=>b.id === selectedBook);
                if (!bookExists && data.books.length > 0) {
                    setSelectedBook(data.books[0].id);
                    setSelectedChapter(1);
                }
            }
        } catch  {
        // ignore
        } finally{
            setBooksLoading(false);
        }
    };
    const fetchChapter = async (bookId, chapterNum, version)=>{
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/bible/chapter?translation=${encodeURIComponent(version)}&book=${encodeURIComponent(bookId)}&chapter=${encodeURIComponent(String(chapterNum))}`, {
                cache: "no-store"
            });
            if (!response.ok) {
                throw new Error("Failed to fetch chapter");
            }
            const data = await response.json();
            if (data.verses) {
                const verses = data.verses.map((verse)=>({
                        number: verse.number,
                        text: verse.text
                    }));
                setChapter({
                    number: chapterNum,
                    verses
                });
            }
        } catch  {
            toast({
                title: t("Error", "Error"),
                description: t("Failed to load chapter", "No se pudo cargar el capítulo"),
                variant: "destructive"
            });
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchBooks();
        fetchTranslations();
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setPendingVersion(selectedVersion);
        setPendingBook(selectedBook);
        setPendingChapter(selectedChapter);
    }, [
        selectedVersion,
        selectedBook,
        selectedChapter
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (selectedBook && selectedChapter) {
            fetchChapter(selectedBook, selectedChapter, selectedVersion);
        }
    }, [
        selectedBook,
        selectedChapter,
        selectedVersion
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!chapter || highlightedVerse == null) return;
        const el = document.getElementById(`verse-${highlightedVerse}`);
        if (!el) return;
        el.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }, [
        chapter,
        highlightedVerse
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            if ("TURBOPACK compile-time truthy", 1) return;
            //TURBOPACK unreachable
            ;
        } catch  {
        // ignore
        }
    }, [
        selectedVersion,
        selectedBook,
        selectedChapter
    ]);
    const handlePreviousChapter = ()=>{
        if (selectedChapter > 1) {
            setHighlightedVerse(null);
            setSelectedChapter(selectedChapter - 1);
        }
    };
    const handleNextChapter = ()=>{
        if (currentBook && selectedChapter < currentBook.chapters) {
            setHighlightedVerse(null);
            setSelectedChapter(selectedChapter + 1);
        }
    };
    const normalizeBookName = (name)=>{
        return name.toLowerCase().replace(/[áÁ]/g, "a").replace(/[éÉ]/g, "e").replace(/[íÍ]/g, "i").replace(/[óÓ]/g, "o").replace(/[úÚüÜ]/g, "u").replace(/[ñÑ]/g, "n").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
    };
    const tryParsePassageQuery = (query)=>{
        const trimmed = query.trim();
        if (!trimmed) return null;
        const match = trimmed.match(/^(.+?)\s+(\d+)(?::(\d+))?$/);
        if (!match) return null;
        const bookPart = match[1].trim();
        const chapterNum = parseInt(match[2], 10);
        const verseNum = match[3] ? parseInt(match[3], 10) : undefined;
        if (!Number.isFinite(chapterNum) || chapterNum < 1) return null;
        if (verseNum != null && (!Number.isFinite(verseNum) || verseNum < 1)) return null;
        const normalizedSearch = normalizeBookName(bookPart);
        const searchMap = new Map();
        displayBooks.forEach((book)=>{
            searchMap.set(normalizeBookName(book.name), book.id);
            const spanishName = SPANISH_BOOK_NAMES[book.id];
            if (spanishName) {
                searchMap.set(normalizeBookName(spanishName), book.id);
            }
        });
        if (searchMap.has(normalizedSearch)) {
            const bookId = searchMap.get(normalizedSearch);
            const found = displayBooks.find((b)=>b.id === bookId);
            if (found) {
                const boundedChapter = Math.min(Math.max(chapterNum, 1), found.chapters);
                return {
                    bookId: found.id,
                    chapter: boundedChapter,
                    verse: verseNum
                };
            }
        }
        for (const [key, bookId] of searchMap.entries()){
            if (key.includes(normalizedSearch) || normalizedSearch.includes(key)) {
                const found = displayBooks.find((b)=>b.id === bookId);
                if (found) {
                    const boundedChapter = Math.min(Math.max(chapterNum, 1), found.chapters);
                    return {
                        bookId: found.id,
                        chapter: boundedChapter,
                        verse: verseNum
                    };
                }
            }
        }
        return null;
    };
    const handleSearch = async ()=>{
        if (!searchQuery.trim()) return;
        const passage = tryParsePassageQuery(searchQuery);
        if (passage) {
            setHighlightedVerse(passage.verse ?? null);
            setSelectedBook(passage.bookId);
            setSelectedChapter(passage.chapter);
            setSelectorsOpen(false);
            return;
        }
        toast({
            title: t("Search", "Búsqueda"),
            description: t("Use a passage format like: John 3:16", "Usa un formato como: Juan 3:16"),
            variant: "destructive"
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "container mx-auto px-4 py-8 pb-24 md:pb-20",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-3xl font-bold text-white mb-2",
                        children: t("Bible", "Biblia")
                    }, void 0, false, {
                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                        lineNumber: 494,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-neutral-400",
                        children: t("Read and explore God's Word", "Lee y explora la Palabra de Dios")
                    }, void 0, false, {
                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                        lineNumber: 495,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                lineNumber: 493,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6 space-y-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                            placeholder: t("Search verses... (e.g., John 3:16)", "Buscar versículos... (ej: Juan 3:16)"),
                            value: searchQuery,
                            onChange: (e)=>setSearchQuery(e.target.value),
                            onKeyDown: (e)=>e.key === "Enter" && handleSearch(),
                            className: "border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500"
                        }, void 0, false, {
                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                            lineNumber: 500,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: handleSearch,
                            disabled: loading,
                            className: "bg-red-600 hover:bg-red-700",
                            type: "button",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                lineNumber: 508,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                            lineNumber: 507,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                    lineNumber: 499,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                lineNumber: 498,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6 flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        onClick: handlePreviousChapter,
                        disabled: selectedChapter <= 1 || loading,
                        variant: "outline",
                        size: "icon",
                        className: "border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700",
                        "aria-label": t("Previous chapter", "Capítulo anterior"),
                        type: "button",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                            lineNumber: 523,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                        lineNumber: 514,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Dialog"], {
                        open: selectorsOpen,
                        onOpenChange: setSelectorsOpen,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogTrigger"], {
                                asChild: true,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    disabled: loading,
                                    className: "text-center px-3 py-2 rounded-md hover:bg-neutral-800/60 transition-colors disabled:opacity-50",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-xl font-semibold text-white",
                                            children: [
                                                getLocalizedName(currentBook || FALLBACK_BIBLE_BOOKS[0]),
                                                " ",
                                                selectedChapter
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                            lineNumber: 533,
                                            columnNumber: 15
                                        }, this),
                                        chapter && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-neutral-400",
                                            children: [
                                                chapter.verses.length,
                                                " ",
                                                t("verses", "versículos")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                            lineNumber: 537,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-neutral-500 mt-1",
                                            children: t("Tap to change", "Toca para cambiar")
                                        }, void 0, false, {
                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                            lineNumber: 539,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                    lineNumber: 528,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                lineNumber: 527,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogContent"], {
                                className: "border-neutral-700 bg-neutral-900 text-white",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogHeader"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DialogTitle"], {
                                            className: "text-white",
                                            children: t("Select passage", "Seleccionar pasaje")
                                        }, void 0, false, {
                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                            lineNumber: 544,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                        lineNumber: 543,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Select"], {
                                                        value: pendingVersion,
                                                        onValueChange: setPendingVersion,
                                                        disabled: versionsLoading,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                className: "w-full border-neutral-700 bg-neutral-800 text-white",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                                    placeholder: t("Version", "Versión")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                                    lineNumber: 551,
                                                                    columnNumber: 21
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                                lineNumber: 550,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                className: "border-neutral-700 bg-neutral-800",
                                                                children: displayVersions.map((version)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                        value: version.id,
                                                                        children: [
                                                                            version.name,
                                                                            " (",
                                                                            version.abbreviation,
                                                                            ")"
                                                                        ]
                                                                    }, version.id, true, {
                                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                                        lineNumber: 555,
                                                                        columnNumber: 23
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                                lineNumber: 553,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                        lineNumber: 549,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Select"], {
                                                        value: pendingBook,
                                                        onValueChange: (value)=>{
                                                            setPendingBook(value);
                                                            setPendingChapter(1);
                                                        },
                                                        disabled: booksLoading,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                className: "w-full border-neutral-700 bg-neutral-800 text-white",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                                    placeholder: t("Book", "Libro")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                                    lineNumber: 571,
                                                                    columnNumber: 21
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                                lineNumber: 570,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                className: "border-neutral-700 bg-neutral-800 max-h-60",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "p-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-xs font-semibold text-neutral-400 mb-2",
                                                                            children: t("Old Testament", "Antiguo Testamento")
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                                            lineNumber: 575,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        displayBooks.filter((book)=>book.testament === "OT").map((book)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                value: book.id,
                                                                                children: getLocalizedNameForVersion(book, pendingVersion)
                                                                            }, book.id, false, {
                                                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                                                lineNumber: 579,
                                                                                columnNumber: 27
                                                                            }, this)),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-xs font-semibold text-neutral-400 mb-2 mt-4",
                                                                            children: t("New Testament", "Nuevo Testamento")
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                                            lineNumber: 583,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        displayBooks.filter((book)=>book.testament === "NT").map((book)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                value: book.id,
                                                                                children: getLocalizedNameForVersion(book, pendingVersion)
                                                                            }, book.id, false, {
                                                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                                                lineNumber: 587,
                                                                                columnNumber: 27
                                                                            }, this))
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                                    lineNumber: 574,
                                                                    columnNumber: 21
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                                lineNumber: 573,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                        lineNumber: 562,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Select"], {
                                                        value: pendingChapter.toString(),
                                                        onValueChange: (value)=>{
                                                            setPendingChapter(parseInt(value, 10));
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                className: "w-full border-neutral-700 bg-neutral-800 text-white",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                                    placeholder: t("Chapter", "Capítulo")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                                    lineNumber: 602,
                                                                    columnNumber: 21
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                                lineNumber: 601,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                className: "border-neutral-700 bg-neutral-800 max-h-60",
                                                                children: chapters.map((ch)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                        value: ch.toString(),
                                                                        children: [
                                                                            t("Chapter", "Capítulo"),
                                                                            " ",
                                                                            ch
                                                                        ]
                                                                    }, ch, true, {
                                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                                        lineNumber: 606,
                                                                        columnNumber: 23
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                                lineNumber: 604,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                        lineNumber: 595,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                lineNumber: 548,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-end pt-2",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                    onClick: ()=>{
                                                        setHighlightedVerse(null);
                                                        setSelectedVersion(pendingVersion);
                                                        setSelectedBook(pendingBook);
                                                        setSelectedChapter(pendingChapter);
                                                        setSelectorsOpen(false);
                                                    },
                                                    className: "bg-red-600 hover:bg-red-700",
                                                    type: "button",
                                                    children: t("Apply", "Aplicar")
                                                }, void 0, false, {
                                                    fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                    lineNumber: 615,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                                lineNumber: 614,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                        lineNumber: 547,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                lineNumber: 542,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                        lineNumber: 526,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        onClick: handleNextChapter,
                        disabled: !currentBook || selectedChapter >= currentBook.chapters || loading,
                        variant: "outline",
                        size: "icon",
                        className: "border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700",
                        "aria-label": t("Next chapter", "Siguiente capítulo"),
                        type: "button",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$lucide$2d$react$40$0$2e$562$2e$0$2b$83d5fd7b249dbeef$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                            lineNumber: 642,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                        lineNumber: 633,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                lineNumber: 513,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4",
                children: Array.from({
                    length: 10
                }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-6 animate-pulse rounded bg-neutral-800/40"
                    }, i, false, {
                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                        lineNumber: 649,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                lineNumber: 647,
                columnNumber: 9
            }, this) : chapter ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3",
                children: chapter.verses.map((verse)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: `verse-${verse.number}`,
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$next$2d$app$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("rounded-xl border border-transparent p-3", highlightedVerse === verse.number && "border-red-500 bg-red-950/30"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "mr-2 text-sm font-semibold text-red-400",
                                children: verse.number
                            }, void 0, false, {
                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                lineNumber: 663,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-neutral-200",
                                children: verse.text
                            }, void 0, false, {
                                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                                lineNumber: 664,
                                columnNumber: 15
                            }, this)
                        ]
                    }, verse.number, true, {
                        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                        lineNumber: 655,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                lineNumber: 653,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Library$2f$Mobile__Documents$2f$com$7e$apple$7e$CloudDocs$2f$Church$2d$Sites$2f$centro$2d$de$2d$nueva$2d$esperanza$2f$node_modules$2f2e$bun$2f$next$40$16$2e$1$2e$4$2b$67f6792bdf102c28$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-neutral-400",
                children: t("No chapter loaded.", "No se cargó el capítulo.")
            }, void 0, false, {
                fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
                lineNumber: 669,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Library/Mobile Documents/com~apple~CloudDocs/Church-Sites/centro-de-nueva-esperanza/next-app/components/pages/BiblePage.tsx",
        lineNumber: 492,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=48481_Church-Sites_centro-de-nueva-esperanza_next-app_components_4788bd26._.js.map