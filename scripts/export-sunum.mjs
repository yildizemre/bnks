/**
 * Sunumu slayt görsellerine ve PDF'e çevirir.
 *
 *   npm run dev              (başka bir terminalde, port 5188 ya da BASE ile)
 *   npm run sunum:export
 *
 * Çıktılar:
 *   public/images/sunum/slaytlar/01.jpg …  → mobil görünüm bu kareleri gösterir
 *   public/hypevision-sunum.pdf            → "PDF indir" düğmesi
 *
 * Sunumda değişiklik yapınca bu betiği yeniden çalıştırın; slayt sayısı
 * sayfadaki data-slide-count özniteliğinden okunur.
 * Bağımlılık yok: Chrome DevTools Protocol + elle yazılmış küçük bir PDF yazıcı.
 */
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:5188'
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SCALE = 1.25 // 1600×900 → 2000×1125
const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const OUT_DIR = join(ROOT, 'public/images/sunum/slaytlar')
const PDF = join(ROOT, 'public/hypevision-sunum.pdf')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9334', '--hide-scrollbars', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'hv-sunum-'))}`, 'about:blank'])
let ws
try {
  let targets
  for (let i = 0; i < 40 && !targets; i++) {
    await sleep(250)
    targets = await fetch('http://127.0.0.1:9334/json').then((r) => r.json()).catch(() => undefined)
  }
  ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl)
  await new Promise((r) => (ws.onopen = r))
  let id = 0
  const pending = {}
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending[m.id]) pending[m.id](m.result), delete pending[m.id]
  }
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })) })
  const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.value

  await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 900, deviceScaleFactor: SCALE, mobile: false })
  await send('Page.navigate', { url: `${BASE}/sunum?export#1` })
  await sleep(2500)
  const count = await evaluate(`Number(document.querySelector('[data-slide-count]')?.dataset.slideCount)`)
  if (!count) throw new Error('Sunum sayfası açılamadı — dev sunucusu çalışıyor mu? ' + BASE)

  mkdirSync(OUT_DIR, { recursive: true })
  const pages = []
  for (let n = 1; n <= count; n++) {
    await send('Page.navigate', { url: `${BASE}/sunum?export#${n}` })
    // tüm görseller yüklensin + geçiş animasyonu bitsin
    await evaluate(`Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r })))`)
    await sleep(900)
    const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 84 })
    const buf = Buffer.from(data, 'base64')
    const file = join(OUT_DIR, String(n).padStart(2, '0') + '.jpg')
    writeFileSync(file, buf)
    pages.push(buf)
    console.log('slayt', n, '/', count)
  }

  writeFileSync(PDF, jpegsToPdf(pages, Math.round(1600 * SCALE), Math.round(900 * SCALE)))
  console.log('PDF yazıldı:', PDF, `(${(readFileSync(PDF).length / 1e6).toFixed(1)} MB)`)
} finally {
  ws?.close()
  chrome.kill()
}

/** JPEG'leri tam sayfa olarak gömen en küçük PDF (16:9, 960×540 pt) */
function jpegsToPdf(images, w, h) {
  const PW = 960
  const PH = 540
  const chunks = []
  const offsets = []
  let size = 0
  const push = (b) => { const buf = typeof b === 'string' ? Buffer.from(b, 'latin1') : b; chunks.push(buf); size += buf.length }
  const obj = (n, body, stream) => {
    offsets[n] = size
    push(`${n} 0 obj\n${body}\n`)
    if (stream) { push('stream\n'); push(stream); push('\nendstream\n') }
    push('endobj\n')
  }
  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')
  const kids = images.map((_, i) => `${3 + i * 3} 0 R`).join(' ')
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>')
  obj(2, `<< /Type /Pages /Count ${images.length} /Kids [${kids}] >>`)
  images.forEach((img, i) => {
    const p = 3 + i * 3
    const content = Buffer.from(`q ${PW} 0 0 ${PH} 0 0 cm /Im0 Do Q`, 'latin1')
    obj(p, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im0 ${p + 1} 0 R >> >> /Contents ${p + 2} 0 R >>`)
    obj(p + 1, `<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.length} >>`, img)
    obj(p + 2, `<< /Length ${content.length} >>`, content)
  })
  const total = 3 + images.length * 3
  const xref = size
  push(`xref\n0 ${total}\n0000000000 65535 f \n`)
  for (let n = 1; n < total; n++) push(String(offsets[n]).padStart(10, '0') + ' 00000 n \n')
  push(`trailer\n<< /Size ${total} /Root 1 0 R /Info << /Title (Hype Vision Sunum) >> >>\nstartxref\n${xref}\n%%EOF\n`)
  return Buffer.concat(chunks)
}
