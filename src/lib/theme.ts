export function buildThemeCss(primary: string, accent: string): string {
  const light = `
:root {
  --primary: ${primary};
  --primary-foreground: #ffffff;
  --primary-hover: color-mix(in srgb, ${primary} 92%, white);
  --primary-active: color-mix(in srgb, ${primary} 85%, black);
  --accent: ${accent};
  --accent-foreground: #ffffff;
  --accent-hover: color-mix(in srgb, ${accent} 92%, white);
  --accent-active: color-mix(in srgb, ${accent} 85%, black);
}
:root.dark {
  --primary: color-mix(in srgb, ${primary} 78%, white);
  --primary-foreground: #ffffff;
  --primary-hover: color-mix(in srgb, ${primary} 85%, white);
  --primary-active: color-mix(in srgb, ${primary} 70%, white);
  --accent: color-mix(in srgb, ${accent} 78%, white);
  --accent-foreground: #ffffff;
  --accent-hover: color-mix(in srgb, ${accent} 85%, white);
  --accent-active: color-mix(in srgb, ${accent} 70%, white);
}`;
  return light.trim();
}
