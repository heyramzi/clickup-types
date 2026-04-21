export type EnvVar = {
  required?: boolean;
  description?: string;
  default?: string;
};

export type ArgDef = {
  position: number;
  required?: boolean;
  description?: string;
};

export type FlagDef = {
  type: "string" | "number" | "boolean";
  default?: unknown;
  description?: string;
};

export type ListOpts = {
  totalCount?: number;
  truncate?: Record<string, number>;
  resourceName?: string;
};

export type CommandContext = {
  output: (data: Record<string, unknown>, fields?: string[]) => void;
  list: (items: Record<string, unknown>[], fields?: string[], opts?: ListOpts) => void;
  empty: (message: string) => void;
  error: (message: string, details?: Record<string, unknown>[]) => void;
  status: (message: string) => void;
  next: (suggestions: string[]) => void;
  raw: (text: string) => void;
};

export type CommandInput = {
  args: Record<string, string>;
  flags: Record<string, unknown>;
};

export type CommandParams = CommandInput & {
  ctx: CommandContext;
};

export type Command = {
  description: string;
  args?: Record<string, ArgDef>;
  flags?: Record<string, FlagDef>;
  run: (params: CommandParams) => Promise<void>;
  next?: (params: CommandInput) => string[];
};

export type CLIConfig = {
  name: string;
  bin: string;
  description: string;
  env?: Record<string, EnvVar>;
  home?: (ctx: CommandContext) => Promise<void>;
  defaultCommand?: string;
  commands: Record<string, Command>;
};

export type OutputMode = "toon" | "json" | "human";
