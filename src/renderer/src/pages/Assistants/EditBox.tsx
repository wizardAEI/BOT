import { modelDict } from '@lib/langchain'
import { getModelOptions } from '@renderer/components/MainSelections/ModelSelect'
import BotIcon from '@renderer/components/ui/BotIcon'
import Button from '@renderer/components/ui/Button'
import QuestionMention from '@renderer/components/ui/QuestionMention'
import Select from '@renderer/components/ui/Select'
import { useToast } from '@renderer/components/ui/Toast'
import { getRandomString } from '@renderer/lib/util'
import { createSignal } from 'solid-js'
import type { JSXElement } from 'solid-js'
import { AssistantModel } from 'src/main/models/model'

function Field(props: { title: string; children: JSXElement }) {
  return (
    <div class="my-2 flex flex-col gap-2">
      <span class="font-medium">{props.title}</span>
      {props.children}
    </div>
  )
}

export default function EditBox(props: {
  assistant: AssistantModel
  onCancel: () => void
  onSave: (a: AssistantModel) => void
}) {
  // eslint-disable-next-line solid/reactivity
  const [a, setA] = createSignal(props.assistant)
  const toast = useToast()
  function setField(key: keyof AssistantModel, value: unknown) {
    setA({
      ...a(),
      [key]: value
    })
  }
  const options = getModelOptions().map((m) => {
    console.log(m)
    if (m.value === 'CustomModel') {
      return {
        label: m.selected,
        value: `CustomModel-${m.selected}`
      }
    }
    return {
      label: modelDict[m.value].label,
      value: m.value
    }
  })
  return (
    <div class="relative mx-2 my-4 rounded-2xl bg-dark p-4 duration-150">
      <div class="mb-2 flex items-center gap-4 md:justify-center">
        <div
          class="relative flex cursor-pointer"
          onClick={() => {
            const seed = getRandomString(5)
            console.log(seed)
            setField('avatar', seed)
          }}
        >
          <BotIcon size={60} seed={a().avatar || a().id.slice(-5)} />
          <div class="absolute -top-0 right-0 z-10 flex h-full w-full items-center justify-center rounded-full bg-black/30 text-xs text-text1/80 opacity-0 duration-200 hover:opacity-100">
            点击随机
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <span class="font-medium">助手名称</span>
          <input
            type="text"
            value={a().name}
            onChange={(e) => setField('name', e.currentTarget.value)}
            placeholder="助手名称"
          />
        </div>
      </div>
      <div class="item-center relative mb-2 mt-3 flex w-full justify-between md:justify-center">
        <span class="flex items-center font-medium">
          {' '}
          <div class="flex gap-1">
            助手偏好模型
            <QuestionMention content="选择助手偏好模型后，下次使用助手时，将自动切换该模型" />
          </div>
        </span>
        <div class="max-w-[180px] pl-4">
          <Select
            defaultValue={a().matchModel || 'current'}
            options={[
              {
                value: 'current',
                label: '跟随当前模型'
              },
              ...options
            ]}
            onSelect={(v) => {
              setField('matchModel', v)
            }}
          />
        </div>
      </div>
      <Field title="介绍">
        {/* <input
          type="text"
          value={a().introduce ?? ''}
          onChange={(e) => setField('introduce', e.currentTarget.value)}
          placeholder=""
        /> */}
        <textarea
          class="text-sm"
          rows={3}
          value={a().introduce ?? ''}
          onChange={(e) => setField('introduce', e.currentTarget.value)}
          placeholder="可不填"
        />
      </Field>
      <Field title="提示（Prompt）">
        <textarea
          class="text-sm"
          rows={4}
          value={a().prompt}
          onChange={(e) => setField('prompt', e.currentTarget.value)}
          placeholder="告诉助手要做什么吧"
        />
      </Field>
      <div class="mt-3 flex justify-around">
        <Button
          onClick={() => {
            props.onCancel()
          }}
        >
          取消
        </Button>
        <Button
          onClick={() => {
            if (!a().name) {
              toast.warning('助手名称不能为空')
              return
            }
            if (!a().prompt) {
              toast.warning('提示不能为空')
              return
            }
            props.onSave(a())
          }}
        >
          保存
        </Button>
      </div>
    </div>
  )
}
