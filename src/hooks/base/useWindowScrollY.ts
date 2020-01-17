import { useState, useEffect } from 'react'

export default function useWindowScrollY() {
  const [scrollY, setScrollY] = useState(0)
  const [targetDom, setTargetDom] = useState(null)

  useEffect(() => {
    function handleScroll(ev: any) {
      setScrollY(ev.target.scrollTop)
      setTargetDom(ev)
    }
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { scrollY, targetDom }
}
