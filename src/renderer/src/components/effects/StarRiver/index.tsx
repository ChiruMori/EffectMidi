// 动画：绘制向右上角随机移动的，具有拖尾效果的粒子

import { useEffect, useRef } from 'react'

const BASE_SPEED_X = 2
const BASE_SPEED_Y = -1.125
const PARTICLE_RATE = 0.001

export default function StarRiver(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const particles: { x: number; y: number; vx: number; vy: number }[] = []

    const refreshAll = (): void => {
      particles.length = 0
      const particleCnt = canvas!.width * canvas!.height * PARTICLE_RATE
      for (let i = 0; i < particleCnt; i++) {
        addParticle()
      }
    }

    const refreshParticle = (particle: { x: number; y: number; vx: number; vy: number }): void => {
      // 刷新时，位置位于左侧或下侧边缘，随机分布
      const downEdge = Math.random() < canvas!.width / (canvas!.width + canvas!.height)
      particle.x = downEdge ? Math.random() * canvas!.width : 0
      particle.y = downEdge ? canvas!.height : Math.random() * canvas!.height
    }

    const resize = (): void => {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
      refreshAll()
    }

    const draw = (): void => {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      ctx!.fillStyle = 'rgba(255, 255, 255, 0.5)'
      particles.forEach((p) => {
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx!.fill()
      })
    }

    const update = (): void => {
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vx += (Math.random() - 0.5) * 0.1
        p.vy += (Math.random() - 0.5) * 0.1
        // 速度不能与基础速度偏差超过 1
        p.vx = Math.min(Math.max(p.vx, BASE_SPEED_X - 1), BASE_SPEED_X + 1)
        p.vy = Math.min(Math.max(p.vy, BASE_SPEED_Y - 1), BASE_SPEED_Y + 1)
      })
      particles.forEach((p) => {
        if (p.x < 0 || p.x > canvas!.width || p.y < 0 || p.y > canvas!.height) {
          refreshParticle(p)
        }
      })
    }

    const loop = (): void => {
      update()
      draw()
      requestAnimationFrame(loop)
    }

    const addParticle = (): void => {
      const vx = Math.random() * 1 - 0.5 + BASE_SPEED_X
      const vy = Math.random() * 1 - 0.5 + BASE_SPEED_Y
      const x = Math.random() * canvas!.width
      const y = Math.random() * canvas!.height
      particles.push({ x, y, vx, vy })
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
