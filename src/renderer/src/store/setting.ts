import { createStore, produce, unwrap } from 'solid-js/store'
import { isEqual, merge, cloneDeep } from 'lodash'
import { event, getSystem } from '@renderer/lib/util'
import { defaultModels } from '@lib/langchain'
import { Models } from 'src/lib/langchain'
import { createMemo } from 'solid-js'
import { SettingFontFamily, SettingModel } from 'src/main/models/model'
const [settingStore, setSettingStore] = createStore<
  {
    isLoaded: boolean
    oldModels: Models
  } & SettingModel
>({
  isOnTop: false,
  isLoaded: false,
  models: defaultModels(),
  oldModels: defaultModels(),
  quicklyAnsKey: 'C',
  quicklyWakeUpKeys: '',
  sendWithCmdOrCtrl: false,
  theme: 'gomoon-theme',
  chatFontSize: 14,
  fontFamily: 'default',
  openAtLogin: false
})

export function setIsOnTop(v: boolean) {
  setSettingStore('isOnTop', v)
  return window.api.setIsOnTop(v as boolean)
}

export function setQuicklyAnsKey(v: string) {
  setSettingStore('quicklyAnsKey', v)
  return window.api.setQuicklyAnsKey(v)
}

export function setQuicklyWakeUpKeys(v: string) {
  setSettingStore('quicklyWakeUpKeys', v)
  return window.api.setQuicklyWakeUpKeys(v)
}

export function setSendWithCmdOrCtrl(v: boolean) {
  setSettingStore('sendWithCmdOrCtrl', v)
  return window.api.setSendWithCmdOrCtrl(v)
}

export async function setTheme(theme: string) {
  setSettingStore('theme', theme)
  return window.api.setTheme(theme)
}

export async function setFontFamily(fontFamily: SettingFontFamily) {
  setSettingStore('fontFamily', fontFamily)
  return window.api.setChatFontFamily(fontFamily)
}

export async function setOpenAtLogin(v: boolean) {
  setSettingStore('openAtLogin', v)
  return window.api.setOpenAtLogin(v)
}

export async function loadConfig() {
  const config = await window.api.loadConfig()
  // 从 data 中读取配置
  setSettingStore('isOnTop', config.isOnTop)
  setSettingStore('models', merge(unwrap(settingStore.models), config.models))
  setSettingStore('oldModels', cloneDeep(config.models))
  setSettingStore('quicklyAnsKey', config.quicklyAnsKey)
  setSettingStore('quicklyWakeUpKeys', config.quicklyWakeUpKeys)
  setSettingStore('sendWithCmdOrCtrl', config.sendWithCmdOrCtrl)
  setSettingStore('isLoaded', true)
  setSettingStore('theme', config.theme)
  setSettingStore('chatFontSize', config.chatFontSize)
  setSettingStore('fontFamily', config.fontFamily)
  setSettingStore('openAtLogin', config.openAtLogin)
  event.emit('updateModels', config.models)
}

export async function setModels<T extends keyof Models>(
  v: Models[T][keyof Models[T]],
  modelName: T,
  field: keyof Models[T]
) {
  setSettingStore(
    'models',
    modelName,
    produce((b) => {
      b[field] = v
    })
  )
}

export async function setCustomModelSelected(selectModel: string) {
  setSettingStore('models', 'CustomModel', 'selectModel', selectModel)
  const config = unwrap(settingStore)
  if (isEqual(config.models, config.oldModels)) return
  await window.api.setModels(config.models)
  loadConfig()
}
export function getCustomModelSelected() {
  return settingStore.models.CustomModel.selectModel
}

export function setCustomModels(models: Models['CustomModel']['models']) {
  setSettingStore('models', 'CustomModel', 'models', models)
}

export async function updateModelsToFile() {
  const config = unwrap(settingStore)
  if (isEqual(config.models, config.oldModels)) return
  await window.api.setModels(config.models)
  loadConfig()
}

export async function setChatFontSize(v: number) {
  setSettingStore('chatFontSize', v)
  return window.api.setChatFontSize(v)
}

export { settingStore, setSettingStore }

export interface UpdaterStore {
  updateStatus: {
    canUpdate: boolean
    haveDownloaded: boolean
    updateProgress: number
    version: string
  }
}

const [updaterStore, setUpdaterStore] = createStore<UpdaterStore>({
  updateStatus: {
    canUpdate: false,
    haveDownloaded: false,
    updateProgress: 0,
    version: ''
  }
})
export function setUpdaterStatus(status: Partial<UpdaterStore['updateStatus']>) {
  setUpdaterStore(
    produce((s) => {
      s.updateStatus = {
        ...s.updateStatus,
        ...status
      }
    })
  )
}

export const updateStatusLabel = createMemo(() => {
  const dict = {
    canUpdate: '有新版本,点击下载！',
    updateProgress:
      '下载中: ' + updaterStore.updateStatus.updateProgress + '%（请不要中途退出应用）',
    haveDownloaded: getSystem() === 'mac' ? '下载完成，请手动安装' : '新版本下载完成,立即安装！'
  }
  let label = '检查更新'
  for (const key in dict) {
    if (updaterStore.updateStatus[key]) {
      label = dict[key]
    }
  }
  return label
})

export async function updateVersion() {
  if (updaterStore.updateStatus.haveDownloaded) {
    if (getSystem() === 'mac') {
      return true
    }
    window.api.quitForUpdate()
    return true
  }
  if (
    updaterStore.updateStatus.updateProgress > 0 &&
    updaterStore.updateStatus.updateProgress < 100
  ) {
    return true
  }
  if (updaterStore.updateStatus.canUpdate) {
    setUpdaterStatus({ updateProgress: 1 })
    window.api.downloadUpdate().then((res) => {
      if (res.length) {
        setUpdaterStatus({ haveDownloaded: true })
      }
    })
    return true
  }
  const res = await window.api.checkUpdate()
  if (res) {
    setUpdaterStatus({ canUpdate: true })
  } else {
    return false
  }
  return true
}

export { updaterStore as systemStore }
