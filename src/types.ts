import type { Component, CSSProperties, ComputedRef, InjectionKey, ShallowRef } from 'vue'
import type { MaybeRefOrGetter } from '@vueuse/core'

export type CloseType = 'submit' | 'confirm' | 'close' | 'cancel'

export interface ModalConfig {
  /** @default 'body' */
  teleportTo?: MaybeRefOrGetter<string>
  /** @default true */
  scrollLock?: boolean
  /** @default true */
  focusTrap?: boolean
  /** @default true */
  closeOnBack?: boolean
}

export interface ModalState<T extends Component = Component> {
  id: string
  component: T
  props?: T extends new () => { $props: infer P } ? P : Record<string, unknown>
  onClose?: (type?: CloseType, value?: unknown) => void | Promise<void>
  style?: CSSProperties
  overlayStyle?: CSSProperties
  teleportTo?: string
  /** @default true */
  clickOutside?: boolean
}

export type ModalOptions<T extends Component = Component> = Omit<ModalState<T>, 'id'>

export interface ModalContext {
  modals: ShallowRef<ModalState[]>
  isOpen: ComputedRef<boolean>
  current: ComputedRef<ModalState | undefined>
  openModal: <T extends Component>(options: ModalOptions<T>) => void
  closeModal: (type?: CloseType, value?: unknown) => Promise<void>
  closeAll: () => Promise<void>
}

export const MODAL_KEY: InjectionKey<ModalContext> = Symbol('modal')
