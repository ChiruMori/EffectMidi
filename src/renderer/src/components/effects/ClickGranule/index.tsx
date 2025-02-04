// 点击粒子效果：点击鼠标时，会在点击位置生成自动消失的光斑

import { useEffect, useRef } from 'react'
import C, { ThemeTypeEnum, getMidColor, hexStringToHue } from '@renderer/common/colors'
import timer from '../timer'

const colorOffset = 50
const particlesOneClick = 10
const speedShake = 0.2
const speedBase = 1.5
const radiusBase = 20
const radiusDecay = 0.98

interface Particle {
  x: number
  y: number
  radius: number
  color: string
  speedX: number
  speedY: number
}

const createParticle = (x: number, y: number, colorType: ThemeTypeEnum): Particle => {
  const radius = Math.random() * radiusBase + 2
  const speedX = (Math.random() - 0.5) * speedBase
  const speedY = (Math.random() - 0.5) * speedBase
  const nowColor =
    (hexStringToHue(getMidColor(0.5, C(colorType).main, C(colorType).sub)) +
      Math.random() * colorOffset) %
    360
  const color =
    colorType !== ThemeTypeEnum.GRAY
      ? `hsl(${nowColor}, 90%, 50%)`
      : `hsl(0, 0%, ${nowColor % 100}%)`

  return { x, y, radius, color, speedX, speedY }
}

export default function ClickGranule({
  theme = ThemeTypeEnum.SKY
}: {
  theme: ThemeTypeEnum
}): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particles: Particle[] = []

  const updateParticles = (): void => {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.x += p.speedX
      p.y += p.speedY
      p.speedX += (Math.random() - 0.5) * speedShake
      p.speedY += (Math.random() - 0.5) * speedShake
      p.radius *= radiusDecay

      if (p.radius < 0.1) {
        particles.splice(i, 1)
      }
    }
  }

  const drawParticles = (ctx: CanvasRenderingContext2D): void => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    for (const p of particles) {
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const handleClick = (e: MouseEvent): void => {
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // 使用顶层的 colorType 作为参数传递
      for (let i = 0; i < particlesOneClick; i++) {
        particles.push(createParticle(x, y, theme))
      }
    }
  }

  const handleResize = (): void => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    let unmounted = false

    const animate = (): void => {
      if (unmounted) {
        return
      }
      updateParticles()
      drawParticles(ctx!)
      requestAnimationFrame(animate)
      timer('ClickGranule')
    }

    if (ctx) {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
      animate()
      window.addEventListener('mousedown', handleClick)
      window.addEventListener('resize', handleResize)
    }

    return (): void => {
      // Clear particles on unmount
      particles.length = 0
      window.removeEventListener('mousedown', handleClick)
      window.removeEventListener('resize', handleResize)
      unmounted = true
    }
  }, [theme])

  return (
    <div>
      <canvas
        id="clickGranule"
        className="size-full absolute top-0 left-0 pointer-events-none z-50"
        ref={canvasRef}
      />
    </div>
  )
}
