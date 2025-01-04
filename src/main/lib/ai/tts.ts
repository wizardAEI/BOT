import { randomBytes } from 'crypto'

import { WebSocket } from 'ws'

import { PostBuffToMainWindow } from '../../window'

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4'

function createSSML(text, voiceName) {
  text = text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll("'", '&apos;')
    .replaceAll('"', '&quot;')
  const ssml =
    '\
        <speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">\
          <voice name="' +
    voiceName +
    '">\
              <prosody rate="0%" pitch="0%">\
                  ' +
    text +
    '\
              </prosody >\
          </voice >\
        </speak > '

  return ssml
}

const WIN_EPOCH = 11644473600;
const S_TO_NS = 1e9;
const CHROMIUM_FULL_VERSION = "130.0.2849.68"
const SEC_MS_GEC_VERSION = `1-${CHROMIUM_FULL_VERSION}`

class DRM {
  /**
   * Class to handle DRM operations with clock skew correction.
   */
  static clockSkewSeconds: number = 0.0;

  static adjClockSkewSeconds(skewSeconds: number): void {
    /**
     * Adjust the clock skew in seconds in case the system clock is off.
     * 
     * This method updates the `clockSkewSeconds` attribute of the DRM class
     * to the specified number of seconds.
     * 
     * @param {number} skewSeconds - The number of seconds to adjust the clock skew to.
     * @returns {void}
     */
    DRM.clockSkewSeconds += skewSeconds;
  }

  static getUnixTimestamp(): number {
    /**
     * Gets the current timestamp in Unix format with clock skew correction.
     * 
     * @returns {number} - The current timestamp in Unix format with clock skew correction.
     */
    return new Date().getTime() / 1000 + DRM.clockSkewSeconds;
  }

  static parseRfc2616Date(date: string): number | null {
    /**
     * Parses an RFC 2616 date string into a Unix timestamp.
     * 
     * This function parses an RFC 2616 date string into a Unix timestamp.
     * 
     * @param {string} date - RFC 2616 date string to parse.
     * @returns {number | null} - Unix timestamp of the parsed date string, or null if parsing failed.
     */
    try {
      return Date.parse(date) / 1000;
    } catch (error) {
      return null;
    }
  }

  static generateSecMsGec(): string {
    /**
     * Generates the Sec-MS-GEC token value.
     * 
     * This function generates a token value based on the current time in Windows file time format
     * adjusted for clock skew, and rounded down to the nearest 5 minutes. The token is then hashed
     * using SHA256 and returned as an uppercased hex digest.
     * 
     * @returns {string} - The generated Sec-MS-GEC token value.
     * 
     * See Also:
     * https://github.com/rany2/edge-tts/issues/290#issuecomment-2464956570
     */

    // Get the current timestamp in Unix format with clock skew correction
    let ticks = DRM.getUnixTimestamp();

    // Switch to Windows file time epoch (1601-01-01 00:00:00 UTC)
    ticks += WIN_EPOCH;

    // Round down to the nearest 5 minutes (300 seconds)
    ticks -= ticks % 300;

    // Convert the ticks to 100-nanosecond intervals (Windows file time format)
    ticks *= S_TO_NS / 100;

    // Create the string to hash by concatenating the ticks and the trusted client token
    const strToHash = `${ticks.toFixed(0)}${TRUSTED_CLIENT_TOKEN}`;

    // Compute the SHA256 hash and return the uppercased hex digest
    const hash = require('crypto').createHash('sha256');
    return hash.update(strToHash, 'ascii').digest('hex').toUpperCase();
  }
}

class Service {
  private ws: WebSocket | null = null

  public newBufferHandler: (buffer: Buffer) => void

  private convertPromise: {
    resolve: (value?: Buffer) => void
    reject: (reason?: unknown) => void
  }

  private buffers: Buffer
  private requestId = ''

  constructor(newBufferHandler: (buffer: Buffer) => void) {
    this.convertPromise = {
      resolve: () => {},
      reject: () => {}
    }
    this.buffers = Buffer.from([])
    this.newBufferHandler = newBufferHandler
  }

  private async connect(): Promise<WebSocket> {
    const connectionId = randomBytes(16).toString('hex').toLowerCase()
    const url = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&ConnectionId=${connectionId}&Sec-MS-GEC=${DRM.generateSecMsGec()}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}`
    const ws = new WebSocket(url, {
      host: 'speech.platform.bing.com',
      origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.66 Safari/537.36 Edg/103.0.1264.44'
      }
    }) 
    return new Promise((resolve, reject) => {
      ws.on('close', (code, reason) => {
        this.ws = null
        console.info(`连接已关闭： ${reason} ${code}`)
      })
      ws.on('message', (message, isBinary) => {
        const pattern = /X-RequestId:(?<id>[a-z|0-9]*)/
        if (!isBinary) {
          const data = message.toString()
          if (data.includes('Path:turn.start')) {
            const matches = data.match(pattern)
            this.requestId = matches!.groups!.id
            this.buffers = Buffer.from([])
          } else if (data.includes('Path:turn.end')) {
            this.convertPromise.resolve(this.buffers)
            // this.ws?.close(1000)
          }
        } else if (isBinary) {
          const matches = message.toString().match(pattern)
          if (this.requestId !== matches!.groups!.id) return
          const separator = 'Path:audio\r\n'
          const data = message as string | Buffer
          const contentIndex = data.indexOf(separator) + separator.length
          const content = data.slice(contentIndex) as Buffer
          // @ts-ignore
          this.buffers = Buffer.concat([this.buffers, content])
          this.newBufferHandler(content as Buffer)
        }
      })
      ws.on('error', (error) => {
        this.ws = null
        console.log(error.message, error.cause)
        reject(`连接失败： ${error}`)
      })
      ws.on('open', () => {
        resolve(ws)
      })
    })
  }

  public async convert(ssml: string, format: string) {
    if (this.ws === null || this.ws.readyState != WebSocket.OPEN) {
      const connection = await this.connect()
      this.ws = connection
    }
    const requestId = randomBytes(16).toString('hex').toLowerCase()
    const configData = {
      context: {
        synthesis: {
          audio: {
            metadataoptions: {
              sentenceBoundaryEnabled: 'false',
              wordBoundaryEnabled: 'false'
            },
            outputFormat: format
          }
        }
      }
    }
    const configMessage =
      `X-Timestamp:${Date()}\r\n` +
      'Content-Type:application/json; charset=utf-8\r\n' +
      'Path:speech.config\r\n\r\n' +
      JSON.stringify(configData)
    this.ws?.send(configMessage, (configError) => {
      if (configError) {
        console.error(`配置请求发送失败：${requestId}\n`, configError)
      }
      // 发送SSML消息
      const ssmlMessage =
        `X-Timestamp:${Date()}\r\n` +
        `X-RequestId:${requestId}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `Path:ssml\r\n\r\n` +
        ssml
      this.ws!.send(ssmlMessage, (ssmlError) => {
        if (ssmlError) {
          console.error(`SSML消息发送失败：${requestId}\n`, ssmlError)
        }
      })
    })
    return new Promise((resolve, reject) => {
      this.convertPromise.resolve = resolve
      this.convertPromise.reject = reject
    })
  }
}

const service = new Service((buff) => {
  PostBuffToMainWindow(buff)
})

export const speak = async (content: string) => {
  const ssml = createSSML(content, 'zh-CN-XiaoxiaoNeural')
  return await service.convert(ssml, 'webm-24khz-16bit-mono-opus')
}