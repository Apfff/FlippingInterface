<script setup lang="ts">
import GraphEditor from '@/components/GraphEditor.vue'
import { useFileStore } from '@/stores/file'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'

const fileStore = useFileStore()
const { editorGraphObj } = storeToRefs(fileStore)
const graphName = ref<string>('')
watch(graphName, (newName) => {
  if (editorGraphObj.value) {
    editorGraphObj.value.name = newName
  }
})
</script>

<template>
  <div class="editor">
    <input
      v-model="graphName"
      class="graph-problem-name"
      placeholder="untitled"
      @keydown.stop
      @keyup.stop
      @keypress.stop
    />
    <GraphEditor />
  </div>
</template>

<style lang="scss">
.editor {
  padding: var(--s-xl) 8%;
  height: calc(100vh - var(--header-height));
  display: flex;
  flex-direction: column;
  padding-bottom: var(--header-height);
}
</style>
