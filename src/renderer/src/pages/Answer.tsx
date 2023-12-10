import Input from '@renderer/components/MainInput'
import Message from '@renderer/components/Message'
import { genAns, answerStore } from '../store/answer'
import { Show, createSignal, onCleanup, onMount } from 'solid-js'
import { IpcRendererEvent } from 'electron'
import { useLocation, useNavigate } from '@solidjs/router'
import { getCurrentAssistantForAnswer } from '@renderer/store/assistants'

export default function Answer() {
  const [text, setText] = createSignal('')

  onMount(() => {
    const query = useLocation().query
    if (query.q) {
      genAns(query.q as string)
    }
    const removeListener = window.api.multiCopy((_: IpcRendererEvent, msg: string) => {
      genAns(msg)
    })
    onCleanup(() => {
      removeListener()
    })
  })

  const nav = useNavigate()

  return (
    <div class="flex h-full flex-col gap-4 overflow-auto pb-48 pt-10">
      <Show
        when={answerStore.question}
        fallback={
          <div
            class="cursor-pointer"
            onClick={() => {
              nav('/assistants?type=ans')
            }}
          >
            <Message
              botName={getCurrentAssistantForAnswer().name}
              content={getCurrentAssistantForAnswer().name}
              type="system"
            />
          </div>
        }
      >
        <Message content={answerStore.question} id="question" type="question" />
      </Show>
      {answerStore.answer && (
        <Message
          content={answerStore.answer}
          type="ans"
          botName={getCurrentAssistantForAnswer().name}
        />
      )}
      <div class="fixed bottom-10 w-full px-8">
        <Input
          text={text()}
          setText={setText}
          send={genAns}
          // 自动聚焦
          onMountHandler={(inputDiv: HTMLTextAreaElement) => {
            inputDiv.focus()
          }}
          // onShow自动聚焦
          autoFocusWhenShow
        />
      </div>
    </div>
  )
}
