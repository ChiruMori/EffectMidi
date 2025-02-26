// 向上的音符瀑布
import React, { useEffect, useImperativeHandle, useRef } from 'react'
import C, { ThemeTypeEnum } from '@renderer/common/colors'
import timer from '@renderer/components/effects/timer'
import paddelUp from '@renderer/assets/pedalup.svg'
import paddelDown from '@renderer/assets/pedaldown.svg'

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

const baseSpeed = 0.5
const minHeight = 5
const padelAreaHeight = 20
const padelPadding = 10
const globalAlpha = 0.8

const Waterfall = React.forwardRef(
  (props: WaterfallProps, ref: React.Ref<WaterfallRef>): JSX.Element => {
    const { theme } = props
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [rects, setRects] = React.useState(new Map<string, Rect>())
    const [padels, setPadels] = React.useState([] as {
      y: number,
      type: 'down' | 'up'
    }[])

    const rectsRef = useRef<Map<string, Rect>>(new Map())
    const padelsRef = useRef<{ y: number, type: 'down' | 'up' }[]>([])
    useEffect(() => {
      rectsRef.current = rects
    }, [rects])

    useEffect(() => {
      padelsRef.current = padels
    }, [padels])

    function step(): void {
      const newRects = new Map(rectsRef.current)
      newRects.forEach((rect) => {
        // 更新矩形位置、高度
        if (rect.grow) {
          rect.height = (rect.height ?? minHeight) + baseSpeed
        }
        rect.y = (rect.y ?? canvasRef.current!.height) - baseSpeed
      })
      // 移除不可见的矩形
      for (const [key, rect] of newRects) {
        if (rect.y! + rect.height! < 0) {
          newRects.delete(key)
        }
      }
      setRects(newRects)

      const newPadels = [...padelsRef.current]
      newPadels.forEach((padel) => {
        // 更新踏板符号位置
        padel.y -= baseSpeed
      })
      newPadels.filter((padel) => {
        // 移除不可见的踏板符号
        return padel.y + padelAreaHeight > 0
      })
      setPadels(newPadels)
    }

    function draw(): void {
      const ctx = canvasRef.current!.getContext('2d')!
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
      rectsRef.current.forEach((rect) => {
        const fromX = canvasRef.current!.width * rect.from
        const toX = canvasRef.current!.width * rect.to
        ctx.roundRect(fromX, rect.y!, toX - fromX, rect.height!, 5)
        ctx.fill()
        ctx.stroke()
      })
      // 绘制踏板符号（SVG 文件）
      padels.forEach((padel) => {
        const img = new Image()
        if (padel.type === 'down') {
          // 踩下踏板符号，先绘制符号，再绘制踏板分割线
          img.src = paddelDown
          ctx.drawImage(img, padelPadding, padel.y, 26, 40)
          ctx.moveTo(0, padel.y + padelPadding)
          ctx.lineTo(canvasRef.current!.width, padel.y + padelPadding)
        } else {
          // 抬起踏板符号，先绘制踏板分割线，再绘制符号
          img.src = paddelUp
          ctx.moveTo(0, padel.y)
          ctx.lineTo(canvasRef.current!.width, padel.y)
          ctx.drawImage(img, padelPadding, padel.y + padelPadding, 35, 35)
        }
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
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      let unmounted = false

      const animate = (): void => {
        if (unmounted) {
          return
        }
        timer('Waterfall')
        step()
        draw()
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
    useImperativeHandle(ref, () => ({
      ...ref,
      rectBegin: (key: string, from: number, to: number): void => {
        setRects((prev) => {
          const next = new Map(prev)
          next.set(key, { from, to, grow: true, y: canvasRef.current!.height - minHeight, height: minHeight })
          return next
        })
        console.log('down', key, rects);
      },
      rectEnd: (key: string): void => {
        setRects((prev) => {
          const next = new Map(prev)
          next.set(key, { ...next.get(key)!, grow: false })
          return next
        })
        console.log('up', key, rects);
      },
      setPadel: (padel: boolean): void => {
        setPadels((prev) => {
          if (padel) {
            return [...prev, { y: canvasRef.current!.height, type: 'down' }]
          } else {
            return [...prev, { y: canvasRef.current!.height, type: 'up' }]
          }
        })
        console.log('padel', padel, padels);
      }
    }))

    return (
      <div className='absolute w-full h-5/6 top-0 left-0 pointer-events-none z-30'>
        <canvas
          className="size-full"
          ref={canvasRef}
        />
      </div>
    )
  }
)

export default Waterfall
