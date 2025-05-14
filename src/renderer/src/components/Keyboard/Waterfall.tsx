// 向上的音符瀑布
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import C, { ThemeTypeEnum } from '@renderer/common/colors'
import timer from '@renderer/components/effects/timer'
import paddelUp from '@renderer/assets/pedalup.svg'
import paddelDown from '@renderer/assets/pedaldown.svg'
import Hanabi, { HanabiRef } from './Hanabi'
import { useAppSelector } from '@renderer/common/store'
import { particleSelector } from '@renderer/config'

export interface WaterfallProps {
  theme: ThemeTypeEnum
}

export interface WaterfallRef {
  rectBegin: (key: string, from: number, to: number) => void
  rectEnd: (key: string) => void
  setPadel: (padel: boolean) => void
}

interface Rect {
  from: number
  to: number
  y?: number
  height?: number
  grow?: boolean
}

// TODO: 可配置的速度
const minHeight = 5
const padelAreaHeight = 20
const padelPadding = 10
const globalAlpha = 0.8

const Waterfall = React.forwardRef(
  (props: WaterfallProps, ref: React.Ref<WaterfallRef>): JSX.Element => {
    const { theme } = props
    const [active, setActive] = useState<boolean>(true)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const hanabiRef = useRef<HanabiRef>(null)
    const rects = useRef(new Map<string, Rect>())
    const padels = useRef<{ y: number; type: 'down' | 'up' }[]>([])
    const baseSpeed = useAppSelector(particleSelector).waterfallSpeed / 10

    function step(): void {
      rects.current.forEach((rect) => {
        // 更新矩形位置、高度
        if (rect.grow) {
          rect.height = (rect.height ?? minHeight) + baseSpeed
          // 触发粒子效果
          const fromX = canvasRef.current!.width * rect.from
          const toX = canvasRef.current!.width * rect.to
          hanabiRef.current?.emitParticles(fromX, toX - fromX)
        }
        rect.y = (rect.y ?? canvasRef.current!.height) - baseSpeed
      })
      // 移除不可见的矩形
      for (const [key, rect] of rects.current) {
        if (rect.y! + rect.height! < 0) {
          rects.current.delete(key)
        }
      }

      padels.current.forEach((padel) => {
        // 更新踏板符号位置
        padel.y -= baseSpeed
      })
      // 移除不可见的踏板符号
      padels.current = padels.current.filter((padel) => padel.y > -padelAreaHeight)
    }

    function draw(ctx: CanvasRenderingContext2D): void {
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
      ctx.globalAlpha = globalAlpha
      // 渐变色填充
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasRef.current!.height)
      gradient.addColorStop(0, C(theme).main)
      gradient.addColorStop(1, C(theme).sub)
      ctx.fillStyle = gradient
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      // 绘制矩形（圆角矩形，白色描边）
      rects.current.forEach((rect) => {
        const fromX = canvasRef.current!.width * rect.from
        const toX = canvasRef.current!.width * rect.to
        ctx.beginPath()
        ctx.roundRect(fromX, rect.y!, toX - fromX, rect.height!, 5)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      })
      // 绘制踏板符号（SVG 文件）
      ctx.strokeStyle = C(theme)?.main ?? '#fff'
      padels.current.forEach((padel) => {
        const img = new Image()
        ctx.beginPath()
        ctx.globalAlpha = globalAlpha
        if (padel.type === 'down') {
          // 踩下踏板符号，先绘制符号，再绘制踏板分割线
          img.src = paddelDown
          ctx.drawImage(img, padelPadding, padel.y - 13 - padelPadding, 20, 13)
          ctx.moveTo(0, padel.y)
          ctx.lineTo(canvasRef.current!.width, padel.y)
        } else {
          // 抬起踏板符号，先绘制踏板分割线，再绘制符号
          img.src = paddelUp
          ctx.moveTo(0, padel.y)
          ctx.lineTo(canvasRef.current!.width, padel.y)
          ctx.drawImage(img, padelPadding, padel.y + padelPadding, 12, 13)
        }
        ctx.closePath()
        ctx.stroke()
      })
    }

    const handleResize = (): void => {
      const canvas = canvasRef.current
      if (canvas) {
        // 重置为父容器（DIV）大小
        canvas!.height = canvas!.clientHeight
        canvas!.width = canvas!.clientWidth
      }
    }

    useEffect(() => {
      const handleVisibilityChange = () => {
        const visible = document.visibilityState === 'visible'
        setActive(visible)
        if (!visible) {
          rects.current.clear()
          padels.current = []
        }
      }
      document.addEventListener('visibilitychange', handleVisibilityChange)
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [])

    useEffect(() => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      let unmounted = false

      const animate = (): void => {
        if (unmounted || !active) {
          return
        }
        timer('Waterfall')
        step()
        draw(ctx!)
        requestAnimationFrame(animate)
      }

      if (ctx) {
        canvas!.width = window.innerWidth
        canvas!.height = window.innerHeight
        animate()
        window.addEventListener('resize', handleResize)
      }

      return (): void => {
        window.removeEventListener('resize', handleResize)
        unmounted = true
      }
    }, [theme])

    // 对外暴露的方法
    useImperativeHandle(
      ref,
      () => ({
        rectBegin: (key: string, from: number, to: number): void => {
          // 页面不可见时，忽略新音符
          if (!active) {
            return
          }
          rects.current.set(key, {
            from,
            to,
            grow: true,
            y: canvasRef.current!.height - minHeight,
            height: minHeight
          })
        },
        rectEnd: (key: string): void => {
          // 页面不可见时，仍处理音符的释放，防止恢复可见后，音符不自动释放
          const target = rects.current.get(key)
          if (target) {
            target.grow = false
            rects.current.delete(key)
            const randomKey = key + Math.random()
            rects.current.set(randomKey, target)
          }
        },
        setPadel: (down: boolean): void => {
          // 页面不可见时，忽略踏板事件
          if (!active) {
            return
          }
          if (canvasRef.current === null) return
          if (down) {
            padels.current.push({ y: canvasRef.current!.height, type: 'down' })
          } else {
            padels.current.push({ y: canvasRef.current!.height, type: 'up' })
          }
        }
      }),
      [rects, padels]
    )

    return (
      <div className="absolute w-full h-5/6 top-0 left-0 pointer-events-none z-0">
        <Hanabi ref={hanabiRef} theme={theme} />
        <canvas className="size-full" ref={canvasRef} />
      </div>
    )
  }
)

Waterfall.displayName = 'Waterfall'

export default Waterfall
