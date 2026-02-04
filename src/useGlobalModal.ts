import { computed, markRaw, provide, inject, shallowRef, type Component } from 'vue'
import { toValue } from '@vueuse/core'
import type { ModalState, ModalOptions, ModalConfig, ModalContext, CloseType } from './types'
import { MODAL_KEY } from './types'

let _id = 0

/**
 * Create modal context (call in app root)
 */
export function createModal(config: ModalConfig = {}): ModalContext {
  const {
    teleportTo = 'body',
    scrollLock = true,
    focusTrap = true,
    closeOnBack = true
  } = config

  const modals = shallowRef<ModalState[]>([])
  const isOpen = computed(() => modals.value.length > 0)
  const current = computed(() => modals.value[modals.value.length - 1])

  const openModal = <T extends Component>(opts: ModalOptions<T>): void => {
    const state: ModalState<T> = {
      id: `m${++_id}`,
      component: markRaw(opts.component) as T,
      props: opts.props,
      onClose: opts.onClose,
      style: opts.style,
      overlayStyle: opts.overlayStyle,
      teleportTo: opts.teleportTo ?? toValue(teleportTo),
      clickOutside: opts.clickOutside ?? true
    }
    modals.value = [...modals.value, state as ModalState]
  }

  const closeModal = async (type?: CloseType, value?: unknown): Promise<void> => {
    const modal = current.value
    if (!modal) return

    modals.value = modals.value.slice(0, -1)

    if (modal.onClose) {
      try {
        await modal.onClose(type, type === 'submit' ? value : undefined)
      } catch (e) {
        console.error('[useModal] closeModal error:', e)
      }
    }
  }

  const closeAll = async (): Promise<void> => {
    while (modals.value.length > 0) {
      await closeModal('close')
    }
  }

  const ctx: ModalContext = { modals, isOpen, current, openModal, closeModal, closeAll }

  provide('__modal_cfg__', { scrollLock, focusTrap, closeOnBack })
  provide(MODAL_KEY, ctx)

  return ctx
}

/**
 * Use modal context
 */
export function useModal(): ModalContext {
  const ctx = inject(MODAL_KEY)
  if (!ctx) {
    throw new Error('[useModal] Call `createModal()` in app root first.')
  }
  return ctx
}
