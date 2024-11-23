import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { autoUpdater } from 'electron-updater'

import {
  addHistory,
  createAssistant,
  deleteAssistant,
  deleteHistory,
  getAssistants,
  getHistories,
  getUserData,
  loadAppConfig,
  setQuicklyWakeUpKeys,
  setIsOnTop,
  setModels,
  setSendWithCmdOrCtrl,
  updateAssistant,
  updateUserData,
  useAssistant,
  getLines,
  getMemories,
  useMemo,
  setTheme,
  setHistoryStar,
  clearHistory,
  setChatFontSize,
  getCollections,
  createCollection,
  deleteCollection,
  updateCollection,
  setFontFamily,
  setOpenAtLogin,
  stickTopCollection,
  setQuicklyAnsKey
} from './models/index'
import {
  AssistantModel,
  CollectionModel,
  CreateAssistantModel,
  CreateCollectionModel,
  HistoryModel,
  MemoFragment,
  MemoModel,
  SettingFontFamily,
  SettingModel,
  UserDataModel
} from './models/model'
import {
  checkUpdate,
  hideWindow,
  isMaximized,
  maximize,
  minimize,
  setQuicklyAns,
  setQuicklyWakeUp,
  unmaximize,
  updateRespHeaders,
  updateSendHeaders
} from './window'
import parseFile, { FilePayload } from './lib/ai/fileLoader'
import { parseURL2Str } from './lib/ai/parseURL'
import { isValidUrl } from './lib/utils'
import { quitApp, saveFile } from './lib'
import { tokenize } from './lib/ai/embedding/embedding'
import {
  EditFragmentOption,
  GetMemoParams,
  SaveMemoParams,
  cancelSaveMemo,
  dropMemo,
  editFragment,
  editMemo,
  exportMemo,
  getMemo,
  importMemo,
  saveMemo
} from './lib/ai/embedding/index'
import { speak } from './lib/ai/tts'
import { callLLM, CallLLmOption, stopLLM } from './lib/ai/langchain'
import { checkModelsSvc, initMemoriesSvc, updateForMac } from './service'

export function initAppEventsHandler() {
  /**
   * FEAT: 配置相关(特指配置页的信息)
   */
  let preBaseUrls: string[] = []
  ipcMain.handle('load-config', () => {
    const config = loadAppConfig()
    const urls: string[] = []
    if (isValidUrl(config.models.OpenAI.baseURL)) {
      urls.push(config.models.OpenAI.baseURL)
    }
    if (urls.toString() !== preBaseUrls.toString()) {
      updateSendHeaders(urls)
      updateRespHeaders(urls, {
        cspItems: {
          'connect-src': urls
        }
      })
      preBaseUrls = urls
    }
    return config
  })
  ipcMain.handle('set-is-on-top', (e, isOnTop: boolean) => {
    const mainWindow = BrowserWindow.fromWebContents(e.sender)
    mainWindow!.setAlwaysOnTop(isOnTop, 'status')
    setIsOnTop(isOnTop)
    return mainWindow!.isAlwaysOnTop()
  })
  ipcMain.handle('set-models', (_, models: SettingModel['models']) => {
    const urls: string[] = []
    if (isValidUrl(models.OpenAI.baseURL)) {
      urls.push(models.OpenAI.baseURL)
    }
    if (isValidUrl(models.Ollama.address)) {
      urls.push(models.Ollama.address)
    }
    if (urls.toString() !== preBaseUrls.toString()) {
      updateSendHeaders(urls)
      updateRespHeaders(urls, {
        cspItems: {
          'connect-src': urls
        }
      })
      preBaseUrls = urls
    }
    setModels(models)
  })
  ipcMain.handle('set-quickly-ans-key', (_, key: string) => {
    setQuicklyAnsKey(key)
    setQuicklyAns(key)
  })
  ipcMain.handle('set-quickly-wake-up-keys', (_, keys: string) => {
    setQuicklyWakeUpKeys(keys)
    setQuicklyWakeUp(keys)
  })
  ipcMain.handle('set-send-with-cmd-or-ctrl', (_, b: boolean) => setSendWithCmdOrCtrl(b))
  ipcMain.handle('set-theme', (_, theme: string) => setTheme(theme))
  ipcMain.handle('set-chat-fontsize', (_, v: number) => setChatFontSize(v))
  ipcMain.handle('set-font-family', (_, v: SettingFontFamily) => setFontFamily(v))
  ipcMain.handle('set-open-at-login', (_, v: boolean) => {
    app.setLoginItemSettings({
      openAtLogin: v //是否开机启动
    })
    setOpenAtLogin(v)
  })

  /**
   * FEAT: 用户相关
   */
  ipcMain.handle('set-user-data', (_, data: Partial<UserDataModel>) => updateUserData(data))
  ipcMain.handle('get-user-data', () => getUserData())

  /**
   * FEAT: assistant 相关
   */
  ipcMain.handle('get-assistants', () => getAssistants())
  ipcMain.handle('update-assistant', (_, a: AssistantModel) => updateAssistant(a))
  ipcMain.handle('delete-assistant', (_, id: string) => deleteAssistant(id))
  ipcMain.handle('create-assistant', (_, a: CreateAssistantModel) => createAssistant(a))
  ipcMain.handle('use-assistant', (_, id: string) => useAssistant(id))

  /**
   * FEAT: history 相关
   */
  ipcMain.handle('get-histories', () => getHistories())
  ipcMain.handle('add-history', (_, history: HistoryModel) => addHistory(history))
  ipcMain.handle('delete-history', (_, id: string) => deleteHistory(id))
  ipcMain.handle('set-history-star', (_, id: string, starred: boolean) =>
    setHistoryStar(id, starred)
  )
  ipcMain.handle('clear-history', () => clearHistory())

  /**
   * FEAT: memory 相关
   */
  ipcMain.handle('get-memories', () => getMemories())
  ipcMain.handle('edit-fragment', (_, option: EditFragmentOption) => editFragment(option))
  ipcMain.handle('save-memory', (_, option: SaveMemoParams) => saveMemo(option))
  ipcMain.handle('edit-memory', (_, id: string, fragments: MemoFragment[]) =>
    editMemo(id, fragments)
  )
  ipcMain.handle('delete-memory', (_, id: string) => dropMemo(id))
  ipcMain.handle('cancel-save-memory', (_, id: string) => cancelSaveMemo(id))
  ipcMain.handle('use-memory', (_, id: string) => useMemo(id))
  ipcMain.handle('get-memory-data', (_, data: GetMemoParams) => getMemo(data))
  ipcMain.handle('check-embedding-model', () => checkModelsSvc())
  ipcMain.handle('init-memories', () => initMemoriesSvc())
  ipcMain.handle('export-memory', (_, memo: MemoModel) => exportMemo(memo))
  ipcMain.handle('import-memory', (_, path: string) => importMemo(path))

  /**
   * FEAT: 合集相关
   */
  ipcMain.handle('get-collections', () => getCollections())
  ipcMain.handle('create-collection', (_, collection: CreateCollectionModel) =>
    createCollection(collection)
  )
  ipcMain.handle('delete-collection', (_, id: string) => deleteCollection(id))
  ipcMain.handle('stick-top-collection', (_, id: string) => stickTopCollection(id))
  ipcMain.handle('update-collection', (_, collection: CollectionModel) =>
    updateCollection(collection)
  )

  // 文件相关
  ipcMain.handle('parse-file', (_, files: FilePayload[]) => parseFile(files))
  ipcMain.handle('open-path', (_, path: string) => {
    shell.openPath(path)
  })
  ipcMain.handle('save-file', async (e, fileName: string, content: string) => {
    const mainWindow = BrowserWindow.fromWebContents(e.sender)
    mainWindow!.setAlwaysOnTop(false, 'status')
    await saveFile(fileName, content)
    mainWindow!.setAlwaysOnTop(loadAppConfig().isOnTop, 'status')
  })
  ipcMain.handle('get-token-num', async (_, content: string) => {
    if (content === '') return 0
    // 大于5000只求5000字作为平均数
    if (content.length > 5000) {
      const partTokenLen =
        (
          await tokenize(
            content.replaceAll(/<gomoon-image (.*?)>(.*?)<\/gomoon-image>/g, '').slice(0, 3000)
          )
        ).length || 0
      return Math.round(partTokenLen / (partTokenLen / content.length))
    }
    return (
      (
        await tokenize(
          content.replaceAll(/<gomoon-image (.*?)>(.*?)<\/gomoon-image>/g, '').slice(0, 3000)
        )
      ).length || 0
    )
  })

  // 升级
  ipcMain.handle('check-update', async () => {
    return await checkUpdate()
  })
  ipcMain.handle('quit-for-update', async () => {
    await quitApp.quit()
    autoUpdater.quitAndInstall(true, true)
  })
  ipcMain.handle('download-update', async () => {
    if (process.platform === 'win32') {
      return await autoUpdater.downloadUpdate()
    }
    updateForMac()
  })

  // 大模型调用
  ipcMain.handle('call-llm', (_, options: CallLLmOption) => callLLM(options))
  ipcMain.handle('stop-llm', () => stopLLM())

  // 其他
  ipcMain.handle('hide-window', () => hideWindow())
  ipcMain.handle('minimize-window', () => minimize())
  ipcMain.handle('maximize-window', () => maximize())
  ipcMain.handle('unmaximize-window', () => unmaximize())
  ipcMain.handle('is-maximized', () => isMaximized())
  ipcMain.handle('get-lines', () => getLines())
  ipcMain.handle('parse-page-to-string', (_, url: string) => parseURL2Str(url))
  ipcMain.handle('speak', (_, text: string) => speak(text))
}
