import React, { useEffect, useImperativeHandle, useRef } from 'react'
import C, { ThemeTypeEnum } from '@renderer/common/colors'

export interface ParticlesProps {
  theme: ThemeTypeEnum
}

export interface ParticlesRef {
  emitParticles: (x: number, y: number, width: number) => void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
}

const Particles = React.forwardRef(
  (props: ParticlesProps, ref: React.Ref<ParticlesRef>): JSX.Element => {
    const { theme } = props
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const particles = useRef<Particle[]>([])

    function createParticle(x: number, y: number): Particle {
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 2, // 水平速度
        vy: -Math.random() * 2 - 1, // 向上的垂直速度
        life: 1,
        maxLife: 0.7 + Math.random() * 0.3, // 0.7-1.0秒的生命周期
        size: 1 + Math.random() * 2 // 1-3像素的大小
      }
    }

    function step(): void {
      particles.current = particles.current.filter((particle) => {
        // 更新粒子位置
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.05 // 添加重力效果
        particle.life -= 0.016 // 每帧减少生命值（假设60fps）
        return particle.life > 0
      })
    }

    function draw(ctx: CanvasRenderingContext2D): void {
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)

      // 创建渐变色
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasRef.current!.height)
      gradient.addColorStop(0, C(theme).main)
      gradient.addColorStop(1, C(theme).sub)

      particles.current.forEach((particle) => {
        ctx.beginPath()
        ctx.fillStyle = gradient
        ctx.globalAlpha = particle.life // 透明度随生命值变化
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
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

      if (ctx) {
        canvas!.height = canvas!.clientHeight
        canvas!.width = canvas!.clientWidth
        animate()
      }

      return (): void => {
        unmounted = true
      }
    }, [theme])

    useImperativeHandle(
      ref,
      () => ({
        emitParticles: (x: number, y: number, width: number): void => {
          // 在矩形底部随机位置生成粒子
          const particleCount = Math.floor(width / 5) // 每5像素生成一个粒子
          for (let i = 0; i < particleCount; i++) {
            const particleX = x + Math.random() * width
            particles.current.push(createParticle(particleX, y))
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
  }
)

Particles.displayName = 'Particles'

export default Particles
