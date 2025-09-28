"use client"

import { useEffect, useState } from "react"

export function TerminalCursor() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((prev) => !prev)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <span
      className={`inline-block w-2 h-5 bg-cyber-neon ml-1 transition-opacity duration-100 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    />
  )
}
