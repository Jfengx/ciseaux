export const clamp = (...[v, min, max]: number[]) =>
  Math.min(max, Math.max(min, v))

export const isImage = /\.(jpg|jpeg|png|webp)$/i

export const isVideo = /\.(flv|mp4|mov|avi)$/i
