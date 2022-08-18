import Sharp from 'sharp'
import { clamp } from '../utils'
import { flatPath, generatePath } from './pathHandler'

export interface ImgConfig<T> {
  toWebp: boolean
  width: T
  quality: T
}

function correctConfig(config: ImgConfig<number>, oriWidth: number) {
  config.width =
    config.width === 0 || config.width > oriWidth ? oriWidth : config.width
  config.quality = clamp(config.quality, 10, 100)
}

export async function handleImage(filePath: string, config: ImgConfig<number>) {
  const oriImg = Sharp(filePath)
  let img = oriImg.clone()

  try {
    const metadata = await oriImg.metadata()

    correctConfig(config, metadata.width!)

    const { path: newPath, format } = generatePath(filePath, config)

    // TODO: more options ?
    switch (format) {
      case '.jpg':
      case '.jpeg':
        img = oriImg.jpeg({ quality: config.quality })
        break
      case '.png':
        img = oriImg.png({ quality: config.quality, palette: false })
        break
      case '.webp':
        img = oriImg.webp({
          quality: config.quality,
          lossless: false,
          effort: 4,
        })
        break
    }

    const sharpRes = await img.resize(config.width).toFile(newPath)
    return sharpRes
  } catch (e) {
    // TODO: error handle
    console.log(e)
  }
}

export async function handleImages(
  paths: string[],
  config: ImgConfig<number> = { toWebp: false, width: 0, quality: 100 },
) {
  const finalPaths = flatPath(paths)

  for (let i = 0; i < finalPaths.length; i++) {
    handleImage(finalPaths[i], config)
  }
}
