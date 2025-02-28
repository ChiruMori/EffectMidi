// 动画：绘制向右上角随机移动的，具有拖尾效果的粒子

import { ColorFuncType, getMidColor, hexStringToHue, ThemeTypeEnum } from '@renderer/common/colors'
import { useEffect, useRef } from 'react'
import C from '@renderer/common/colors'
import timer from '../timer'

const BASE_SPEED_X = 0.5
const BASE_SPEED_Y = -0.28125
const SPEED_RANGE = 0.5
const ACCELERATION = 0.1
const PARTICLE_RATE = 0.0002
const MAX_TRAIL_LENGTH = 100
const STROKE_WIDTH = 1
const MAX_ALPHA = 0.25
const MIN_ALPHA = 0.1
const ALPHA_CHANGE_RATE = 0.01
const MAX_END_POINT_RADIUS_RATE = 0.025
const MIN_END_POINT_RADIUS_RATE = 0.005
// const BLUR_RADIUS = 10
const MAX_PARTICLE_CNT = 200
const COLOR_OFFSET = 80

class Particle {
  x: number
  y: number
  vx: number
  vy: number
  ax: number
  ay: number
  alpha: number
  endPointRadius: number
  color: string
  trail: { x: number; y: number }[]

  constructor(x: number, y: number, vx: number, vy: number, color: string, endPointRadius: number) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.ax = 0
    this.ay = 0
    this.endPointRadius = endPointRadius
    this.color = color
    this.trail = []
    this.alpha = MAX_ALPHA
  }

  addTrail(x: number, y: number): void {
    this.trail.push({ x, y })
    if (this.trail.length > MAX_TRAIL_LENGTH) {
      this.trail.shift()
    }
  }

  draw(ctx: CanvasRenderingContext2D, color: string): void {
    // 主体光斑
    ctx.globalAlpha = this.alpha
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.arc(this.x, this.y, this.endPointRadius, 0, Math.PI * 2)
    ctx.fillStyle = color
    // shadow 将导致 FPS 大幅下降
    // ctx.shadowBlur = BLUR_RADIUS
    // ctx.shadowColor = color
    // ctx.shadowOffsetX = 0
    // ctx.shadowOffsetY = 0
    ctx.closePath()
    ctx.fill()
    // 拖尾
    if (this.trail.length === 0) {
      return
    }
    ctx.beginPath()
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const p = this.trail[i]
      ctx.lineTo(p.x, p.y)
    }
    ctx.strokeStyle = color
    ctx.lineWidth = STROKE_WIDTH
    ctx.setLineDash([STROKE_WIDTH, STROKE_WIDTH * 4])
    ctx.stroke()
  }

  update(canvas: HTMLCanvasElement): void {
    this.x += this.vx + BASE_SPEED_X
    this.y += this.vy + BASE_SPEED_Y
    this.vx += this.ax
    this.vy += this.ay
    this.ax = (Math.random() - 0.5) * ACCELERATION
    this.ay = (Math.random() - 0.5) * ACCELERATION
    this.vx = Math.min(Math.max(this.vx / BASE_SPEED_X, -SPEED_RANGE), SPEED_RANGE) * BASE_SPEED_X
    this.vy = Math.min(Math.max(this.vy / BASE_SPEED_Y, -SPEED_RANGE), SPEED_RANGE) * BASE_SPEED_Y
    const overflowX = this.x < -this.endPointRadius || this.x > canvas.width + this.endPointRadius
    const overflowY = this.y < -this.endPointRadius || this.y > canvas.height + this.endPointRadius
    if (MAX_TRAIL_LENGTH > 0) {
      if (overflowX || overflowY) {
        this.trail.shift()
      } else {
        this.addTrail(this.x, this.y)
      }
    }

    if (this.trail.length === 0) {
      this.x = overflowX ? -this.endPointRadius : this.x
      this.y = overflowY ? canvas.height + this.endPointRadius : this.y
    }

    this.alpha = Math.max(
      Math.min(this.alpha + (Math.random() - 0.5) * ALPHA_CHANGE_RATE, MAX_ALPHA),
      MIN_ALPHA
    )
  }

  static createRandom(
    canvas: HTMLCanvasElement,
    theme: ColorFuncType,
    radiusBase: number
  ): Particle {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const vx = Math.random() * BASE_SPEED_X
    const vy = Math.random() * BASE_SPEED_Y
    const endPointRadius =
      (Math.random() * (MAX_END_POINT_RADIUS_RATE - MIN_END_POINT_RADIUS_RATE) +
        MIN_END_POINT_RADIUS_RATE) *
      radiusBase

    const nowColor =
      (hexStringToHue(getMidColor(0.5, theme.main, theme.sub)) +
        Math.random() * COLOR_OFFSET) %
      360
    const color =
      theme !== ThemeTypeEnum.GRAY ? `hsl(${nowColor}, 80%, 40%)` : `hsl(0, 0%, ${nowColor % 100}%)`
    return new Particle(x, y, vx, vy, color, endPointRadius)
  }
}

export default function Firefiles({
  theme = ThemeTypeEnum.SKY
}: {
  theme: ThemeTypeEnum
}): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const color = C(theme)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const particles: Particle[] = []
    let unmounted = false

    const refreshAll = (): void => {
      particles.length = 0
      const particleCnt = Math.min(canvas!.width * canvas!.height * PARTICLE_RATE, MAX_PARTICLE_CNT)
      for (let i = 0; i < particleCnt; i++) {
        addParticle()
      }
    }

    const resize = (): void => {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
      refreshAll()
    }

    const draw = (): void => {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      ctx!.globalCompositeOperation = 'lighter'
      particles.forEach((p) => {
        p.draw(ctx!, p.color)
      })
    }

    const update = (): void => {
      particles.forEach((p) => {
        p.update(canvas!)
      })
    }

    const loop = (): void => {
      if (unmounted) {
        return
      }
      timer('Fireflies')
      update()
      draw()
      requestAnimationFrame(loop)
    }

    const addParticle = (): void => {
      const radiusBase = Math.sqrt(canvas!.width * canvas!.width + canvas!.height * canvas!.height)
      particles.unshift(Particle.createRandom(canvas!, color, radiusBase))
    }

    window.addEventListener('resize', resize)
    resize()
    loop()

    // 组件销毁时，清理事件监听、退出循环
    return (): void => {
      window.removeEventListener('resize', resize)
      unmounted = true
    }
  }, [theme])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="size-full absolute top-0 left-0 pointer-events-none z-40"
      ></canvas>
    </>
  )
}
