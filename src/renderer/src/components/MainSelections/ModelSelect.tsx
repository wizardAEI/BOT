import ChatGptIcon from '@renderer/assets/icon/models/ChatGptIcon'
import WenxinIcon from '@renderer/assets/icon/models/WenxinIcon'
import QWenIcon from '@renderer/assets/icon/models/QWenIcon'
import { setSelectedModel, userData } from '@renderer/store/user'
import { createMemo, createSignal, For, onCleanup, Show } from 'solid-js'
import type { JSXElement } from 'solid-js'
import {
  getCustomModelSelected,
  setCustomModelSelected,
  settingStore
} from '@renderer/store/setting'
import { ModelsType, modelDict } from '@lib/langchain'
import GeminiIcon from '@renderer/assets/icon/models/GeminiIcon'
import KimiIcon from '@renderer/assets/icon/models/KimiIcon'
import LlamaIcon from '@renderer/assets/icon/models/LlamaIcon'
import OllamaIcon from '@renderer/assets/icon/models/OllamaIcon'
import CustomIcon from '@renderer/assets/icon/models/CustomIcon'
import DeepSeekIcon from '@renderer/assets/icon/models/DeepSeekIcon'
import ClaudeIcon from '@renderer/assets/icon/models/ClaudeIcon'

import ScrollBox from '../ScrollBox'

export function getModelOptions() {
  const options: {
    label: JSXElement
    icon: (size: number) => JSXElement
    value: ModelsType
    maxToken: number
    selected?: string
  }[] = [
  ]

  if (settingStore.models.OpenAI.customModel) {
    options.push({
      label: <span class="text-current">{modelDict['GPTCustom'].label}</span>,
      icon(size: number) {
        return (
          <ChatGptIcon
            width={size}
            height={size}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'GPTCustom',
      maxToken: modelDict['GeminiCustom'].maxToken
    })
  }
  
  if(settingStore.models.BaiduWenxin.apiKey) {
    options.push(
      {
        label: <span>{modelDict['ERNIE3'].label}</span>,
        icon(size: number) {
          return (
            <WenxinIcon
              width={size}
              height={size}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'ERNIE3',
        maxToken: modelDict['ERNIE3'].maxToken
      },
      {
        label: <span>{modelDict['ERNIE4'].label}</span>,
        icon(size: number) {
          return (
            <WenxinIcon
              width={size}
              height={size}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'ERNIE4',
        maxToken: modelDict['ERNIE4'].maxToken
      },
      {
        label: <span>{modelDict['ERNIE128K'].label}</span>,
        icon(size: number) {
          return (
            <WenxinIcon
              width={size}
              height={size}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'ERNIE128K',
        maxToken: modelDict['ERNIE128K'].maxToken
      }
    )
  }

  if (settingStore.models.DeepSeek.apiKey) {
    options.push(
      {
        label: <span>{modelDict['DeepSeekChat'].label}</span>,
        icon(size: number) {
          return (
            <DeepSeekIcon
              width={size}
              height={size}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'DeepSeekChat',
        maxToken: modelDict['DeepSeekChat'].maxToken
      },
      {
        label: <span>{modelDict['DeepSeekCoder'].label}</span>,
        icon(size: number) {
          return (
            <DeepSeekIcon
              width={size}
              height={size}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'DeepSeekCoder',
        maxToken: modelDict['DeepSeekCoder'].maxToken
      }
    )
  }

  if (settingStore.models.AliQWen.apiKey) {
    options.push(
      {
        label: <span>{modelDict['QWenTurbo'].label}</span>,
        icon(size: number) {
          return (
            <QWenIcon
              width={size - 2}
              height={size - 2}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'QWenTurbo',
        maxToken: modelDict['QWenTurbo'].maxToken
      },
      {
        label: <span>{modelDict['QWenMax'].label}</span>,
        icon(size: number) {
          return (
            <QWenIcon
              width={size - 2}
              height={size - 2}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'QWenMax',
        maxToken: modelDict['QWenMax'].maxToken
      },
      {
        label: <span>{modelDict['QWenLong'].label}</span>,
        icon(size: number) {
          return (
            <QWenIcon
              width={size - 2}
              height={size - 2}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'QWenLong',
        maxToken: modelDict['QWenLong'].maxToken
      }
    )
  }

  if (settingStore.models.Gemini.apiKey) {
    options.push({
      label: <span>{modelDict['GeminiPro'].label}</span>,
      icon(size: number) {
        return (
          <GeminiIcon
            width={size}
            height={size}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'GeminiPro',
      maxToken: modelDict['GeminiPro'].maxToken
    })
  }

  if (settingStore.models.Gemini.customModel) {
    options.push({
      label: <span>{modelDict['GeminiCustom'].label}</span>,
      icon(size: number) {
        return (
          <GeminiIcon
            width={size}
            height={size}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'GeminiCustom',
      maxToken: modelDict['GeminiCustom'].maxToken
    })
  }

  if (settingStore.models.Llama.src) {
    options.push({
      label: <span>{modelDict['Llama'].label}</span>,
      icon(size: number) {
        return (
          <LlamaIcon
            width={size - 1}
            height={size - 1}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'Llama',
      maxToken: modelDict['Llama'].maxToken
    })
  }

  if (settingStore.models.Moonshot.apiKey) {
    options.push(
      {
        label: <span>{modelDict['Moonshot8k'].label}</span>,
        icon(size: number) {
          return (
            <KimiIcon
              width={size}
              height={size}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'Moonshot8k',
        maxToken: modelDict['Moonshot8k'].maxToken
      },
      {
        label: <span>{modelDict['Moonshot32k'].label}</span>,
        icon(size: number) {
          return (
            <KimiIcon
              width={size}
              height={size}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'Moonshot32k',
        maxToken: modelDict['Moonshot32k'].maxToken
      },
      {
        label: <span>{modelDict['Moonshot128k'].label}</span>,
        icon(size: number) {
          return (
            <KimiIcon
              width={size}
              height={size}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'Moonshot128k',
        maxToken: modelDict['Moonshot128k'].maxToken
      }
    )
  }

  if (settingStore.models.Ollama.address && settingStore.models.Ollama.model) {
    options.push({
      label: <span>{modelDict['Ollama'].label}</span>,
      icon(size: number) {
        return (
          <OllamaIcon
            width={size - 1}
            height={size - 1}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'Ollama',
      maxToken: modelDict['Ollama'].maxToken
    })
  }

  if (settingStore.models.Ollama.address && settingStore.models.Ollama.model1) {
    options.push({
      label: <span>{modelDict['Ollama1'].label}</span>,
      icon(size: number) {
        return (
          <OllamaIcon
            width={size - 1}
            height={size - 1}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'Ollama1',
      maxToken: modelDict['Ollama'].maxToken
    })
  }

  if (settingStore.models.Ollama.address && settingStore.models.Ollama.model2) {
    options.push({
      label: <span>{modelDict['Ollama2'].label}</span>,
      icon(size: number) {
        return (
          <OllamaIcon
            width={size - 1}
            height={size - 1}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'Ollama2',
      maxToken: modelDict['Ollama'].maxToken
    })
  }

  if (settingStore.models.Claude.apiKey) {
    options.push(
      {
        label: <span>{modelDict['ClaudeHaiku'].label}</span>,
        icon(size: number) {
          return (
            <ClaudeIcon
              width={size}
              height={size}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'ClaudeHaiku',
        maxToken: modelDict['ClaudeHaiku'].maxToken
      },
      {
        label: <span>{modelDict['ClaudeOpus'].label}</span>,
        icon(size: number) {
          return (
            <ClaudeIcon
              width={size}
              height={size}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'ClaudeOpus',
        maxToken: modelDict['ClaudeOpus'].maxToken
      },
      {
        label: <span>{modelDict['ClaudeSonnet'].label}</span>,
        icon(size: number) {
          return (
            <ClaudeIcon
              width={size}
              height={size}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'ClaudeSonnet',
        maxToken: modelDict['ClaudeSonnet'].maxToken
      }
    )
  }

  if (settingStore.models.OpenAI.apiKey || options.length === 0) {
    options.unshift({
      label: <span class="text-current">{modelDict['GPT3'].label}</span>,
      icon(size: number) {
        return (
          <ChatGptIcon
            width={size}
            height={size}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'GPT3',
      maxToken: modelDict['GPT3'].maxToken
    },
    {
      label: <span class="text-current">{modelDict['GPT4'].label}</span>,
      icon(size: number) {
        return (
          <ChatGptIcon
            width={size}
            height={size}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'GPT4',
      maxToken: modelDict['GPT4'].maxToken
    },
    {
      label: <span class="text-current">{modelDict['GPTMINI'].label}</span>,
      icon(size: number) {
        return (
          <ChatGptIcon
            width={size}
            height={size}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'GPTMINI',
      maxToken: modelDict['GPTMINI'].maxToken
    })
  }

  settingStore.models.CustomModel.models.forEach((m) => {
    if (m.apiKey && m.customModel) {
      options.push({
        label: (
          <span class="max-w-32 overflow-hidden text-ellipsis text-nowrap">{m.customModel}</span>
        ),
        icon(size: number) {
          return (
            <CustomIcon
              width={size}
              height={size}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'CustomModel',
        selected: m.customModel,
        maxToken: modelDict['CustomModel'].maxToken
      })
    }
  })

  return options
}

export default function ModelSelect(props: {
  position: string
  size?: number
  translate?: string
}) {
  const options = getModelOptions()
  // 使用 createSignal 来管理下拉菜单的显示状态
  const [isOpen, setIsOpen] = createSignal(false)
  // 使用 createSignal 来管理选中的值
  // 选择选项的处理函数
  const handleSelect = (option: ReturnType<typeof getModelOptions>[number]) => {
    setSelectedModel(option.value)
    if (option.selected !== undefined && option.value === 'CustomModel') {
      setCustomModelSelected(option.selected)
    }
  }
  const label = createMemo(() => {
    return (
      options.find((opt) => opt.value === userData.selectedModel)?.icon(props.size || 20) ?? (
        <ChatGptIcon />
      )
    )
  })
  const selected = (option: ReturnType<typeof getModelOptions>[number]) => {
    if (option.selected !== undefined && userData.selectedModel === 'CustomModel') {
      return option.selected === getCustomModelSelected()
    }
    return userData.selectedModel === option.value
  }
  return (
    <>
      <div
        ref={(el) => {
          const fn = (e) => {
            if (e.target && el.contains(e.target)) {
              setIsOpen((i) => !i)
              e.stopPropagation()
              return
            }
            setIsOpen(false)
          }
          document.addEventListener('click', fn)
          onCleanup(() => {
            document.removeEventListener('click', fn)
          })
        }}
        class="flex cursor-pointer"
      >
        {label()}
      </div>
      <Show when={isOpen()}>
        <div
          class={`absolute z-10 mt-3 flex-col rounded-md bg-dark-plus px-1 shadow-center ${
            props.position
          } ${props.translate || ''} h-[278px] w-60`}
        >
          <ScrollBox>
            <div class="w-full px-1">
              <div class="mt-2 h-1" />
              <For each={options}>
                {(option) => (
                  <div
                    class={`mb-1 w-full cursor-pointer break-words rounded-lg py-1 pl-2 ${
                      selected(option) ? 'bg-active' : ''
                    } duration-100 hover:bg-active hover:text-text-active
                `}
                    onClick={() => handleSelect(option)}
                  >
                    <div
                      class={`flex items-center justify-between pr-2 ${selected(option) && 'text-text-active'}`}
                    >
                      <div class="flex select-none gap-2">
                        {option.icon(20)}
                        {option.label}
                      </div>
                      <Show
                        when={option.maxToken}
                        fallback={'🧩 🧩'}
                      >{`${(option.maxToken / 1000).toFixed(0)} K`}</Show>
                    </div>
                  </div>
                )}
              </For>
              <div class="mb-1 h-1" />
            </div>
          </ScrollBox>
        </div>
      </Show>
    </>
  )
}
