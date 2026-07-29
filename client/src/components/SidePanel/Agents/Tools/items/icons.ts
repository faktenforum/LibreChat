import {
  Code,
  MessageCircleQuestion,
  Globe,
  Eye,
  Brain,
  Sparkles,
  FileText,
  FileSearch,
  Wrench,
  Server,
  Workflow,
  Zap,
  Layers,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AgentItem } from './types';

export interface ItemIcon {
  Icon: LucideIcon;
  colorClass: string;
  iconUrl?: string;
  /**
   * True when `iconUrl` is a single-colour SVG glyph, so it can be rendered as a mask and
   * take the accent colour from `colorClass` - the same look the builtins have. Raster or
   * multi-colour logos must keep their own colours and stay a plain image.
   */
  tintIcon?: boolean;
}

const BUILTIN_ICONS: Record<string, ItemIcon> = {
  execute_code: {
    Icon: Code,
    colorClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  },
  web_search: {
    Icon: Globe,
    colorClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-300',
  },
  artifacts: {
    Icon: Sparkles,
    colorClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-300',
  },
  context: {
    Icon: FileText,
    colorClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  },
  file_search: {
    Icon: FileSearch,
    colorClass: 'bg-pink-500/15 text-pink-600 dark:text-pink-300',
  },
  memory: {
    Icon: Brain,
    colorClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300',
  },
  vision: {
    Icon: Eye,
    colorClass: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300',
  },
  ask_user_question: {
    Icon: MessageCircleQuestion,
    colorClass: 'bg-teal-500/15 text-teal-600 dark:text-teal-300',
  },
};

const KIND_FALLBACK_ICONS: Record<AgentItem['kind'], ItemIcon> = {
  builtin: {
    Icon: Layers,
    colorClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  },
  tool: {
    Icon: Wrench,
    colorClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-300',
  },
  mcp: {
    Icon: Server,
    colorClass: 'bg-violet-500/15 text-violet-600 dark:text-violet-300',
  },
  skill: {
    Icon: Zap,
    colorClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  },
  action: {
    Icon: Workflow,
    colorClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-300',
  },
};

/**
 * Accent palette for items that bring their own glyph (MCP servers, plugins). The builtins
 * each have a hand-picked colour; these are assigned from the same set by hashing the item
 * id, so every server gets a stable, distinct colour without per-server configuration.
 */
const ACCENT_CLASSES = [
  'bg-blue-500/15 text-blue-600 dark:text-blue-300',
  'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  'bg-violet-500/15 text-violet-600 dark:text-violet-300',
  'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  'bg-pink-500/15 text-pink-600 dark:text-pink-300',
  'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300',
  'bg-rose-500/15 text-rose-600 dark:text-rose-300',
  'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300',
  'bg-teal-500/15 text-teal-600 dark:text-teal-300',
  'bg-orange-500/15 text-orange-600 dark:text-orange-300',
];

/** Stable, order-independent hash so a server keeps its colour across reloads and configs. */
function accentFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return ACCENT_CLASSES[Math.abs(hash) % ACCENT_CLASSES.length];
}

/** Only SVG glyphs are safe to recolour via a mask; anything else keeps its own pixels. */
function isSvgIcon(url: string): boolean {
  const withoutQuery = url.split(/[?#]/)[0].toLowerCase();
  return withoutQuery.endsWith('.svg') || url.startsWith('data:image/svg+xml');
}

function extractIconUrl(item: AgentItem): string | undefined {
  if (item.kind === 'tool') {
    const url = item.plugin?.icon;
    return typeof url === 'string' && url.length > 0 ? url : undefined;
  }
  if (item.kind === 'mcp') {
    const url = item.server?.metadata?.icon;
    return typeof url === 'string' && url.length > 0 ? url : undefined;
  }
  return undefined;
}

export function getIconForItem(item: AgentItem): ItemIcon {
  if (item.kind === 'builtin') {
    return BUILTIN_ICONS[item.iconKey] ?? KIND_FALLBACK_ICONS.builtin;
  }
  const base = KIND_FALLBACK_ICONS[item.kind];
  const iconUrl = extractIconUrl(item);
  if (!iconUrl) {
    return base;
  }
  /* A configured glyph replaces the kind's fallback icon, but the kind's single colour would
   * make every server look alike. Give it an accent from the shared palette instead, and
   * tint the glyph itself when it is an SVG so the result matches the builtins. */
  return {
    ...base,
    iconUrl,
    colorClass: accentFor(item.id),
    tintIcon: isSvgIcon(iconUrl),
  };
}
