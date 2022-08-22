export const clamp = (...[v, min, max]: number[]) =>
  Math.min(max, Math.max(min, v))

export const isImage = /\.(jpg|jpeg|png|webp)$/i

export const isVideo = /\.(flv|mp4|mov|avi)$/i

export const imgRange = {
  ratio: [0, 1],
  quality: [10, 100],
}

export const videoRange = {
  ratio: [0, 1],
  bitRate: [100, 100000],
  fps: [12, 120],
}
