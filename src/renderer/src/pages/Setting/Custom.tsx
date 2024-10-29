import Plus from '@renderer/assets/icon/base/Plus'
import TrashIcon from '@renderer/assets/icon/TrashIcon'
import EditInput from '@renderer/components/ui/EditInput'
import Slider from '@renderer/components/ui/Slider'
import { setCustomModels, settingStore } from '@renderer/store/setting'
import { cloneDeep } from 'lodash'
import { For, Show } from 'solid-js'

export default function () {
  return (
    <>
      <For each={settingStore.models.CustomModel.models}>
        {(c, index) => {
          let editBox: HTMLDivElement | undefined
          return (
            <>
              <Show when={index() !== 0}>
                <div
                  onClick={() => {
                    const arr = cloneDeep(settingStore.models.CustomModel.models)
                    arr.splice(index(), 1)
                    console.log(arr)
                    setCustomModels(arr)
                  }}
                  onMouseEnter={() => {
                    editBox!.style.opacity = '0.3'
                  }}
                  onMouseLeave={() => {
                    editBox!.style.opacity = ''
                  }}
                  class="group flex cursor-pointer items-center gap-1"
                >
                  <div class="my-1 flex-1 border-y border-dashed border-gray/80 duration-200 group-hover:border-danger" />
                  <TrashIcon class="text-danger duration-200" width={20} height={20} />
                  <div class="my-1 flex-1 border-y border-dashed border-gray/80 duration-200 group-hover:border-danger" />
                </div>
              </Show>
              <div class="flex flex-col" ref={editBox}>
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
              </div>
            </>
          )
        }}
      </For>
      <div class="group flex cursor-pointer items-center gap-1">
        <div class="my-1 flex-1 border-y border-dashed border-gray/80 duration-200 group-hover:border-active" />
        <Plus
          class="cursor-pointer text-gray duration-200 group-hover:text-active"
          width={20}
          height={20}
          onClick={() => {
            const arr = cloneDeep(settingStore.models.CustomModel.models)
            arr.push({
              apiKey: '',
              baseURL: '',
              temperature: 0.3,
              customModel: ''
            })
            setCustomModels(arr)
          }}
        />
        <div class="my-1 flex-1 border-y border-dashed border-gray/80 duration-200 group-hover:border-active" />
      </div>
    </>
  )
}
