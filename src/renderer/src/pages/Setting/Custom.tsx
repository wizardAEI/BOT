import EditInput from '@renderer/components/ui/EditInput'
import Slider from '@renderer/components/ui/Slider'
import { setCustomModels, settingStore } from '@renderer/store/setting'
import { cloneDeep } from 'lodash'
import { For } from 'solid-js'

export default function () {
  return (
    <>
      <For each={settingStore.models.CustomModel.models}>
        {(c, index) => {
          return (
            <>
              <EditInput
                label="模型名"
                value={c.customModel}
                onSave={(v) => {
                  const arr = cloneDeep(settingStore.models.CustomModel.models)
                  arr[index()].customModel = v.trim()
                  setCustomModels(arr)
                }}
              />
              <EditInput
                label="apiKey"
                value={c.apiKey}
                onSave={(v) => {
                  const arr = cloneDeep(settingStore.models.CustomModel.models)
                  arr[index()].apiKey = v.trim()
                  setCustomModels(arr)
                }}
              />
              <EditInput
                label="baseURL"
                value={c.baseURL}
                onSave={(v) => {
                  const arr = cloneDeep(settingStore.models.CustomModel.models)
                  arr[index()].baseURL = v.trim()
                  setCustomModels(arr)
                }}
              />
              <div class="mb-1 flex h-7 items-center gap-4">
                <span class="font-bold">创造性/随机性</span>
                <div class="w-60">
                  <Slider
                    value={c.temperature}
                    percentage
                    onChange={(v) => {
                      const arr = cloneDeep(settingStore.models.CustomModel.models)
                      arr[index()].temperature = v
                      setCustomModels(arr)
                    }}
                  />
                </div>
              </div>
            </>
          )
        }}
      </For>
    </>
  )
}
