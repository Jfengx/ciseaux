<script setup lang="ts">
import 'uno.css'

import { reactive, ref } from 'vue'
import { ipcRenderer, type OpenDialogOptions } from 'electron'
import { type ImgConfig } from '../electron/utils/file'
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

const isSettingsShow = ref(true)

const imgConfig = reactive<ImgConfig<string>>({
  toWebp: false,
  width: '0',
  quality: '100',
})

const onClick = async () => {
  const openFileData: {
    config: DialogConfig
  } = {
    config: {
      dialog: {
        title: 'Choose File',
        properties: ['openFile', 'openDirectory', 'multiSelections'],
      },
      img: {
        toWebp: imgConfig.toWebp,
        width: Number(imgConfig.width),
        quality: Number(imgConfig.quality),
      },
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
      img: {
        toWebp: imgConfig.toWebp,
        width: Number(imgConfig.width),
        quality: Number(imgConfig.quality),
      },
    },
  }

  ipcRenderer.send(events[DROP_FILE], dropFileData)
}

const openSettings = () => {
  isSettingsShow.value = !isSettingsShow.value
}
</script>

<template>
  <div class="select-area" f-ca flex-col rel w-100vw h-100vh>
    <div
      class="area"
      flex-shrink-0
      @click="onClick"
      @drop="onDrop"
      @dragover="(e) => e.preventDefault()"
    ></div>

    <div
      i-carbon-settings
      rel
      :class="['settings', isSettingsShow ? 'active' : '']"
      @click="openSettings"
    ></div>
    <div flex class="settings-wrapper" v-show="isSettingsShow">
      <div flex class="quality input-wrapper">
        <label>Quality</label>
        <input v-model="imgConfig.quality" />
      </div>
      <div flex class="width input-wrapper">
        <label>Width</label>
        <input v-model="imgConfig.width" />
      </div>
      <div flex class="webp input-wrapper">
        <label>ToWebp</label>
        <input type="checkbox" v-model="imgConfig.toWebp" />
      </div>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
}
</style>
