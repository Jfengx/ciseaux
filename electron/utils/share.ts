export const isImage = /\.(jpg|jpeg|png|webp)$/i

export const clamp = (...[v, min, max]: number[]) =>
  Math.min(max, Math.max(min, v))
