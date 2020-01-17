import { useEffect, useRef, EffectCallback, DependencyList } from 'react'
import isEqual from 'react-fast-compare'

export default function useDeepCompareEffect(
  effect: EffectCallback,
  deps: DependencyList,
) {
  const ref = useRef<DependencyList | undefined>(undefined)

  // 对 deps 进行深比较
  if (!isEqual(deps, ref.current)) {
    ref.current = deps
  }

  useEffect(effect, ref.current)
}
