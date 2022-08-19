<script setup lang="ts">
import 'uno.css'

import { reactive, ref, computed } from 'vue'
import { ipcRenderer, type OpenDialogOptions } from 'electron'
import { type ImgConfig } from '../electron/core'
import { OPEN_FILE, DROP_FILE, events } from '../electron/utils/eventsName'

export interface DialogConfig {
  dialog: OpenDialogOptions
  img: ImgConfig<number>
}

export interface DropConfig {
  drop: {
    filePaths: string[]
  }
  img: ImgConfig<number>
}

const isSettingsShow = ref(false)

const oriImgConfig = reactive<ImgConfig<string>>({
  toWebp: false,
  useWidthRatio: false,
  width: '0',
  widthRatio: '0',
  quality: '100',
})

const imgConfig = computed(() => ({
  useWidthRatio: oriImgConfig.useWidthRatio,
  toWebp: oriImgConfig.toWebp,
  width: Number(oriImgConfig.width),
  quality: Number(oriImgConfig.quality),
  widthRatio: Number(oriImgConfig.widthRatio),
}))

const onClick = async () => {
  const openFileData: {
    config: DialogConfig
  } = {
    config: {
      dialog: {
        title: 'Choose File',
        properties: ['openFile', 'openDirectory', 'multiSelections'],
      },
      img: imgConfig.value,
    },
  }

  ipcRenderer.send(events[OPEN_FILE], openFileData)
}

const onDrop = (e: DragEvent) => {
  e.preventDefault()

  const dropFileData: { config: DropConfig } = {
    config: {
      drop: {
        filePaths: Array.from(e.dataTransfer!.files).map((file) => file.path),
      },
      img: imgConfig.value,
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
    :class="[isSettingsShow ? 'active' : '', 'cursor-pointer']" 
    @click="onClick"
    @drop="onDrop"
    @dragover="(e) => e.preventDefault()"
  )
  .settings(
    i-carbon-settings
    :class="[isSettingsShow ? 'active' : '', 'rel', 'i-carbon-settings', 'cursor-pointer ']"
    @click="openSettings"
  )
  .settings-wrapper(
    :class="[isSettingsShow ? 'active' : '', 'f-c', 'abs', 'flex']"
  )
    .quality.input-wrapper.flex
      label quality
      input(v-model='oriImgConfig.quality')
    .width.input-wrapper.flex
      label width
      input(v-model='oriImgConfig.width')
    .ratio.input-wrapper.flex
      label widthRatio
      input(v-model='oriImgConfig.widthRatio')
    .use-ratio.input-wrapper.flex
      label useWidthRatio
      input(type='checkbox' v-model='oriImgConfig.useWidthRatio')
    .webp.input-wrapper.flex
      label toWebp
      input(type='checkbox' v-model='oriImgConfig.toWebp')

</template>

<style lang="stylus">
*
  margin 0
  padding 0

.select-area
  width 100vw
  height 100vh
  overflow hidden

  .area
    width 88vw
    height 75vh
    border 1px dashed #af97fe
    // box-shadow #af97fe 0px 8px 24px
    border-radius 0.5rem
    margin-top 2.5rem
    transform-origin top
    transition transform 0.3s
    z-index 1

    &.active
      transform scale(0.95)

  .settings
    width 5.5vh
    height 5.5vh
    margin-top 2.5vh
    border-radius 50%
    color #6e5276
    opacity 0.6
    transition: transform 0.3s, opacity 0.3s
    z-index 3

    &.active
      transform rotate(90deg)
      opacity 1

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
    border 1px dashed rgba(254, 114, 226, 0.5)
    font-size 0.8rem
    flex-direction column
    text-align left
    opacity 0
    transform translateY(20%)
    transition transform 0.3s, opacity 0.15s
    pointer-events none

    &.active
      pointer-events unset
      transform translateY(0)
      opacity 1

    .input-wrapper
      margin-bottom 0.3rem
      width 10rem
      color alpha(#000, 0.9)

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
</style>
