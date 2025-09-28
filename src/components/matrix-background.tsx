"use client"

import { useEffect, useRef, useCallback, useState } from "react"

export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const dropsRef = useRef<number[]>([])
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on client side to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.scale(dpr, dpr)
    }

    // Reinitialize drops array when canvas resizes
    const fontSize = 14
    const columns = Math.floor(rect.width / fontSize)
    dropsRef.current = Array.from({ length: columns }, () => Math.floor(Math.random() * -100))
  }, [])

  useEffect(() => {
    if (!isClient) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Matrix characters
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"
    const charArray = chars.split("")
    const fontSize = 14

    // Initial setup
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    let lastTime = 0
    const targetFPS = 20 // Limit FPS for better performance
    const frameInterval = 1000 / targetFPS

    const draw = (currentTime: number) => {
      if (currentTime - lastTime < frameInterval) {
        animationRef.current = requestAnimationFrame(draw)
        return
      }
      lastTime = currentTime

      const rect = canvas.getBoundingClientRect()
      
      // Black background with slight transparency for trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Green text
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < dropsRef.current.length; i++) {
        // Random character
        const text = charArray[Math.floor(Math.random() * charArray.length)]
        
        // Draw character with random opacity
        const opacity = Math.random() * 0.5 + 0.5
        ctx.fillStyle = `rgba(0, 255, 65, ${opacity})`
        ctx.fillText(text, i * fontSize, dropsRef.current[i] * fontSize)

        // Reset drop to top randomly
        if (dropsRef.current[i] * fontSize > rect.height && Math.random() > 0.975) {
          dropsRef.current[i] = 0
        }
        dropsRef.current[i]++
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    // Start animation
    animationRef.current = requestAnimationFrame(draw)

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [isClient, resizeCanvas])

  // Don't render anything during SSR to prevent hydration issues
  if (!isClient) {
    return <div className="fixed inset-0 pointer-events-none opacity-10 z-0 bg-black/5" />
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-10 z-0"
      style={{ 
        background: "transparent",
        width: "100%",
        height: "100%"
      }}
    />
  )
}

// Alternative: Pure CSS Matrix Effect (No hydration issues)
export function CSSMatrixBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-10 z-0 overflow-hidden">
      <div className="matrix-rain">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="matrix-column"
            style={{
              left: `${(i / 20) * 100}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${2 + (i % 3)}s`
            }}
          >
            {Array.from({ length: 50 }, (_, j) => (
              <span
                key={j}
                className="matrix-char"
                style={{
                  animationDelay: `${j * 0.05}s`
                }}
              >
                {String.fromCharCode(0x30A0 + Math.floor(j * 1.5) % 96)}
              </span>
            ))}
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .matrix-rain {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .matrix-column {
          position: absolute;
          top: -100%;
          width: 20px;
          height: 200%;
          animation: matrix-fall linear infinite;
        }
        
        .matrix-char {
          display: block;
          color: #00ff41;
          font-family: monospace;
          font-size: 14px;
          line-height: 1.2;
          opacity: 0;
          animation: matrix-fade 0.1s ease-in-out infinite alternate;
        }
        
        @keyframes matrix-fall {
          from { transform: translateY(-100%); }
          to { transform: translateY(100vh); }
        }
        
        @keyframes matrix-fade {
          from { opacity: 0.2; }
          to { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}