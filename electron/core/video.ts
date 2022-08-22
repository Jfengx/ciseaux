import fs from 'fs'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
import { generatePath } from './paths'
import { clamp, videoRange } from '../utils'

export interface VideoConfig {
  bitRate: number
  fps: number
  ratio: number
  quiet: boolean
  toMp4: boolean
}

const ffmpeg = createFFmpeg({
  log: true,
})

function correctConfig(config: VideoConfig) {
  config.bitRate = clamp(
    config.bitRate,
    videoRange.bitRate[0],
    videoRange.bitRate[1],
  )
  config.fps = clamp(config.fps, videoRange.fps[0], videoRange.fps[1])
  config.ratio = clamp(config.ratio, videoRange.ratio[0], videoRange.ratio[1])
}

export async function handleVideo(
  filePath: string,
  config: VideoConfig = {
    bitRate: 1500,
    ratio: 1,
    quiet: false,
    toMp4: false,
    fps: 20,
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

    const args = [
      // bitrate
      '-b:v',
      `${config.bitRate}k`,
      '-minrate',
      `${config.bitRate}k`,
      '-maxrate',
      `${config.bitRate}k`,
      // quiet
      config.quiet ? '-an' : '',
      // fps
      '-r',
      config.fps.toString(),
      // scale
      '-vf',
      `scale=ceil(iw*${config.ratio}/2)*2:ceil(ih*${config.ratio}/2)*2`,
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
