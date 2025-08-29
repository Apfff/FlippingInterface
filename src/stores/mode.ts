import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useModeStore = defineStore('mode', () => {
  const currentMode = ref<'editor' | 'simulate'>('simulate')

  function switchMode() {
    currentMode.value = currentMode.value === 'editor' ? 'simulate' : 'editor'
  }

  return { currentMode, switchMode }
})
