<script setup lang="ts">
import 'uno.css'

import { reactive, ref, computed } from 'vue'
import { ipcRenderer, type OpenDialogOptions } from 'electron'
import {
  type ImgConfig,
  type FileType,
  type FileConfig,
  type VideoConfig,
} from '../electron/core'
import { OPEN_FILE, DROP_FILE, events } from '../electron/utils/eventsName'

export interface DialogConfig {
  dialog: OpenDialogOptions
  file: FileConfig
}

export interface DropConfig {
  drop: {
    filePaths: string[]
  }
  file: FileConfig
}

type TYPE = 'Image' | 'Video'

const type = ref<TYPE>('Image')
const isSettingsShow = ref(false)

const oriImgConfig = reactive<ImgConfig>({
  toWebp: false,
  useWidthRatio: false,
  width: 0,
  widthRatio: 0,
  quality: 100,
})

const oriVideoConfig = reactive<VideoConfig>({
  bitRate: 1500,
  fps: 20,
  quiet: false,
  toMp4: true,
  ratio: 1,
})

const imgConfig = computed(() => ({
  useWidthRatio: oriImgConfig.useWidthRatio,
  toWebp: oriImgConfig.toWebp,
  width: Number(oriImgConfig.width),
  quality: Number(oriImgConfig.quality),
  widthRatio: Number(oriImgConfig.widthRatio),
}))

const videoConfig = computed(() => ({
  bitRate: Number(oriVideoConfig.bitRate),
  fps: Number(oriVideoConfig.fps),
  ratio: Number(oriVideoConfig.ratio),
  quiet: oriVideoConfig.quiet,
  toMp4: oriVideoConfig.toMp4,
}))

const onClick = async () => {
  const openFileData: {
    type: FileType
    config: DialogConfig
  } = {
    type: type.value,
    config: {
      dialog: {
        title: 'Choose File',
        properties: ['openFile', 'openDirectory', 'multiSelections'],
      },
      file: type.value === 'Image' ? imgConfig.value : videoConfig.value,
    },
  }

  ipcRenderer.send(events[OPEN_FILE], openFileData)
}

const onDrop = (e: DragEvent) => {
  e.preventDefault()

  const dropFileData: { type: FileType; config: DropConfig } = {
    type: type.value,
    config: {
      drop: {
        filePaths: Array.from(e.dataTransfer!.files).map((file) => file.path),
      },
      file: type.value === 'Image' ? imgConfig.value : videoConfig.value,
    },
  }

  ipcRenderer.send(events[DROP_FILE], dropFileData)
}

const openSettings = () => {
  isSettingsShow.value = !isSettingsShow.value
}
</script>

<template lang="pug">
.select-area(class='f-ca flex-col rel')
  .area(
    :class="[isSettingsShow ? 'active' : '', 'cursor-pointer', 'f-c', 'rel']" 
    @click="onClick"
    @drop="onDrop"
    @dragover="(e) => e.preventDefault()"
  ) 
    p.type {{ type }}
    p.options(class='abs') Drag or Click

  .settings(class='rel flex')
    .image(:class="['i-carbon-image', type === 'Image' ? 'active' : '', 'cursor-pointer']" @click="type = 'Image'")
    .config(
      :class="[isSettingsShow ? 'active' : '', 'rel', 'i-carbon-settings', 'cursor-pointer']"
      @click="openSettings"
    )
    .video(:class="['i-carbon-video', type === 'Video' ? 'active' : '', 'cursor-pointer']" @click="type = 'Video'")
    
  .settings-wrapper(
    :class="[isSettingsShow ? 'active' : '', 'abs']"
  ) 
    .image-settings(v-show="type == 'Image'" class='rel')
      .content(class='flex f-c')
        .quality.input-wrapper.flex
          label Quality
          input(v-model='oriImgConfig.quality')
        .width.input-wrapper.flex
          label Width
          input(v-model='oriImgConfig.width')
        .ratio.input-wrapper.flex
          label WidthRatio
          input(v-model='oriImgConfig.widthRatio')
        .use-ratio.input-wrapper.flex
          label UseWidthRatio
          input(type='checkbox' v-model='oriImgConfig.useWidthRatio')
        .webp.input-wrapper.flex
          label ToWebp
          input(type='checkbox' v-model='oriImgConfig.toWebp')

    .video-settings.rel(v-show="type == 'Video'")
      .content.flex.f-c
        .bitrate.input-wrapper.flex
          label Bitrate
          input(v-model='oriVideoConfig.bitRate')
        .ratio.input-wrapper.flex
          label Ratio
          input(v-model='oriVideoConfig.ratio')
        .fps.input-wrapper.flex
          label Fps
          input(v-model='oriVideoConfig.fps')
        .format.input-wrapper.flex
          label ToMp4
          input(type='checkbox' v-model='oriVideoConfig.toMp4')
        .quiet.input-wrapper.flex
          label Quiet
          input(type='checkbox' v-model='oriVideoConfig.quiet')

</template>

<style lang="stylus">
$color0 = #e45b28
$color1 = #132a5c

*
  margin 0
  padding 0
  font-family pixel-f

.select-area
  width 100vw
  height 100vh
  overflow hidden

  .area
    width 88vw
    height 75vh
    border 1px dashed $color0
    color alpha($color1, 0.8)
    // box-shadow #af97fe 0px 8px 24px
    border-radius 0.5rem
    margin-top 2.5rem
    transform-origin top
    transition transform 0.3s
    flex-direction column
    text-align center
    z-index 1

    .type
      transition transform 0.25s ease

    .options
      font-size .75rem
      bottom 0.8rem
      left 50%
      transform translateX(-50%)

    p
      &:first-child
        font-size 5rem

    &.active
      transform scale(0.95)

      .type
        transform-origin 50% -100%
        transform scale(0.25)

  .settings
    margin-top 2.5vh

    & > *
      width 5.5vh
      height 5.5vh
      color $color0
      opacity 0.4
      transition transform 0.3s, opacity 0.3s
      z-index 3

      &.active
        opacity 1

    .config
      margin 0 .5rem
      opacity 0.6

      &.active
        transform rotate(90deg)

      &:hover
        opacity 1

  .settings-wrapper
    z-index 2
    left 6vw
    bottom calc(23vh - 2.5rem)
    width 88vw
    height 60vh
    border-radius 0.5rem
    background white
    border 1px dashed $color1
    color alpha($color0, 0.8)
    font-size 0.8rem
    opacity 0
    transform translateY(20%)
    transition transform 0.3s, opacity 0.15s
    pointer-events none

    & > *
      width 100%
      height 100%
      .content
        width 100%
        height 100%
        flex-direction column
        text-align left

    &.active
      pointer-events unset
      transform translateY(0)
      opacity 1

    .input-wrapper
      margin-bottom 0.3rem
      width 10rem


      label
        width 6rem
        text-align left

      input
        width 4rem
        outline none
        padding 0 0.2rem
        border-radius 0.2rem
        border 1px solid alpha(#000, 0.2)
        color alpha(#000, 0.6)

      input[type='checkbox']
        transform scale(0.7)

@font-face
  font-family pixel-f
  src url('../public/ark-pixel-12px-zh_cn.woff2')
</style>
