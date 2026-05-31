// -----------------------------------------------------------------------------
// Inlined shared types — keeps the server self-contained during build.
// The canonical source remains packages/types (used by the web app).
// -----------------------------------------------------------------------------

// -- User ------------------------------------------------------------------
export interface User {
  id: string
  email: string
  avatarUrl: string | null
  createdAt: Date
}

export type PublicUser = Omit<User, 'createdAt'>

export interface UserSession {
  userId: string
  email: string
  iat: number
  exp: number
}

// -- Snippet --------------------------------------------------------------
export const SUPPORTED_LANGUAGES = [
  'typescript',
  'javascript',
  'javafxscript',
  'java',
  'python',
  'go',
  'rust',
  'swift',
  'sql',
  'dart',
  'hack',
  'r',
  'bash',
  'json',
  'jscript',
  'jython',
  'yaml',
  'markdown',
  'plaintext',
  'c++',
  'c#',
  'php',
  'html',
  'actionscript',
  'angelscript',
  'chip-8',
  'coffeescript',
  'cython',  
  'emerald',
  'euphoria',
  'f#',
  'gml',
  'gdscript',
  'hypertalk',
  'hermes',
  'idris',
  'io',
  'krypton',
  'kornshell',
  'livecode',
  'livescript',
  'lucid',
  'maxscript',
  'microcode',
  'microsoft power fx',
  'mimic',
  'modula',
  'modula-2',
  'modula-3',
  'mouse',
  'mumps',
  'mystic programming language',
  'nasm',
  'neko',
  'net.data',
  'netlogo',
  'netrexx',
  'newspeak',
  'newtonscript',
  'nix',
  'nord programming language',
  'not exactly c',
  'not quite c',
  'nwscript',
  'oberon',
  'obj2',
  'objectlogo',
  'obliq',
  'ocaml',
  'occam',
  'octave',
  'opa',
  'opal',
  'open programming language',
  'opencl',
  'openedge advanced business language',
  'openqasm',
  'ops5',
  'optimj',
  'oriel',
  'oxygene',
  'p4',
  'parasail',
  'pari/gp',
  'pascal',
  'pascal script',
  'pearl',
  'perl',
  'php',
  'pico',
  'picolisp',
  'pharo',
  'pict',
  'pipelines',
  'pizza',
  'pdl',
  'pcf',
  'pl-11',
  'pl/0',
  'pl/b',
  'pl/c',
  'pl/i',
  'pl/m',
  'pl/p',
  'pl/s',
  'pl/sql',
  'q',
  'q#',
  'qalb',
  '.ql',
  'qpl',
  'qtscript',
  'quakec',
  'quantum computing language',
  'racket',
  'raku',
  'rapid',
  'ratfiv',
  'ratfor',
  'reason',
  'rebol',
  'red',
  'redcode',
  'rescript',
  'rexx',
  'rpg',
  'rpl',
  'rsl',
  'ruby',
  's',
  's-lang',
  's-plus',
  'sabretalk',
  'sail',
  'sas',
  'sasl',
  'sather',
  'sawzall',
  'sbl',
  'scheme',
  'scilab',
  'scratch',
  'scratchjr',
  'script.net',
  'sed',
  'seed7',
  'self',
  'sequencel',
  'serpent',
  'setl',
  'short code',
  'signal',
  'simple',
  'simpol',
  'simscript',
  'simula',
  'simulink'
] as const

export type Language = (typeof SUPPORTED_LANGUAGES)[number]

export type CollaboratorRole = 'Editor' | 'Viewer'

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Collaborator {
  userId: string
  snippetId: string
  role: CollaboratorRole
  user: Pick<User, 'id' | 'email' | 'avatarUrl'>
}

export interface Folder {
  id: string
  name: string
  userId: string
}

export interface Snippet {
  id: string
  title: string
  content: string
  language: Language
  ownerId: string
  folderId: string | null
  createdAt: Date
  updatedAt: Date
  tags: Tag[]
  collaborators: Collaborator[]
  owner: Pick<User, 'id' | 'email' | 'avatarUrl'>
}

export type SnippetSummary = Pick<
  Snippet,
  'id' | 'title' | 'content' | 'language' | 'ownerId' | 'createdAt' | 'updatedAt' | 'tags'
>

export interface SnippetCommit {
  id: string
  message: string
  content: string
  originalContent: string
  createdAt: Date
  snippetId: string
  authorId: string
  author: Pick<User, 'id' | 'email' | 'avatarUrl'>
}

export interface CreateCommitInput {
  message: string
  content: string
  originalContent: string
}

export interface CreateSnippetInput {
  title: string
  content: string
  language: Language
  folderId?: string
  tagIds?: string[]
}

export interface UpdateSnippetInput {
  title?: string
  content?: string
  language?: Language
  folderId?: string | null
  tagIds?: string[]
}

// -- Collaboration ---------------------------------------------------------
export interface CursorPosition {
  lineNumber: number
  column: number
}

/** Assigned per-peer so each cursor renders a distinct color in the editor */
export const PEER_COLORS = [
  '#a78bfa', // purple
  '#4dc9ff', // blue
  '#ffca3a', // yellow
  '#ff6b6b', // red
  '#34d399', // green
  '#f472b6', // pink
] as const

export type PeerColor = (typeof PEER_COLORS)[number]

export interface PeerState {
  userId: string
  user: PublicUser
  cursor: CursorPosition | null
  color: PeerColor
  /** ISO string */
  joinedAt: string
}

export interface ContentDelta {
  /** Yjs update encoded as base64 */
  update: string
  origin: string
}

// -- Socket events ---------------------------------------------------------
export interface ClientToServerEvents {
  'snippet:join':   (snippetId: string, hasDoc?: boolean) => void
  'snippet:leave':  (snippetId: string) => void
  'snippet:delta':  (snippetId: string, delta: ContentDelta) => void
  'cursor:move':    (snippetId: string, position: CursorPosition) => void
}

export interface ServerToClientEvents {
  'snippet:load':   (updateBase64: string) => void
  'snippet:delta':  (delta: ContentDelta) => void
  'peers:update':   (peers: PeerState[]) => void
  'cursor:update':  (userId: string, position: CursorPosition | null) => void
  'error':          (message: string) => void
}

export interface SocketData {
  userId: string
  snippetId: string | null
}

// -- API responses ---------------------------------------------------------
export interface ApiSuccess<T> {
  ok: true
  data: T
}

export interface ApiError {
  ok: false
  error: string
  code?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
