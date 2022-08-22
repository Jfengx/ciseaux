import fs from 'fs'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
import { generatePath } from './paths'
import { clamp } from '../utils'

export interface VideoConfig<T extends Number | String> {
  bitRate: T
  quiet: boolean
  format: '.mp4'
}

const ffmpeg = createFFmpeg({
  log: true,
})

function correctConfig(config: VideoConfig<number>) {
  config.bitRate = clamp(config.bitRate, 100, 100000)
}

export async function handleVideo(
  filePath: string,
  config: VideoConfig<number> = {
    bitRate: 1500,
    quiet: false,
    format: '.mp4',
  },
) {
  correctConfig(config)

  const { path: newPath, resolver } = generatePath(filePath, config, 'Video')
  try {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load()
    }

    const oriName = resolver.name.split('.')[0]
    const transName = oriName + resolver.ext

    const args: string[] = [
      '-b:v',
      `${config.bitRate}k`,
      '-minrate',
      `${config.bitRate}k`,
      '-maxrate',
      `${config.bitRate}k`,
      config.quiet ? '-an' : '',
    ].filter((v) => !!v)

    ffmpeg.FS('writeFile', oriName, await fetchFile(filePath))
    await ffmpeg.run('-i', oriName, ...args, transName)
    await fs.promises.writeFile(newPath, ffmpeg.FS('readFile', transName))

    ffmpeg.FS('unlink', oriName)
    ffmpeg.FS('unlink', transName)
  } catch (e) {
    console.log(e)
  }
}
