export const CLOSET_COLORS: Record<string, string> = {
  Black:     '#2c2a2b',
  White:     '#f6f2ea',
  Cream:     '#ece1cb',
  Beige:     '#dccbb0',
  Camel:     '#c39c6f',
  Blush:     '#e7c3bf',
  Rose:      '#cf8f93',
  Burgundy:  '#7c3b45',
  Brown:     '#6f5039',
  Mustard:   '#cda23f',
  Sage:      '#a7b79e',
  Olive:     '#878a58',
  Navy:      '#33405a',
  Denim:     '#6c88a6',
  Sky:       '#b7cfe0',
  Lavender:  '#c1b2d6',
  Pink:      '#e3a6c0',
  Grey:      '#b1ada9',
  Charcoal:  '#403e43',
  Multi:     'conic',
}

export function colorHex(name: string): string {
  return CLOSET_COLORS[name] ?? '#cdbfb0'
}
