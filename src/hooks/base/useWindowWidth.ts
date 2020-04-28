import { useState, useEffect } from 'react'

/**
 * 获取当前视窗宽度
 * @returns {Object}
 */
export default function useWindowWidth(): number {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  })

  return width
}
