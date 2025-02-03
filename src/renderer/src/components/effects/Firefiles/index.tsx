// 动画：绘制向右上角随机移动的，具有拖尾效果的粒子

import { getMidColor } from '@renderer/common/colors'
import { useEffect, useRef } from 'react'

const BASE_SPEED_X = 1
const BASE_SPEED_Y = -0.5625
const SPEED_SHAKE = 1
const PARTICLE_RATE = 0.0002
const MAX_TRAIL_LENGTH = 0
const STROKE_WIDTH = 3
const MAX_ALPHA = 0.2
const MIN_ALPHA = 0.05
const ALPHA_CHANGE_RATE = 0.02
const MAX_END_POINT_RADIUS_RATE = 0.015
const MIN_END_POINT_RADIUS_RATE = 0.005
const BLUR_RADIUS = 10
const MAX_PARTICLE_CNT = 100

class Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  endPointRadius: number
  color: string
  trail: { x: number; y: number }[]

  constructor(x: number, y: number, vx: number, vy: number, color: string, endPointRadius: number) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
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
    ctx.shadowBlur = BLUR_RADIUS
    ctx.shadowColor = color
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
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
    ctx.stroke()
  }

  update(canvas: HTMLCanvasElement): void {
    this.x += this.vx
    this.y += this.vy
    this.vx += (Math.random() - 0.5) * SPEED_SHAKE
    this.vy += (Math.random() - 0.5) * SPEED_SHAKE
    this.vx = Math.min(Math.max(this.vx, BASE_SPEED_X - SPEED_SHAKE), BASE_SPEED_X + SPEED_SHAKE)
    this.vy = Math.min(Math.max(this.vy, BASE_SPEED_Y - SPEED_SHAKE), BASE_SPEED_Y + SPEED_SHAKE)

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
    fromColor: string,
    toColor: string,
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
    const color = getMidColor(Math.random(), fromColor, toColor)
    return new Particle(x, y, vx, vy, color, endPointRadius)
  }
}

export default function Firefiles({
  fromColor = '#0bf4fe',
  toColor = '#ff97ff'
}: {
  fromColor?: string
  toColor?: string
}): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const particles: Particle[] = []

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
      update()
      draw()
      requestAnimationFrame(loop)
    }

    const addParticle = (): void => {
      const radiusBase = Math.sqrt(canvas!.width * canvas!.width + canvas!.height * canvas!.height)
      particles.unshift(Particle.createRandom(canvas!, fromColor, toColor, radiusBase))
    }

    window.addEventListener('resize', resize)
    resize()
    loop()
  }, [])

  return (
    <>
      <canvas ref={canvasRef}></canvas>
    </>
  )
}
