import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SCREENSHOTS_DIR = path.join(__dirname, '../docs/screenshots')

async function main () {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForSelector('.file-explorer', { timeout: 10000 }).catch(() => {})
    await new Promise(r => setTimeout(r, 1500))
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'file-manager-main.png'), fullPage: false })
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'file-manager-full.png'), fullPage: true })
    await page.click('text=Pictures').catch(() => {})
    await new Promise(r => setTimeout(r, 800))
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'file-manager-folder-view.png'), fullPage: false })
    console.log('Screenshots saved to docs/screenshots/')
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
