import React, { useCallback, useEffect, useRef } from 'react'
import C, { ThemeTypeEnum } from '@renderer/common/colors'
import timer from '../timer'

interface GlowEffectProps {
  theme: ThemeTypeEnum
  height?: number
}

const GlowEffect: React.FC<GlowEffectProps> = ({ theme, height = 150 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cacheCanvas = useRef<OffscreenCanvas>()
  const animationFrameId = useRef<number>()
  const lastRenderTime = useRef<number>(0)

  // 光晕参数配置
  const GLOW_CONFIG = {
    frequency: 0.0005, // 波动频率
    amplitude: 200, // 波动幅度
    baseBlur: 10, // 基础模糊半径
    blurRange: 5, // 模糊范围
    layers: 15, // 光晕层数
    opacity: 0.7, // 基础透明度
    renderInterval: 32, // 渲染间隔（约30fps）
    cacheWidth: 1024, // 缓存Canvas宽度
    colorOffset: 80 // 颜色偏移量
  }

  // 初始化离屏Canvas
  useEffect(() => {
    if (typeof OffscreenCanvas !== 'undefined') {
      cacheCanvas.current = new OffscreenCanvas(GLOW_CONFIG.cacheWidth, height)
      renderCache()
    }
    return (): void => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [theme, height])

  // 生成缓存内容
  const renderCache = useCallback(() => {
    if (!cacheCanvas.current) return

    const ctx = cacheCanvas.current.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, GLOW_CONFIG.cacheWidth + GLOW_CONFIG.amplitude, height)

    // 闭包捕获最新值
    const currentTheme = theme
    const layerHeight = height * 2
    const layerWidth = GLOW_CONFIG.cacheWidth / GLOW_CONFIG.layers

    // 绘制多层椭圆
    for (let i = 0; i < GLOW_CONFIG.layers; i++) {
      ctx.beginPath()
      ctx.ellipse(
        i * layerWidth + layerWidth / 2, // X轴中心
        height, // Y轴中心
        layerWidth / 2 + 20, // X轴半径
        layerHeight / 2, // Y轴半径
        0,
        0,
        Math.PI * 2
      )
      ctx.fillStyle = C(currentTheme).random(GLOW_CONFIG.colorOffset)
      ctx.fill()
    }
  }, [theme, height]) // 显式声明依赖

  // 主绘制循环
  const draw = (timestamp: number): void => {
    const canvas = canvasRef.current
    if (!canvas || !cacheCanvas.current) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 控制渲染频率
    if (timestamp - lastRenderTime.current < GLOW_CONFIG.renderInterval) {
      animationFrameId.current = requestAnimationFrame(draw)
      return
    }
    lastRenderTime.current = timestamp

    // 计算动态参数
    const phase = timestamp * GLOW_CONFIG.frequency
    const offset = Math.sin(phase) * GLOW_CONFIG.amplitude
    const blur = GLOW_CONFIG.baseBlur + Math.abs(Math.sin(phase)) * GLOW_CONFIG.blurRange

    // 绘制逻辑
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.filter = `blur(${blur}px)`
    ctx.globalAlpha = GLOW_CONFIG.opacity
    ctx.drawImage(
      cacheCanvas.current,
      0, // 源X
      0, // 源Y
      1024, // 源宽度
      height, // 源高度
      offset - GLOW_CONFIG.amplitude, // 目标X
      0, // 目标Y
      canvas.width + (GLOW_CONFIG.amplitude << 1), // 目标宽度
      height // 目标高度
    )
    ctx.restore()

    timer('GlowEffect')
    animationFrameId.current = requestAnimationFrame(draw)
  }

  // 初始化Canvas尺寸
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateSize = (): void => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.clientWidth * dpr
      canvas.height = height * dpr
      canvas.style.height = `${height}px`
      canvas.getContext('2d')?.scale(dpr, dpr)
    }

    // 初始尺寸设置
    updateSize()

    // 启动动画循环
    animationFrameId.current = requestAnimationFrame(draw)

    // 响应式处理
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(canvas.parentElement!)

    // 清理函数
    return (): void => {
      resizeObserver.disconnect()
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [theme, height])

  return (
    <div
      className="absolute bottom-[16%] left-0 w-full pointer-events-none"
      style={{
        height: `${height}px`,
        maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 10%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0))',
        WebkitMaskImage:
          '-webkit-linear-gradient(to top, rgba(0,0,0,1) 10%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0))'
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full" style={{ mixBlendMode: 'plus-lighter' }} />
    </div>
  )
}

export default GlowEffect
