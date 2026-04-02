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
  'simula',]
  'simulink',
    //CONTINUE HERE
  
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
  user: Pick<import('./user').User, 'id' | 'email' | 'avatarUrl'>
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
  owner: Pick<import('./user').User, 'id' | 'email' | 'avatarUrl'>
}

export type SnippetSummary = Pick<
  Snippet,
  'id' | 'title' | 'language' | 'ownerId' | 'createdAt' | 'updatedAt' | 'tags'
>

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
