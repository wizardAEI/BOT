// import puppeteer from 'puppeteer'
import fetch from 'node-fetch'
import { load } from 'cheerio'
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
import { BrowserWindow } from 'electron'
// TODO: 转md
export async function parseURL2Str(url: string): Promise<string> {
  const html = await fetch(url, {
    timeout: 10000
  })
    .then((res) => res.text())
    .catch((e) => {
      return e.message
    })
  let $ = load(html)
  let doc = new Readability(new JSDOM($.html()).window.document).parse()
  if (doc && doc?.textContent.length > 150 && doc.siteName !== '微信公众平台') {
    return `${doc.title}\n\n` + doc.textContent
  }

  let tempWin = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    show: false
  })
  tempWin.minimize()
  try {
    tempWin.loadURL(url)
    const res = await tempWin.webContents.executeJavaScript('document.documentElement.outerHTML')
    $ = load(res)
    doc = new Readability(new JSDOM($.html()).window.document).parse()
    if (doc && doc?.textContent.length > 150) {
      return `${doc.title}\n\n` + doc.textContent
    }
  } finally {
    tempWin.close()
    // @ts-ignore
    tempWin = null
  }
  return '无效网页'
}
