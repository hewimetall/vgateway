export const mermaidConfig = Object.freeze({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    fontSize: '28px',
    fontFamily: 'Inter, system-ui, sans-serif'
  }
});

export const revealConfig = Object.freeze({
  hash: true,
  slideNumber: 'c/t',
  controls: true,
  progress: true,
  center: false,
  width: 1440,
  height: 810,
  margin: 0.04
});

export function requireDeckDependency(name, dependency, methods) {
  if (!dependency) {
    throw new Error(`MCP Gateway deck requires ${name} to be loaded before initialization.`);
  }

  const missingMethod = methods.find((method) => typeof dependency[method] !== 'function');
  if (missingMethod) {
    throw new Error(`MCP Gateway deck requires ${name}.${missingMethod} to be a function.`);
  }

  return dependency;
}

export function createRevealConfig(revealHighlight = globalThis.RevealHighlight) {
  return {
    ...revealConfig,
    plugins: revealHighlight ? [revealHighlight] : []
  };
}

export async function initializeDeck({
  mermaid = globalThis.mermaid,
  reveal = globalThis.Reveal,
  revealHighlight = globalThis.RevealHighlight,
  mermaidSelector = '.mermaid'
} = {}) {
  const mermaidApi = requireDeckDependency('mermaid', mermaid, ['initialize', 'run']);
  const revealApi = requireDeckDependency('Reveal', reveal, ['initialize']);

  mermaidApi.initialize(mermaidConfig);
  const deck = await revealApi.initialize(createRevealConfig(revealHighlight));
  await mermaidApi.run({ querySelector: mermaidSelector });

  return deck;
}
