import Sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { isImage, clamp } from './share'

export interface ImgConfig<T> {
  toWebp: boolean
  width: T
  quality: T
}

function processPaths(oriPaths: string[]) {
  const paths: string[] = []

  function handleFileByType(path: string, info: fs.Dirent | fs.Stats) {
    if (info.isFile() && isImage.test(path)) {
      paths.push(path)
    } else if (info.isDirectory()) {
      traverse(path)
    }
  }

  function traverse(way: string) {
    const dirInfo = fs.readdirSync(way, { withFileTypes: true })

    for (let i = 0; i < dirInfo.length; i++) {
      const dirent = dirInfo[i]
      const filePath = path.join(way, dirent.name)
      handleFileByType(filePath, dirent)
    }
  }

  for (let i = 0; i < oriPaths.length; i++) {
    const p = oriPaths[i]
    const stat = fs.lstatSync(p)
    handleFileByType(p, stat)
  }

  return paths
}

function generatePath(oldPath: string, config: ImgConfig<number>) {
  const pathObj = path.parse(oldPath)

  const name = `${pathObj.name}.w${config.width}q${config.quality}`
  const suffix = config.toWebp ? '.webp' : pathObj.ext

  pathObj.base = `${name}${suffix}`

  return { path: path.format(pathObj), format: suffix }
}

async function processFile(filePath: string, config: ImgConfig<number>) {
  const oriImg = Sharp(filePath)

  try {
    const metadata = await oriImg.metadata()

    config.width =
      config.width === 0 || config.width > metadata.width!
        ? metadata.width!
        : config.width

    config.quality = clamp(config.quality, 10, 100)

    const { path: newPath, format } = generatePath(filePath, config)

    let qualityImg = oriImg.clone()

    // TODO: more options ?
    switch (format) {
      case '.jpg':
      case '.jpeg':
        qualityImg = oriImg.jpeg({ quality: config.quality })
        break
      case '.png':
        qualityImg = oriImg.png({ quality: config.quality, palette: false })
        break
      case '.webp':
        qualityImg = oriImg.webp({
          quality: config.quality,
          lossless: false,
          effort: 4,
        })
        break
    }

    const sharpRes = await qualityImg.resize(config.width).toFile(newPath)
    return sharpRes
  } catch (e) {
    // TODO: error handle
    console.log(e)
  }
}

export async function processFiles(
  paths: string[],
  config: ImgConfig<number> = { toWebp: false, width: 0, quality: 100 },
) {
  const finalPaths = processPaths(paths)

  for (let i = 0; i < finalPaths.length; i++) {
    processFile(finalPaths[i], config)
  }
}
