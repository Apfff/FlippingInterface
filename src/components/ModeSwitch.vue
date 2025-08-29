<script setup lang="ts">
import { useModeStore } from '@/stores/mode'
import { storeToRefs } from 'pinia'

const modeStore = useModeStore()
const { currentMode } = storeToRefs(modeStore)

function handleSwitchMode() {
  modeStore.switchMode()
}
</script>

<template>
  <div class="mode-switch" @click="handleSwitchMode()">
    <div class="switch create" :class="{ active: currentMode === 'editor' }">editor</div>
    <div class="switch simulate" :class="{ active: currentMode === 'simulate' }">simulate</div>
  </div>
</template>

<style lang="scss">
.mode-switch {
  cursor: pointer;
  display: flex;
  gap: var(--s-m);
  align-items: center;
  justify-content: center;
  padding: var(--s-m);
  border-radius: var(--s-m);
  background-color: var(--c-bg-dark);
}
.switch {
  border-radius: var(--s-m);
  padding: 2px 6px;
  user-select: none;
}
.active {
  background-color: var(--c-btn);
}
</style>
