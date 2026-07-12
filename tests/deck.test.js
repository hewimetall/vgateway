import { readFile } from 'node:fs/promises';
import { describe, expect, it, vi } from 'vitest';

import {
  createRevealConfig,
  initializeDeck,
  mermaidConfig,
  requireDeckDependency,
  revealConfig
} from '../src/deck.js';

describe('deck configuration', () => {
  it('defines Mermaid and Reveal options used by the presentation', () => {
    expect(mermaidConfig).toEqual({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        fontSize: '28px',
        fontFamily: 'Inter, system-ui, sans-serif'
      }
    });
    expect(revealConfig).toMatchObject({
      hash: true,
      slideNumber: 'c/t',
      controls: true,
      progress: true,
      center: false,
      width: 1440,
      height: 810,
      margin: 0.04
    });
  });

  it('adds the Highlight plugin only when it is available', () => {
    const plugin = { id: 'highlight' };

    expect(createRevealConfig(plugin)).toMatchObject({
      ...revealConfig,
      plugins: [plugin]
    });
    expect(createRevealConfig(null)).toMatchObject({
      ...revealConfig,
      plugins: []
    });
  });
});

describe('initializeDeck', () => {
  it('initializes Reveal before rendering Mermaid diagrams', async () => {
    const deck = { id: 'deck' };
    const highlightPlugin = { id: 'highlight' };
    const mermaid = {
      initialize: vi.fn(),
      run: vi.fn().mockResolvedValue(undefined)
    };
    const reveal = {
      initialize: vi.fn().mockResolvedValue(deck)
    };

    await expect(initializeDeck({
      mermaid,
      reveal,
      revealHighlight: highlightPlugin
    })).resolves.toBe(deck);

    expect(mermaid.initialize).toHaveBeenCalledWith(mermaidConfig);
    expect(reveal.initialize).toHaveBeenCalledWith({
      ...revealConfig,
      plugins: [highlightPlugin]
    });
    expect(mermaid.run).toHaveBeenCalledWith({ querySelector: '.mermaid' });
    expect(reveal.initialize.mock.invocationCallOrder[0]).toBeLessThan(
      mermaid.run.mock.invocationCallOrder[0]
    );
  });

  it('supports synchronous Reveal initialization and custom diagram selectors', async () => {
    const deck = { id: 'sync-deck' };
    const mermaid = {
      initialize: vi.fn(),
      run: vi.fn()
    };
    const reveal = {
      initialize: vi.fn(() => deck)
    };

    await expect(initializeDeck({
      mermaid,
      reveal,
      revealHighlight: null,
      mermaidSelector: '[data-diagram]'
    })).resolves.toBe(deck);

    expect(reveal.initialize).toHaveBeenCalledWith({
      ...revealConfig,
      plugins: []
    });
    expect(mermaid.run).toHaveBeenCalledWith({ querySelector: '[data-diagram]' });
  });

  it('fails clearly when required browser dependencies are missing', async () => {
    await expect(initializeDeck({
      mermaid: null,
      reveal: { initialize: vi.fn() }
    })).rejects.toThrow('mermaid');
    await expect(initializeDeck({
      mermaid: { initialize: vi.fn(), run: vi.fn() },
      reveal: null
    })).rejects.toThrow('Reveal');
  });

  it('fails clearly when a dependency does not expose the expected API', () => {
    expect(() => requireDeckDependency('mermaid', {}, ['initialize', 'run']))
      .toThrow('mermaid.initialize');
    expect(() => requireDeckDependency('Reveal', { initialize: vi.fn() }, ['initialize']))
      .not.toThrow();
  });
});

describe('index.html integration', () => {
  it('pins current compatible browser dependencies and loads the deck module', async () => {
    const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

    expect(html).toContain('reveal.js@6.0.1');
    expect(html).toContain('mermaid@11.16.0');
    expect(html).toContain('bootstrap-icons@1.13.1');
    expect(html).toContain("import { initializeDeck } from './src/deck.js';");
    expect(html).toContain('initializeDeck();');
  });

  it('keeps the presentation content and diagram placeholders intact', async () => {
    const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
    const slideCount = html.match(/<section>/g)?.length ?? 0;
    const mermaidDiagramCount = html.match(/class="mermaid"/g)?.length ?? 0;

    expect(slideCount).toBeGreaterThanOrEqual(20);
    expect(mermaidDiagramCount).toBe(3);
    expect(html).toContain('MCP Gateway');
  });
});
