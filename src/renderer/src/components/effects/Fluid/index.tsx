import React, { useEffect, useRef } from 'react'
import C, { ThemeTypeEnum } from '@renderer/common/colors'
import fluidTexture from '@renderer/assets/fluid_texture.png'
import timer from '../timer'

interface FluidEffectProps {
  theme: ThemeTypeEnum
}

declare global {
  interface Window {
    FluidSimulation: {
      init: (canvas: HTMLCanvasElement, config: Record<string, any>, texturePath: string) => void
      destroy: () => void
    }
  }
}

const FluidEffect: React.FC<FluidEffectProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scriptRef = useRef<HTMLScriptElement>()

  useEffect(() => {
    const loadScript = () => {
      if (!canvasRef.current || scriptRef.current) return

      scriptRef.current = document.createElement('script')
      scriptRef.current.src = '/src/components/effects/Fluid/webglFluid.js'
      scriptRef.current.onload = () => {
        window.FluidSimulation.init(canvasRef.current!, {
          SIM_RESOLUTION: 128,
          DYE_RESOLUTION: 1024,
        }, fluidTexture)
      }
      document.body.appendChild(scriptRef.current)
    }

    loadScript()
    return () => {
      window.FluidSimulation?.destroy()
      scriptRef.current?.remove()
    }
  }, [theme])

  const handlePointer = (e: React.PointerEvent) => {
    canvasRef.current?.dispatchEvent(
      new PointerEvent(e.type, {
        clientX: e.clientX,
        clientY: e.clientY,
        pointerId: e.pointerId
      })
    )
  }

  // WebGL 无法实现透明背景，需要整体透明处理

  return (
    <div
      {...{ onPointerDown: handlePointer, onPointerMove: handlePointer, onPointerUp: handlePointer }}
      style={{ touchAction: 'none' }}
      className="absolute w-full h-5/6 top-0 left-0 z-0 opacity-50"
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  )
}

export default FluidEffect
