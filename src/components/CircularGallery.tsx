import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl'
import { useEffect, useRef } from 'react'

type GL = Renderer['gl']

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t
}

function getFontSize(font: string): number {
  const match = font.match(/(\d+)px/)
  return match ? parseInt(match[1], 10) : 30
}

/** Palet gradient fallback — sama dengan PlaceholderImage agar konsisten. */
const FALLBACK_GRADIENTS: [string, string][] = [
  ['#F7F0E1', '#D9BE93'],
  ['#EFE3CD', '#C09A63'],
  ['#F6E7C6', '#B07A4A'],
  ['#E9D9BC', '#96603A'],
  ['#FCF8F0', '#C8873F'],
  ['#EDD9B4', '#7A4A2B'],
]

/**
 * Texture pengganti saat foto produk belum ada / gagal dimuat.
 *
 * Penting: `new Image()` yang 404 tidak pernah memicu `onload`, sehingga
 * texture tetap kosong dan plane ter-render HITAM. Fallback ini dipasang lebih
 * dulu supaya galeri tidak pernah menampilkan kotak hitam.
 */
function createFallbackCanvas(seed: number): HTMLCanvasElement {
  const [from, to] = FALLBACK_GRADIENTS[seed % FALLBACK_GRADIENTS.length]
  const canvas = document.createElement('canvas')
  canvas.width = 700
  canvas.height = 900
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  grad.addColorStop(0, from)
  grad.addColorStop(1, to)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // Taburan titik halus menyerupai tepung — meniru PlaceholderImage.
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  for (let y = 20; y < canvas.height; y += 40) {
    for (let x = 20; x < canvas.width; x += 40) {
      ctx.beginPath()
      ctx.arc(x, y, 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  return canvas
}

/** Label produk digambar ke canvas 2D lalu dipakai sebagai texture. */
function createTextTexture(gl: GL, text: string, font: string, color: string) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not get 2d context')

  context.font = font
  const metrics = context.measureText(text)
  const textWidth = Math.ceil(metrics.width)
  const fontSize = getFontSize(font)
  const textHeight = Math.ceil(fontSize * 1.2)

  canvas.width = textWidth + 24
  canvas.height = textHeight + 24

  context.font = font
  context.fillStyle = color
  context.textBaseline = 'middle'
  context.textAlign = 'center'
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillText(text, canvas.width / 2, canvas.height / 2)

  const texture = new Texture(gl, { generateMipmaps: false })
  texture.image = canvas
  return { texture, width: canvas.width, height: canvas.height }
}

class Title {
  mesh!: Mesh
  constructor(gl: GL, private plane: Mesh, text: string, textColor: string, font: string) {
    const { texture, width, height } = createTextTexture(gl, text, font, textColor)
    const geometry = new Plane(gl)
    const program = new Program(gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    })
    this.mesh = new Mesh(gl, { geometry, program })
    const aspect = width / height
    const h = this.plane.scale.y * 0.13
    this.mesh.scale.set(h * aspect, h, 1)
    this.mesh.position.y = -this.plane.scale.y * 0.5 - h * 0.5 - 0.06
    this.mesh.setParent(this.plane)
  }
}

interface ScreenSize {
  width: number
  height: number
}
interface Viewport {
  width: number
  height: number
}

class Media {
  extra = 0
  program!: Program
  plane!: Mesh
  scale!: number
  padding!: number
  width!: number
  widthTotal!: number
  x!: number
  speed = 0
  isBefore = false
  isAfter = false

  constructor(
    private geometry: Plane,
    private gl: GL,
    image: string,
    public index: number,
    private length: number,
    private scene: Transform,
    private screen: ScreenSize,
    text: string,
    private viewport: Viewport,
    private bend: number,
    textColor: string,
    private borderRadius: number,
    font: string,
  ) {
    this.createShader(image)
    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program })
    this.plane.setParent(this.scene)
    new Title(this.gl, this.plane, text, textColor, font)
    this.onResize()
  }

  private createShader(image: string) {
    const texture = new Texture(this.gl, { generateMipmaps: true })
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        uniform float uActive;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);

          // Yang tidak aktif diredupkan sedikit agar produk terpilih menonjol.
          vec3 rgb = mix(color.rgb * 0.55, color.rgb, uActive);

          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);

          gl_FragColor = vec4(rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
        uActive: { value: 0 },
      },
      transparent: true,
    })
    // Pasang fallback LEBIH DULU agar tidak pernah ada kotak hitam,
    // lalu tukar ke foto asli bila berhasil dimuat.
    const fallback = createFallbackCanvas(this.index)
    texture.image = fallback
    this.program.uniforms.uImageSizes.value = [fallback.width, fallback.height]

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    img.onload = () => {
      texture.image = img
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight]
    }
    img.onerror = () => {
      /* biarkan fallback gradient yang tampil */
    }
    img.src = image
  }

  update(scroll: { current: number; last: number }, direction: 'right' | 'left') {
    this.plane.position.x = this.x - scroll.current - this.extra

    const x = this.plane.position.x
    const H = this.viewport.width / 2

    if (this.bend === 0) {
      this.plane.position.y = 0
      this.plane.rotation.z = 0
    } else {
      const B_abs = Math.abs(this.bend)
      const R = (H * H + B_abs * B_abs) / (2 * B_abs)
      const effectiveX = Math.min(Math.abs(x), H)
      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX)
      if (this.bend > 0) {
        this.plane.position.y = -arc
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R)
      } else {
        this.plane.position.y = arc
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R)
      }
    }

    this.speed = scroll.current - scroll.last
    this.program.uniforms.uTime.value += 0.04
    this.program.uniforms.uSpeed.value = this.speed

    const planeOffset = this.plane.scale.x / 2
    const viewportOffset = this.viewport.width / 2
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal
      this.isBefore = this.isAfter = false
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal
      this.isBefore = this.isAfter = false
    }
  }

  setActive(active: boolean) {
    this.program.uniforms.uActive.value = active ? 1 : 0
  }

  /** Jarak mendatar titik x (satuan viewport WebGL) ke pusat plane ini. */
  distanceTo(xViewport: number) {
    return Math.abs(xViewport - this.plane.position.x)
  }

  onResize({ screen, viewport }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
    if (screen) this.screen = screen
    if (viewport) this.viewport = viewport
    this.scale = this.screen.height / 1500
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height
    this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y]
    this.padding = 2
    this.width = this.plane.scale.x + this.padding
    this.widthTotal = this.width * this.length
    this.x = this.width * this.index
  }
}

export interface GalleryItem {
  image: string
  text: string
}

interface AppConfig {
  items: GalleryItem[]
  bend: number
  textColor: string
  borderRadius: number
  font: string
  scrollSpeed: number
  scrollEase: number
  activeIndex: number
  onSelect: (index: number) => void
}

/** Jarak geser maksimum (px) yang masih dianggap "klik", bukan "geret". */
const CLICK_SLOP = 6

class App {
  private scroll = { ease: 0.05, current: 0, target: 0, last: 0, position: 0 }
  private renderer!: Renderer
  private gl!: GL
  private camera!: Camera
  private scene!: Transform
  private planeGeometry!: Plane
  private medias: Media[] = []
  private screen!: ScreenSize
  private viewport!: Viewport
  private raf = 0
  private running = false
  private isDown = false
  private startX = 0
  private startY = 0
  private moved = 0
  private itemCount: number

  constructor(
    private container: HTMLElement,
    private cfg: AppConfig,
  ) {
    this.itemCount = cfg.items.length
    this.scroll.ease = cfg.scrollEase
    this.createRenderer()
    this.createCamera()
    this.scene = new Transform()
    this.onResize()
    this.planeGeometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 })
    this.createMedias()
    this.setActive(cfg.activeIndex)
    this.addEventListeners()
    // Mulai di posisi item aktif.
    this.scrollToIndex(cfg.activeIndex, true)
  }

  private createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    })
    this.gl = this.renderer.gl
    this.gl.clearColor(0, 0, 0, 0)
    const canvas = this.renderer.gl.canvas as HTMLCanvasElement
    canvas.style.display = 'block'
    this.container.appendChild(canvas)
  }

  private createCamera() {
    this.camera = new Camera(this.gl)
    this.camera.fov = 45
    this.camera.position.z = 20
  }

  private createMedias() {
    // Digandakan agar loop tak berujung terasa mulus.
    const doubled = this.cfg.items.concat(this.cfg.items)
    this.medias = doubled.map(
      (data, index) =>
        new Media(
          this.planeGeometry,
          this.gl,
          data.image,
          index,
          doubled.length,
          this.scene,
          this.screen,
          data.text,
          this.viewport,
          this.cfg.bend,
          this.cfg.textColor,
          this.cfg.borderRadius,
          this.cfg.font,
        ),
    )
  }

  setActive(activeIndex: number) {
    this.medias.forEach((m) => m.setActive(m.index % this.itemCount === activeIndex))
  }

  /** Geser sehingga item `index` berada di tengah. */
  scrollToIndex(index: number, immediate = false) {
    const m = this.medias[0]
    if (!m) return
    this.scroll.target = m.width * index
    if (immediate) this.scroll.current = this.scroll.target
  }

  // ── Interaksi (semua di-scope ke container, BUKAN window) ────────────────
  private onTouchDown = (e: MouseEvent | TouchEvent) => {
    this.isDown = true
    this.moved = 0
    this.scroll.position = this.scroll.current
    const p = 'touches' in e ? e.touches[0] : e
    this.startX = p.clientX
    this.startY = p.clientY
  }

  private onTouchMove = (e: MouseEvent | TouchEvent) => {
    if (!this.isDown) return
    const p = 'touches' in e ? e.touches[0] : e
    const dx = this.startX - p.clientX
    this.moved = Math.max(this.moved, Math.abs(dx), Math.abs(this.startY - p.clientY))
    this.scroll.target = this.scroll.position + dx * (this.cfg.scrollSpeed * 0.025)
  }

  private onTouchUp = (e: MouseEvent | TouchEvent) => {
    if (!this.isDown) return
    this.isDown = false
    // Geser < ambang = dianggap klik → pilih produk yang ditunjuk.
    if (this.moved <= CLICK_SLOP) {
      const p = 'changedTouches' in e ? e.changedTouches[0] : (e as MouseEvent)
      this.selectAtClientX(p.clientX)
    } else {
      this.snap()
    }
  }

  private selectAtClientX(clientX: number) {
    const rect = this.container.getBoundingClientRect()
    // px layar → satuan viewport WebGL (titik 0 di tengah container)
    const xViewport = ((clientX - rect.left) / rect.width - 0.5) * this.viewport.width

    // Ambil foto TERDEKAT, bukan yang persis tertimpa kursor: ada jarak antar
    // foto, jadi hit-test ketat akan sering meleset di celahnya.
    let hit: Media | null = null
    let best = Infinity
    for (const m of this.medias) {
      const d = m.distanceTo(xViewport)
      if (d < best) {
        best = d
        hit = m
      }
    }
    if (!hit) return

    this.cfg.onSelect(hit.index % this.itemCount)
    // Bawa item terpilih ke tengah.
    this.scroll.target = this.medias[0].width * hit.index
  }

  private onWheel = (e: WheelEvent) => {
    // Hanya bereaksi pada gulir MENDATAR / shift+wheel, supaya scroll vertikal
    // halaman tidak terbajak oleh galeri.
    const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey
    if (!horizontal) return
    e.preventDefault()
    const delta = e.deltaX || e.deltaY
    this.scroll.target += (delta > 0 ? this.cfg.scrollSpeed : -this.cfg.scrollSpeed) * 0.6
    this.snapSoon()
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const dir = e.key === 'ArrowRight' ? 1 : -1
    const next = (this.cfg.activeIndex + dir + this.itemCount) % this.itemCount
    this.cfg.onSelect(next)
  }

  private snapTimer = 0
  private snapSoon() {
    window.clearTimeout(this.snapTimer)
    this.snapTimer = window.setTimeout(() => this.snap(), 180)
  }

  private snap() {
    const m = this.medias[0]
    if (!m) return
    const i = Math.round(this.scroll.target / m.width)
    this.scroll.target = m.width * i
    const productIndex = ((i % this.itemCount) + this.itemCount) % this.itemCount
    this.cfg.onSelect(productIndex)
  }

  private onResize = () => {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    }
    this.renderer.setSize(this.screen.width, this.screen.height)
    this.camera.perspective({ aspect: this.screen.width / this.screen.height })
    const fov = (this.camera.fov * Math.PI) / 180
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    const width = height * this.camera.aspect
    this.viewport = { width, height }
    this.medias?.forEach((m) => m.onResize({ screen: this.screen, viewport: this.viewport }))
  }

  private update = () => {
    if (!this.running) return
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease)
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left'
    this.medias?.forEach((m) => m.update(this.scroll, direction))
    this.renderer.render({ scene: this.scene, camera: this.camera })
    this.scroll.last = this.scroll.current
    this.raf = window.requestAnimationFrame(this.update)
  }

  /** Render loop hanya jalan saat galeri terlihat — hemat CPU/GPU. */
  play() {
    if (this.running) return
    this.running = true
    this.raf = window.requestAnimationFrame(this.update)
  }
  pause() {
    this.running = false
    window.cancelAnimationFrame(this.raf)
  }

  /** Satu frame statis, supaya tetap tergambar walau loop sedang berhenti. */
  renderOnce() {
    this.medias?.forEach((m) => m.update(this.scroll, 'right'))
    this.renderer.render({ scene: this.scene, camera: this.camera })
  }

  private addEventListeners() {
    window.addEventListener('resize', this.onResize)
    const c = this.container
    c.addEventListener('wheel', this.onWheel, { passive: false })
    c.addEventListener('mousedown', this.onTouchDown)
    c.addEventListener('mousemove', this.onTouchMove)
    c.addEventListener('mouseup', this.onTouchUp)
    c.addEventListener('mouseleave', this.onTouchUp)
    c.addEventListener('touchstart', this.onTouchDown, { passive: true })
    c.addEventListener('touchmove', this.onTouchMove, { passive: true })
    c.addEventListener('touchend', this.onTouchUp)
    c.addEventListener('keydown', this.onKeyDown)
  }

  destroy() {
    this.pause()
    window.clearTimeout(this.snapTimer)
    window.removeEventListener('resize', this.onResize)
    const c = this.container
    c.removeEventListener('wheel', this.onWheel)
    c.removeEventListener('mousedown', this.onTouchDown)
    c.removeEventListener('mousemove', this.onTouchMove)
    c.removeEventListener('mouseup', this.onTouchUp)
    c.removeEventListener('mouseleave', this.onTouchUp)
    c.removeEventListener('touchstart', this.onTouchDown)
    c.removeEventListener('touchmove', this.onTouchMove)
    c.removeEventListener('touchend', this.onTouchUp)
    c.removeEventListener('keydown', this.onKeyDown)
    const canvas = this.renderer?.gl.canvas as HTMLCanvasElement | undefined
    canvas?.parentNode?.removeChild(canvas)
    this.gl?.getExtension('WEBGL_lose_context')?.loseContext()
  }
}

interface CircularGalleryProps {
  items: GalleryItem[]
  /** Indeks produk yang sedang aktif (dikendalikan dari luar). */
  activeIndex: number
  onSelect: (index: number) => void
  bend?: number
  textColor?: string
  borderRadius?: number
  font?: string
  scrollSpeed?: number
  scrollEase?: number
  className?: string
}

/**
 * Galeri melengkung berbasis WebGL (OGL) untuk memilih produk.
 *
 * Perbedaan penting dari versi aslinya:
 *  - Semua listener di-scope ke container, dan wheel hanya bereaksi pada gulir
 *    MENDATAR — jadi scroll vertikal halaman tidak terbajak.
 *  - Bisa DIKLIK: geser < 6px dianggap klik dan langsung memilih produk itu.
 *  - Render loop berhenti saat galeri keluar viewport (hemat daya).
 *  - Nonaktif saat prefers-reduced-motion; pemilihan tetap lewat tombol
 *    fallback yang disediakan pemanggil.
 */
export default function CircularGallery({
  items,
  activeIndex,
  onSelect,
  bend = 2.5,
  textColor = '#FCF8F0',
  borderRadius = 0.06,
  font = 'bold 28px "Nunito Sans"',
  scrollSpeed = 2,
  scrollEase = 0.06,
  className = '',
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<App | null>(null)
  // Simpan callback terbaru agar App tidak perlu dibuat ulang tiap render.
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const activeRef = useRef(activeIndex)
  activeRef.current = activeIndex

  useEffect(() => {
    const el = containerRef.current
    if (!el || items.length === 0) return

    const app = new App(el, {
      items,
      bend,
      textColor,
      borderRadius,
      font,
      scrollSpeed,
      scrollEase,
      activeIndex: activeRef.current,
      onSelect: (i) => onSelectRef.current(i),
    })
    appRef.current = app

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      app.renderOnce()
    } else {
      // Hanya render selama galeri terlihat.
      const io = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? app.play() : app.pause()),
        { rootMargin: '120px' },
      )
      io.observe(el)
      return () => {
        io.disconnect()
        app.destroy()
        appRef.current = null
      }
    }

    return () => {
      app.destroy()
      appRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase])

  // Sinkronkan sorotan + posisi saat produk aktif berubah dari luar
  // (mis. lewat tombol fallback).
  useEffect(() => {
    const app = appRef.current
    if (!app) return
    app.setActive(activeIndex)
    app.scrollToIndex(activeIndex)
  }, [activeIndex])

  return (
    <div
      ref={containerRef}
      className={`w-full cursor-grab overflow-hidden active:cursor-grabbing ${className}`}
      tabIndex={0}
      role="group"
      aria-label="Galeri produk unggulan. Gunakan tombol panah kiri/kanan untuk berpindah, atau klik salah satu foto."
    />
  )
}
