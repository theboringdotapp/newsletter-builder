module.exports = {

"[project]/.next-internal/server/app/api/links/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/src/lib/github.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "GitHubStorage": (()=>GitHubStorage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$octokit$2f$rest$2f$dist$2d$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@octokit/rest/dist-src/index.js [app-route] (ecmascript)");
;
class GitHubStorage {
    octokit;
    owner;
    repo;
    branch;
    constructor(){
        this.octokit = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$octokit$2f$rest$2f$dist$2d$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Octokit"]({
            auth: process.env.GITHUB_TOKEN
        });
        this.owner = process.env.GITHUB_OWNER;
        this.repo = process.env.GITHUB_REPO;
        this.branch = process.env.GITHUB_BRANCH || "main";
    }
    async saveLink(link) {
        const path = `links/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/links.json`;
        try {
            // Get existing links
            const existingLinks = await this.getLinks();
            const updatedLinks = [
                ...existingLinks,
                link
            ];
            await this.saveFile(path, JSON.stringify(updatedLinks, null, 2));
        } catch (error) {
            console.error("Error saving link:", error);
            throw error;
        }
    }
    async getLinks(year, month) {
        const currentYear = year || new Date().getFullYear();
        const currentMonth = month || new Date().getMonth() + 1;
        const path = `links/${currentYear}/${String(currentMonth).padStart(2, "0")}/links.json`;
        try {
            const content = await this.getFile(path);
            return content ? JSON.parse(content) : [];
        } catch  {
            console.log("No existing links file found, returning empty array");
            return [];
        }
    }
    async updateLinks(links, year, month) {
        const currentYear = year || new Date().getFullYear();
        const currentMonth = month || new Date().getMonth() + 1;
        const path = `links/${currentYear}/${String(currentMonth).padStart(2, "0")}/links.json`;
        await this.saveFile(path, JSON.stringify(links, null, 2));
    }
    async saveNewsletterData(data) {
        const path = `newsletters/${data.week}/newsletter.json`;
        await this.saveFile(path, JSON.stringify(data, null, 2));
    }
    async getNewsletterData(week) {
        const path = `newsletters/${week}/newsletter.json`;
        try {
            const content = await this.getFile(path);
            return content ? JSON.parse(content) : null;
        } catch  {
            return null;
        }
    }
    async getFile(path) {
        try {
            const response = await this.octokit.repos.getContent({
                owner: this.owner,
                repo: this.repo,
                path,
                ref: this.branch
            });
            if ("content" in response.data) {
                return Buffer.from(response.data.content, "base64").toString("utf-8");
            }
            return null;
        } catch (error) {
            if (error && typeof error === "object" && "status" in error && error.status === 404) {
                return null;
            }
            throw error;
        }
    }
    async saveFile(path, content) {
        try {
            // Check if file exists to get SHA
            let sha;
            try {
                const existingFile = await this.octokit.repos.getContent({
                    owner: this.owner,
                    repo: this.repo,
                    path,
                    ref: this.branch
                });
                if ("sha" in existingFile.data) {
                    sha = existingFile.data.sha;
                }
            } catch (error) {
                // File doesn't exist, that's fine
                if (!(error && typeof error === "object" && "status" in error && error.status === 404)) {
                    throw error;
                }
            }
            await this.octokit.repos.createOrUpdateFileContents({
                owner: this.owner,
                repo: this.repo,
                path,
                message: `Update ${path}`,
                content: Buffer.from(content).toString("base64"),
                branch: this.branch,
                sha
            });
        } catch (error) {
            console.error("Error saving file:", error);
            throw error;
        }
    }
}
}}),
"[project]/src/app/api/links/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "GET": (()=>GET),
    "POST": (()=>POST),
    "PUT": (()=>PUT)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/github.ts [app-route] (ecmascript)");
;
;
const github = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GitHubStorage"]();
async function GET() {
    try {
        const links = await github.getLinks();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(links);
    } catch (error) {
        console.error("Error fetching links:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch links"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const link = await request.json();
        await github.saveLink(link);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
        });
    } catch (error) {
        console.error("Error saving link:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to save link"
        }, {
            status: 500
        });
    }
}
async function PUT(request) {
    try {
        const links = await request.json();
        await github.updateLinks(links);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
        });
    } catch (error) {
        console.error("Error updating links:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to update links"
        }, {
            status: 500
        });
    }
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__26b5bdf4._.js.map