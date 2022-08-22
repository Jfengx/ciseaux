import Sharp from 'sharp'
import { clamp } from '../utils'
import { generatePath } from './paths'

export interface ImgConfig<T extends Number | String> {
  toWebp: boolean
  useWidthRatio: boolean
  widthRatio: T
  width: T
  quality: T
}

function correctConfig(config: ImgConfig<number>, oriWidth: number) {
  config.widthRatio = clamp(config.widthRatio, 0, 1)

  config.width = Math.round(
    config.useWidthRatio ? oriWidth * config.widthRatio : config.width,
  )
  config.width =
    config.width === 0 || config.width > oriWidth ? oriWidth : config.width

  config.quality = clamp(config.quality, 10, 100)
}

export async function handleImage(
  filePath: string,
  config: ImgConfig<number> = {
    toWebp: false,
    useWidthRatio: false,
    width: 0,
    widthRatio: 0,
    quality: 100,
  },
) {
  const oriImg = Sharp(filePath)
  let img = oriImg.clone()

  try {
    const metadata = await oriImg.metadata()

    correctConfig(config, metadata.width!)

    const { path: newPath, resolver } = generatePath(filePath, config, 'Image')

    // TODO: more options ?
    switch (resolver.ext) {
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
