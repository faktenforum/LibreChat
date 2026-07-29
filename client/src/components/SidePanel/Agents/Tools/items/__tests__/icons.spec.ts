import type { AgentItem } from '../types';
import { makePlugin, makeSkill, makeMcpServer, makeAction } from 'test/itemFactories';
import { getIconForItem } from '../icons';

describe('getIconForItem', () => {
  test('returns icon + color for built-in execute_code', () => {
    const item: AgentItem = {
      kind: 'builtin',
      id: 'execute_code',
      name: 'Code',
      description: '',
      iconKey: 'execute_code',
    };
    const result = getIconForItem(item);
    expect(result.Icon).toBeDefined();
    expect(result.colorClass).toMatch(/emerald|green/);
  });

  test('returns the Brain icon + indigo color for built-in memory', () => {
    const item: AgentItem = {
      kind: 'builtin',
      id: 'memory',
      name: 'Memory',
      description: '',
      iconKey: 'memory',
    };
    const result = getIconForItem(item);
    expect(result.Icon).toBeDefined();
    expect(result.colorClass).toMatch(/indigo/);
  });

  test('returns a distinct color class per kind', () => {
    const items: AgentItem[] = [
      {
        kind: 'tool',
        id: 'x',
        name: 'x',
        description: '',
        iconKey: 'fallback',
        plugin: makePlugin(),
      },
      {
        kind: 'mcp',
        id: 'x',
        name: 'x',
        description: '',
        iconKey: 'fallback',
        server: makeMcpServer(),
        toolCount: 0,
      },
      {
        kind: 'skill',
        id: 'x',
        name: 'x',
        description: '',
        iconKey: 'fallback',
        skill: makeSkill(),
      },
      {
        kind: 'action',
        id: 'x',
        name: 'x',
        description: '',
        iconKey: 'fallback',
        action: makeAction(),
        endpointCount: 0,
      },
    ];
    const colors = items.map((item) => getIconForItem(item).colorClass);
    expect(new Set(colors).size).toBe(items.length);
  });

  test('falls back to a generic icon for an unmapped built-in iconKey', () => {
    const item: AgentItem = {
      kind: 'builtin',
      id: 'execute_code',
      name: 'X',
      description: '',
      iconKey: 'unknown_capability',
    };
    const result = getIconForItem(item);
    expect(result.Icon).toBeDefined();
  });

  describe('items carrying their own icon', () => {
    const mcpItem = (id: string, icon?: string): AgentItem => ({
      kind: 'mcp',
      id,
      name: id,
      description: '',
      iconKey: 'fallback',
      server: makeMcpServer({ metadata: makePlugin({ name: id, pluginKey: id, icon }) }),
      toolCount: 0,
    });

    test('an SVG glyph is tinted and gets an accent colour, not the kind colour', () => {
      const plain = getIconForItem(mcpItem('wikipedia'));
      const withIcon = getIconForItem(mcpItem('wikipedia', '/images/mcp-wikipedia-icon.svg'));

      expect(withIcon.tintIcon).toBe(true);
      expect(withIcon.iconUrl).toBe('/images/mcp-wikipedia-icon.svg');
      /** The point of the change: it no longer looks like every other MCP server. */
      expect(withIcon.colorClass).not.toBe(plain.colorClass);
      expect(withIcon.colorClass).toMatch(/^bg-[a-z]+-500\/15 text-/);
    });

    test('a raster logo keeps its own pixels', () => {
      const result = getIconForItem(mcpItem('brand', 'https://example.com/logo.png'));
      expect(result.iconUrl).toBe('https://example.com/logo.png');
      expect(result.tintIcon).toBeFalsy();
    });

    test('an inline SVG data URI is tinted', () => {
      const result = getIconForItem(mcpItem('inline', 'data:image/svg+xml;base64,PHN2Zy8+'));
      expect(result.tintIcon).toBe(true);
    });

    test('a query string does not hide the .svg extension', () => {
      const result = getIconForItem(mcpItem('cached', '/images/x.svg?v=2'));
      expect(result.tintIcon).toBe(true);
    });

    test('the colour is stable per id and varies across ids', () => {
      const icon = '/images/mcp-x-icon.svg';
      expect(getIconForItem(mcpItem('github', icon)).colorClass).toBe(
        getIconForItem(mcpItem('github', icon)).colorClass,
      );
      const names = ['github', 'linux', 'docs', 'wikipedia', 'npm-search', 'stackoverflow'];
      const colours = new Set(names.map((n) => getIconForItem(mcpItem(n, icon)).colorClass));
      /** Hashing can collide; the guarantee is variety, not a perfect spread. */
      expect(colours.size).toBeGreaterThan(1);
    });

    test('no icon leaves the kind fallback untouched', () => {
      const result = getIconForItem(mcpItem('plain'));
      expect(result.iconUrl).toBeUndefined();
      expect(result.tintIcon).toBeUndefined();
      expect(result.colorClass).toMatch(/violet/);
    });
  });
});
