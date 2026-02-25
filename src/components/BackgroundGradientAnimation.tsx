import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'

const darkColors = {
  gradientBackgroundStart: 'rgb(10, 10, 20)',
  gradientBackgroundEnd: 'rgb(18, 18, 32)',
  firstColor: '67, 66, 255',   // primary #4342FF
  secondColor: '50, 30, 180',  // dark indigo
  thirdColor: '20, 80, 210',   // cobalt
  fourthColor: '90, 40, 170',  // purple
  fifthColor: '30, 50, 150',   // navy
  pointerColor: '67, 66, 255',
  blendingValue: 'hard-light' as React.CSSProperties['mixBlendMode'],
}

const lightColors = {
  gradientBackgroundStart: 'rgb(255, 255, 255)',
  gradientBackgroundEnd: 'rgb(244, 244, 255)',
  firstColor: '180, 175, 255',  // soft blue-purple
  secondColor: '200, 165, 255', // soft lavender
  thirdColor: '155, 200, 255',  // soft sky
  fourthColor: '210, 185, 255', // soft lilac
  fifthColor: '175, 215, 255',  // soft cornflower
  pointerColor: '180, 175, 255',
  blendingValue: 'multiply' as React.CSSProperties['mixBlendMode'],
}

const SIZE = '80%'

export default function BackgroundGradientAnimation() {
  const { theme } = useTheme()
  const colors = theme === 'dark' ? darkColors : lightColors

  const containerRef = useRef<HTMLDivElement>(null)
  const interactiveRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const positionRef = useRef({ curX: 0, curY: 0, tgX: 0, tgY: 0 })

  const animate = useCallback(function animate() {
    if (!interactiveRef.current) return
    const { curX, curY, tgX, tgY } = positionRef.current
    positionRef.current.curX = curX + (tgX - curX) / 20
    positionRef.current.curY = curY + (tgY - curY) / 20
    interactiveRef.current.style.transform = `translate(${Math.round(positionRef.current.curX)}px, ${Math.round(positionRef.current.curY)}px)`
    animationRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [animate])

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      positionRef.current.tgX = event.clientX - rect.left
      positionRef.current.tgY = event.clientY - rect.top
    }
  }, [])

  const { firstColor, secondColor, thirdColor, fourthColor, fifthColor, pointerColor, blendingValue } = colors

  const gradientStyle: React.CSSProperties = {
    width: SIZE,
    height: SIZE,
    mixBlendMode: blendingValue,
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden -z-10"
      style={{
        background: `linear-gradient(40deg, ${colors.gradientBackgroundStart}, ${colors.gradientBackgroundEnd})`,
        transition: 'background 0.8s ease',
      }}
      onMouseMove={handleMouseMove}
    >
      {/* SVG filter — goo effect */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id="goo-filter">
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              result="goo"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Blobs container */}
      <div className="absolute inset-0 blur-lg [filter:url(#goo-filter)_blur(40px)]">

        {/* Blob 1 — centro, rota en loop */}
        <motion.div
          className="absolute rounded-full"
          style={{
            ...gradientStyle,
            background: `radial-gradient(circle at center, rgb(${firstColor}) 0%, rgb(${firstColor}) 50%, transparent 50%)`,
            top: `calc(50% - ${SIZE} / 2)`,
            left: `calc(50% - ${SIZE} / 2)`,
            transformOrigin: 'center center',
          }}
          animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
          }}
        />

        {/* Blob 2 — orbita izquierda */}
        <motion.div
          className="absolute rounded-full opacity-80"
          style={{
            ...gradientStyle,
            background: `radial-gradient(circle at center, rgba(${secondColor}, 0.8) 0%, transparent 50%)`,
            top: `calc(50% - ${SIZE} / 2)`,
            left: `calc(50% - ${SIZE} / 2)`,
            transformOrigin: 'calc(50% - 400px) center',
          }}
          animate={{ rotate: [0, -360], x: [0, 100, -50, 0], y: [0, -80, 60, 0] }}
          transition={{
            rotate: { duration: 15, repeat: Infinity, ease: 'linear' },
            x: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
          }}
        />

        {/* Blob 3 — orbita derecha */}
        <motion.div
          className="absolute rounded-full opacity-80"
          style={{
            ...gradientStyle,
            background: `radial-gradient(circle at center, rgba(${thirdColor}, 0.8) 0%, transparent 50%)`,
            top: `calc(50% - ${SIZE} / 2)`,
            left: `calc(50% - ${SIZE} / 2)`,
            transformOrigin: 'calc(50% + 400px) center',
          }}
          animate={{ rotate: [0, 360], x: [0, -120, 80, 0], y: [0, 100, -40, 0] }}
          transition={{
            rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
            x: { duration: 14, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 16, repeat: Infinity, ease: 'easeInOut' },
          }}
        />

        {/* Blob 4 — abajo izquierda */}
        <motion.div
          className="absolute rounded-full opacity-70"
          style={{
            ...gradientStyle,
            background: `radial-gradient(circle at center, rgba(${fourthColor}, 0.8) 0%, transparent 50%)`,
            top: `calc(50% - ${SIZE} / 2)`,
            left: `calc(50% - ${SIZE} / 2)`,
            transformOrigin: 'calc(50% - 200px) center',
          }}
          animate={{ rotate: [0, -360], x: [0, 60, -100, 0], y: [0, -60, 80, 0] }}
          transition={{
            rotate: { duration: 18, repeat: Infinity, ease: 'linear' },
            x: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 14, repeat: Infinity, ease: 'easeInOut' },
          }}
        />

        {/* Blob 5 — lejos */}
        <motion.div
          className="absolute rounded-full opacity-80"
          style={{
            ...gradientStyle,
            background: `radial-gradient(circle at center, rgba(${fifthColor}, 0.8) 0%, transparent 50%)`,
            top: `calc(50% - ${SIZE} / 2)`,
            left: `calc(50% - ${SIZE} / 2)`,
            transformOrigin: 'calc(50% - 800px) calc(50% + 800px)',
          }}
          animate={{ rotate: [0, 360], x: [0, -80, 120, 0], y: [0, 120, -60, 0] }}
          transition={{
            rotate: { duration: 22, repeat: Infinity, ease: 'linear' },
            x: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
          }}
        />

        {/* Pointer interactivo */}
        <div
          ref={interactiveRef}
          className="absolute w-full h-full -top-1/2 -left-1/2 opacity-70"
          style={{
            background: `radial-gradient(circle at center, rgba(${pointerColor}, 0.8) 0%, transparent 50%)`,
            mixBlendMode: blendingValue,
          }}
        />
      </div>
    </div>
  )
}
