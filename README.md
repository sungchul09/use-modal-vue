# use-modal-vue

A lightweight Vue 3 composable for managing global modals.

## Features

- Provide/Inject based (no Pinia required)
- SSR support
- Focus trap (via @vueuse/integrations)
- Scroll lock
- Stack multiple modals
- TypeScript support

## Installation

```bash
npm install use-modal-vue
```

## Usage

### Setup (App.vue)

```vue
<script setup>
import { createModal, ModalView } from 'use-modal-vue'

createModal()
</script>

<template>
  <router-view />
  <ModalView />
</template>
```

### Open Modal

```vue
<script setup>
import { useModal } from 'use-modal-vue'
import MyModal from './MyModal.vue'

const { openModal } = useModal()

const handleOpen = () => {
  openModal({
    component: MyModal,
    props: { title: 'Hello' },
    onClose: (type, value) => {
      console.log(type, value)
    }
  })
}
</script>
```

### Close Modal (inside modal component)

```vue
<script setup>
import { useModal } from 'use-modal-vue'

const { closeModal } = useModal()

const submit = () => {
  closeModal('submit', { data: 'value' })
}

const cancel = () => {
  closeModal('cancel')
}
</script>
```

## API

### `createModal(config?)`

Call in app root to create modal context.

```ts
interface ModalConfig {
  teleportTo?: string    // default: 'body'
  scrollLock?: boolean   // default: true
  focusTrap?: boolean    // default: true
  closeOnBack?: boolean  // default: true
}
```

### `useModal()`

Returns modal context.

```ts
const { modals, isOpen, current, openModal, closeModal, closeAll } = useModal()
```

| Name | Type | Description |
|------|------|-------------|
| `modals` | `ShallowRef<ModalState[]>` | Modal stack |
| `isOpen` | `ComputedRef<boolean>` | Any modal open |
| `current` | `ComputedRef<ModalState>` | Current modal |
| `openModal` | `(options) => void` | Open modal |
| `closeModal` | `(type?, value?) => Promise` | Close current |
| `closeAll` | `() => Promise` | Close all |

### `openModal(options)`

```ts
interface ModalOptions {
  component: Component
  props?: Record<string, unknown>
  onClose?: (type?: CloseType, value?: unknown) => void | Promise<void>
  style?: CSSProperties
  overlayStyle?: CSSProperties
  teleportTo?: string
  clickOutside?: boolean  // default: true
}

type CloseType = 'submit' | 'confirm' | 'close' | 'cancel'
```

### `<ModalView />`

Renders modals. Place at app root.

```vue
<ModalView teleport-to="body" />
```

## License

MIT
