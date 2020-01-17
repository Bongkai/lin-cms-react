import { useRef } from 'react'

export default function useFirstMountState(): boolean {
  const isFirstMount = useRef<boolean>(true)

  if (isFirstMount.current) {
    isFirstMount.current = false
    return true
  }

  return isFirstMount.current
}
