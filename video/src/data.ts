/** Every name and line of copy in the film. All of it is made up. */

export type Status = "done" | "input" | "working" | null;

export interface Project {
  id: string;
  name: string;
  mono: string;
  bg: string;
  fg: string;
  path: string;
  host: string;
}

export const PROJECTS: Record<string, Project> = {
  northwind: { id: "northwind", name: "northwind", mono: "NW", bg: "#12324a", fg: "#86d3ff", path: "~/code/northwind", host: "MacBook Pro" },
  tundra: { id: "tundra", name: "tundra-cli", mono: "TC", bg: "#0f3a37", fg: "#7fe3cf", path: "~/code/tundra-cli", host: "MacBook Pro" },
  lumen: { id: "lumen", name: "lumen-maps", mono: "LM", bg: "#2c2350", fg: "#b9a8ff", path: "/srv/lumen-maps", host: "Studio" },
  driftwood: { id: "driftwood", name: "driftwood", mono: "DW", bg: "#3d2e14", fg: "#f2c46d", path: "~/code/driftwood", host: "MacBook Pro" },
  kestrel: { id: "kestrel", name: "kestrel-app", mono: "KA", bg: "#43202c", fg: "#ff9db5", path: "~/code/kestrel-app", host: "MacBook Pro" },
};

export interface Thread {
  project: string;
  title: string;
  branch: string;
  age: string;
  status: Status;
  prs?: string;
  pinned?: boolean;
  current?: boolean;
}

export const DRAFTS: Thread[] = [
  { project: "lumen", title: "Try a skeleton loader for search", branch: "", age: "", status: null },
  { project: "driftwood", title: "Pagination for the orders table", branch: "", age: "", status: null },
  { project: "northwind", title: "Investigate memory spike on export", branch: "", age: "", status: null },
];

export const PINNED: Thread[] = [
  { project: "kestrel", title: "Weekly release checklist", branch: "main", age: "3d", status: null, pinned: true },
  { project: "northwind", title: "Infra cost review", branch: "ops/cost-review", age: "6d", status: null, pinned: true },
];

export const ACTIVE: Thread[] = [
  { project: "northwind", title: "Add offline sync queue", branch: "feat/offline-sync", age: "2h", status: "done", prs: "+8" },
  { project: "tundra", title: "Rate limit the upload API", branch: "fix/upload-limits", age: "5h", status: "input" },
  { project: "lumen", title: "Dark mode token cleanup", branch: "chore/dark-tokens", age: "1d", status: null },
];

export const WORKING: Thread[] = [
  { project: "kestrel", title: "Stream search results", branch: "feat/stream-search", age: "12m", status: "working", current: true },
];

export const SETTLED_COUNT = 48;

export const CHAT = {
  project: "kestrel",
  title: "Stream search results",
  user: "Make search results stream in as they arrive instead of waiting for the full list.",
  work: "Read 5 files, edited 2",
  lead: ["Done. Search now ", "streams results as they arrive", ", so the first matches show in about 80ms."],
  bullets: [
    ["Batches:", "results render 20 at a time."],
    ["Cancel:", "typing again aborts the old request."],
    ["Empty state:", "shows once the stream ends with no matches."],
  ],
  code: "for await (const batch of search(query)) render(batch);",
  model: "Opus 5.5 High",
  placeholder: "Ask anything. @ files, $ skills, / commands",
  host: "MacBook Pro",
};

export const SETTINGS = [
  { title: "Project grouping", body: "Combine matching repositories across environments.", on: true },
  { title: "Working section", body: "Fold working threads into a Working section.", on: true },
  { title: "Delete confirmation", body: "Ask before deleting a thread and its chat history.", on: false },
];

export const LABELS = {
  open: "T3 Code",
  chats: "Chats",
  status: "Status",
  drafts: "Drafts",
  pinned: "Pinned",
  chat: "Chat",
  composer: "Composer",
  newchat: "New chat",
  palette: "Projects",
  settings: "Settings",
  reveal: "Hyperborea",
};

export const TITLE = {
  from: "T3 Code",
  name: "Hyperborea",
  line: "A northern-lights theme for T3 Code.",
  byline: "by @nicolasdmolina0",
};
