import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', () => {
  const showTargetOverlap = ref(false)
  return { showTargetOverlap }
})
