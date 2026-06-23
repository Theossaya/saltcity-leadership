// Generates the PWA icons: the white SaltCity logo centered on the berry
// (#6B2540) background. Run: node scripts/generate-icons.mjs
import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')
const logo = readFileSync(join(pub, 'logo-white.svg'))
const BERRY = { r: 0x6b, g: 0x25, b: 0x40, alpha: 1 }

// size = output square; ratio = logo width as a fraction of the canvas.
// Maskable keeps the logo well inside the safe zone so OS masks never clip it.
async function make(size, ratio, outName) {
  const logoWidth = Math.round(size * ratio)
  const logoPng = await sharp(logo, { density: 512 }).resize({ width: logoWidth }).png().toBuffer()
  const { height: logoHeight } = await sharp(logoPng).metadata()

  mkdirSync(join(pub, 'icons'), { recursive: true })
  await sharp({
    create: { width: size, height: size, channels: 4, background: BERRY },
  })
    .composite([
      {
        input: logoPng,
        left: Math.round((size - logoWidth) / 2),
        top: Math.round((size - logoHeight) / 2),
      },
    ])
    .png()
    .toFile(join(pub, outName))
  console.log(`wrote ${outName} (${size}px, logo ${Math.round(ratio * 100)}%)`)
}

await make(192, 0.62, 'icons/icon-192.png')
await make(512, 0.62, 'icons/icon-512.png')
await make(512, 0.46, 'icons/icon-maskable.png') // smaller logo for the maskable safe zone
await make(180, 0.62, 'apple-touch-icon.png') // iOS home screen
console.log('done')
