import { type ImgConfig, handleImage } from './image'
import { type VideoConfig, handleVideo } from './video'
import { flatPath } from './paths'

export type FileType = 'Image' | 'Video'

export type FileConfig = ImgConfig<number> | VideoConfig<number>

export function exec(paths: string[], config: FileConfig, fileType: FileType) {
  const p = flatPath(paths, fileType)
  console.log(p)

  for (let i = 0; i < p.length; i++) {
    if (fileType === 'Image') {
      handleImage(p[i], <ImgConfig<number>>config)
    }

    if (fileType === 'Video') {
      handleVideo(p[i], <VideoConfig<number>>config)
    }
  }
}
