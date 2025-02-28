import React, { useEffect, useImperativeHandle, useRef } from 'react'
import C, { ThemeTypeEnum } from '@renderer/common/colors'

export interface ParticlesProps {
  theme: ThemeTypeEnum
}

export interface HanabiRef {
  emitParticles: (x: number, width: number) => void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
}

// 粒子初始速度范围（横向）
const speedShakeX = 3
// 粒子基础速度（纵向）
const baseSpeedY = -3
// 粒子数量因子
const particleCountFactor = 0.15
// 神说要有重力
const gravityY = 0.01
// 神说要有风
const gravityXBase = 0.05
// 风向的变化阈值
const xGravityChangeThreshold = 100
// 风向的变化计数器
let xGravityChangeCounter = 0
// 当前风速向量
let gravityX = gravityXBase
// 粒子生命值衰减速度
const lifeDecay = 0.01
// 粒子生命值基础
const lifeBase = 1.4
// 生命值随机范围
const lifeRange = 0.6
// 粒子长度
const particleLength = 4
// 粒子渐变色位置
const gradientPosition = 0.85

const Hanabi = React.forwardRef((props: ParticlesProps, ref: React.Ref<HanabiRef>): JSX.Element => {
  const { theme } = props
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particles = useRef<Particle[]>([])

  function createParticle(x: number): Particle {
    return {
      x,
      y: canvasRef.current!.height,
      vx: (Math.random() - 0.5) * speedShakeX,
      vy: (-Math.random() * baseSpeedY) / 2 + baseSpeedY,
      life: 1,
      maxLife: lifeBase + Math.random() * lifeRange
    }
  }

  function step(): void {
    xGravityChangeCounter++
    if (xGravityChangeCounter > xGravityChangeThreshold) {
      gravityX = (Math.random() - 0.5) * gravityXBase
      xGravityChangeCounter = 0
    }
    particles.current = particles.current.filter((particle) => {
      // 更新粒子位置
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += gravityY
      particle.vx += gravityX
      particle.life -= lifeDecay
      return particle.life > 0
    })
  }

  function draw(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)

    // 创建渐变色
    const gradient = ctx.createLinearGradient(
      0,
      canvasRef.current!.height * gradientPosition,
      0,
      canvasRef.current!.height
    )
    gradient.addColorStop(0, C(theme).main)
    gradient.addColorStop(1, C(theme).sub)

    particles.current.forEach((particle) => {
      ctx.beginPath()
      ctx.strokeStyle = gradient
      ctx.globalAlpha = particle.life
      ctx.moveTo(particle.x, particle.y)
      ctx.lineTo(
        particle.x - particle.vx * particleLength,
        particle.y - particle.vy * particleLength
      )
      ctx.stroke()
      ctx.closePath()
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    let unmounted = false

    const animate = (): void => {
      if (unmounted) return
      step()
      draw(ctx!)
      requestAnimationFrame(animate)
    }

    const resize = (): void => {
      const canvas = canvasRef.current
      if (canvas) {
        // 重置为父容器（DIV）大小
        canvas!.height = canvas!.clientHeight
        canvas!.width = canvas!.clientWidth
      }
    }

    if (ctx) {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
      window.addEventListener('resize', resize)
      animate()
    }

    return (): void => {
      unmounted = true
      window.removeEventListener('resize', resize)
    }
  }, [theme])

  useImperativeHandle(
    ref,
    () => ({
      emitParticles: (x: number, width: number): void => {
        // 在底部随机位置生成粒子
        const particleCount = Math.floor(width * particleCountFactor)
        for (let i = 0; i < particleCount; i++) {
          const particleX = x + Math.random() * width
          particles.current.push(createParticle(particleX))
        }
      }
    }),
    []
  )

  return (
    <div className="absolute size-full top-0 left-0 pointer-events-none z-10">
      <canvas className="size-full" ref={canvasRef} />
    </div>
  )
})

Hanabi.displayName = 'Hanabi'

export default Hanabi
