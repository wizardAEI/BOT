import { ChatBaiduWenxin } from 'langchain/chat_models/baiduwenxin'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { ChatPromptTemplate } from 'langchain/prompts'
import { AIMessage, HumanMessage, SystemMessage } from 'langchain/schema'
import { models } from './models'
import { userData } from '@renderer/store/user'
import {
  getCurrentAssistantForAnswer,
  getCurrentAssistantForChat
} from '@renderer/store/assistants'

export type Roles = 'human' | 'system' | 'ai'

const msgDict = {
  human: (s: string) => new HumanMessage(s),
  system: (s: string) => new SystemMessage(s),
  ai: (s: string) => new AIMessage(s)
} as const

const createModel = (chat: ChatBaiduWenxin | ChatOpenAI) => {
  return {
    async answer(
      msg: {
        systemTemplate: string
        humanTemplate: string
        args: {
          [key: string]: string
        }
      },
      option: {
        newTokenCallback: (content: string) => void
        endCallback?: () => void
        errorCallback?: (err: any) => void
        pauseSignal: AbortSignal
      }
    ) {
      const { args, systemTemplate, humanTemplate } = msg
      const prompt = await ChatPromptTemplate.fromMessages([
        ['system', systemTemplate],
        ['human', humanTemplate || '...']
      ]).formatMessages(args)
      return chat.call(prompt, {
        callbacks: [
          {
            handleLLMNewToken(token) {
              option.newTokenCallback(token)
            },
            handleLLMEnd() {
              option.endCallback?.()
            },
            handleLLMError(err, runId, parentRunId, tags) {
              option.errorCallback?.(err)
              console.error('answer error: ', err, runId, parentRunId, tags)
            }
          }
        ],
        signal: option.pauseSignal,
        timeout: 1000 * 10
      })
    },
    async chat(
      msgs: {
        role: Roles
        content: string
      }[],
      option: {
        newTokenCallback: (content: string) => void
        endCallback?: () => void
        errorCallback?: (err: any) => void
        pauseSignal: AbortSignal
      }
    ) {
      return chat.call(
        msgs.map((msg) => msgDict[msg.role](msg.content || '...')),
        {
          callbacks: [
            {
              handleLLMNewToken(token) {
                option.newTokenCallback(token)
              },
              handleLLMError(err, runId, parentRunId, tags) {
                console.error('chat error: ', err, runId, parentRunId, tags)
                option.errorCallback?.(err)
              },
              handleLLMEnd() {
                option.endCallback?.()
              }
            }
          ],
          signal: option.pauseSignal
        }
      )
    }
  }
}

// TODO: 读取 assistant 信息来生成，可以从本地读取，也可以从远程读取

/**
 * FEAT: Answer Assistant
 */
export const ansAssistant = async (
  args: {
    [key: string]: string
  },
  option: {
    newTokenCallback: (content: string) => void
    endCallback?: () => void
    errorCallback?: (err: any) => void
    pauseSignal: AbortSignal
  }
) => {
  const a = getCurrentAssistantForAnswer()
  const preContent = a.type === 'ans' ? a.preContent ?? '' : ''
  const postContent = a.type === 'ans' ? a.postContent ?? '' : ''
  return createModel(models[userData.selectedModel]).answer(
    {
      systemTemplate: a.prompt,
      // TODO: 拓展问答助手功能，可以自定义模板
      humanTemplate: `${preContent}{text}${postContent}`,
      args
    },
    option
  )
}

/**
 * FEAT: Chat Assistant
 */
export const chatAssistant = async (
  msgs: {
    role: Roles
    content: string
  }[],
  option: {
    newTokenCallback: (content: string) => void
    endCallback?: () => void
    errorCallback?: (err: any) => void
    pauseSignal: AbortSignal
  }
) =>
  createModel(models[userData.selectedModel]).chat(
    [
      {
        role: 'system',
        content: getCurrentAssistantForChat().prompt
      },
      ...msgs
    ],
    option
  )