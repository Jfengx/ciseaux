import path from 'path'
import fs from 'fs'
import { type ImgConfig } from './image'
import { type VideoConfig } from './video'
import { type FileConfig, type FileType } from './file'
import { isImage, isVideo } from '../utils'

export function flatPath(oriPaths: string[], fileType: FileType) {
  const paths: string[] = []

  function isCorrectFile(path: string) {
    return fileType === 'Image' ? isImage.test(path) : isVideo.test(path)
  }

  function handlePath(path: string, info: fs.Dirent | fs.Stats) {
    if (info.isFile() && isCorrectFile(path)) {
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

export function generatePath(
  oriPath: string,
  config: FileConfig,
  fileType: FileType,
) {
  const resolver = path.parse(oriPath)

  if (fileType === 'Image') {
    const c = <ImgConfig>config
    const postfix = `.w${c.width}q${c.quality}`

    resolver.ext = c.toWebp ? '.webp' : resolver.ext
    resolver.name = `${resolver.name}${postfix}`
    resolver.base = `${resolver.name}${resolver.ext}`
  }

  if (fileType === 'Video') {
    const c = <VideoConfig>config
    resolver.ext = c.toMp4 ? '.mp4' : resolver.ext
    resolver.name = `${resolver.name}.min`
    resolver.base = `${resolver.name}${resolver.ext}`
  }

  return { path: path.format(resolver), resolver }
}
