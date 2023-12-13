import { createEffect, onCleanup, onMount } from 'solid-js'
import { clearMsgs, msgs, restoreMsgs } from '../store/msgs'
import { useToast } from './ui/Toast'
import { addEventListener } from 'solid-js/web'
import { useEventListener } from 'solidjs-use'
import { settingStore } from '@renderer/store/setting'

/**
 * FEAT: Input 组件，用于接收用户输入的文本，onMountHandler可以在外部操作 input 元素
 */
export default function Input(props: {
  send: (msg: string) => void
  onMountHandler?: (textAreaDiv: HTMLTextAreaElement) => void
  showClearButton?: boolean
  disable?: boolean
  isGenerating?: boolean
  autoFocusWhenShow?: boolean
  placeholder?: string
  text: string
  setText: (text: string) => void
}) {
  let textAreaDiv: HTMLTextAreaElement | undefined
  let textAreaContainerDiv: HTMLDivElement | undefined
  let cleanupForRestoreMsgs: (() => void) | undefined
  const toast = useToast()
  function submit() {
    props.send(props.text)
    props.setText('')
    textAreaDiv!.style.height = 'auto'
  }

  onMount(() => {
    if (props.autoFocusWhenShow) {
      const removeListener = window.api.showWindow(() => {
        textAreaDiv!.focus()
      })
      onCleanup(() => {
        removeListener()
      })
    }

    // 让input聚焦，box边框变为激活色
    const addActive = () => {
      textAreaContainerDiv!.attributes.setNamedItem(document.createAttribute('data-active'))
    }
    const removeActive = () => {
      if (textAreaContainerDiv && textAreaContainerDiv.attributes.getNamedItem('data-active')) {
        textAreaContainerDiv.attributes.removeNamedItem('data-active')
      }
    }
    textAreaDiv!.addEventListener('focus', addActive)
    textAreaDiv!.addEventListener('blur', removeActive)

    props.onMountHandler?.(textAreaDiv!)

    onCleanup(() => {
      textAreaDiv && textAreaDiv.removeEventListener('focus', addActive)
      textAreaDiv && textAreaDiv.removeEventListener('blur', removeActive)
    })
  })
  createEffect(() => {
    if (props.text !== undefined && textAreaDiv) {
      textAreaDiv.style.height = 'auto'
      textAreaDiv.style.height = `${textAreaDiv!.scrollHeight}px`
    }
  })

  return (
    <div ref={textAreaContainerDiv} class="cyber-box relative flex w-full backdrop-blur-md">
      <textarea
        ref={textAreaDiv}
        value={props.text}
        disabled={props.disable}
        onKeyDown={(e) => {
          if (settingStore.sendWithCmdOrCtrl) {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              submit()
              e.preventDefault()
            }
          } else {
            if (e.key === 'Enter' && !(e.ctrlKey || e.metaKey || e.shiftKey)) {
              submit()
              e.preventDefault()
            }
          }
        }}
        onInput={(e) => {
          cleanupForRestoreMsgs?.()
          props.setText(e.target.value)
          e.preventDefault()
        }}
        rows={1}
        placeholder={
          props.placeholder ||
          (settingStore.sendWithCmdOrCtrl ? 'Ctrl/Cmd+Enter 发送' : 'Enter shift+Enter 发送')
        }
        class="font-sans max-h-48 flex-1 resize-none rounded-2xl border-none bg-dark-pro px-4 py-2 text-base text-text1 caret-text2 transition-none focus:outline-none"
      />
      {props.showClearButton && !props.isGenerating && (
        <button
          class={
            'absolute right-3 top-[6px] h-2/3 cursor-pointer overflow-hidden rounded-lg border-0 bg-cyber text-text2 shadow-md active:animate-click ' +
            (props.text.length ? 'w-0 px-0' : 'px-2')
          }
          onClick={() => {
            toast.info('ctrl/cmd + z 撤销', {
              duration: 1000,
              position: 'top-3/4'
            })
            if (!msgs.length) return
            clearMsgs()
            cleanupForRestoreMsgs = useEventListener(document, 'keydown', (e) => {
              if ((e.key === 'z' && e.ctrlKey) || (e.key === 'z' && e.metaKey)) {
                restoreMsgs()
                cleanupForRestoreMsgs?.()
              }
            })
          }}
        >
          {!props.text.length && '清空历史'}
        </button>
      )}
    </div>
  )
}