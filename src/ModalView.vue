<template>
  <Teleport v-if="isMounted && isOpen" :to="target">
    <div
      v-for="modal in modals"
      :key="modal.id"
      class="modal-overlay"
      :style="modal.overlayStyle"
      @click.self="onOverlayClick(modal)"
    >
      <div ref="trapRef" class="modal-wrap">
        <component
          :is="modal.component"
          v-bind="modal.props || {}"
          :style="modal.style"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue'
import { useScrollLock, useEventListener, tryOnMounted } from '@vueuse/core'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import { useModal } from './useGlobalModal'
import type { ModalState, ModalConfig } from './types'

const props = withDefaults(defineProps<{
  teleportTo?: string
}>(), {
  teleportTo: 'body'
})

const { modals, isOpen, current, closeModal } = useModal()

// Config from createModal()
const cfg = inject<Partial<ModalConfig>>('__modal_cfg__', {})
const { scrollLock = true, focusTrap = true, closeOnBack = true } = cfg

// SSR
const isMounted = ref(false)
tryOnMounted(() => { isMounted.value = true })

const trapRef = ref<HTMLElement>()
const target = computed(() => current.value?.teleportTo ?? props.teleportTo)

// Scroll lock
const lockTarget = computed(() => isMounted.value ? document.body : null)
const locked = useScrollLock(lockTarget)

watch(isOpen, (v) => {
  if (scrollLock) locked.value = v
}, { immediate: true })

// Focus trap
const { activate, deactivate } = useFocusTrap(trapRef, {
  immediate: false,
  allowOutsideClick: true,
  fallbackFocus: () => trapRef.value as HTMLElement
})

watch(isOpen, (v) => {
  if (!focusTrap) return
  v ? setTimeout(activate, 0) : deactivate()
})

// Browser back
if (closeOnBack) {
  useEventListener('popstate', () => {
    if (isOpen.value) closeModal('close')
  })
}

// Overlay click
const onOverlayClick = (modal: ModalState) => {
  if (modal.clickOutside !== false) closeModal('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-wrap { display: contents; }
</style>
