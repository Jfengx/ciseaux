import path from 'path'
import fs from 'fs'
import { isImage } from '../utils'
import { type ImgConfig } from './imageHandler'

export function flatPath(oriPaths: string[]) {
  const paths: string[] = []

  function handlePath(path: string, info: fs.Dirent | fs.Stats) {
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
      handlePath(filePath, dirent)
    }
  }

  for (let i = 0; i < oriPaths.length; i++) {
    const p = oriPaths[i]
    const stat = fs.lstatSync(p)
    handlePath(p, stat)
  }

  return paths
}

export function generatePath(oriPath: string, config: ImgConfig<number>) {
  const resolver = path.parse(oriPath)

  // TODO: generate mode
  const postfix = `.w${config.width}q${config.quality}`

  resolver.ext = config.toWebp ? '.webp' : resolver.ext
  resolver.name = `${resolver.name}${postfix}`
  resolver.base = `${resolver.name}${resolver.ext}`

  return { path: path.format(resolver), format: resolver.ext }
}
