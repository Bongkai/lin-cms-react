import React, { ReactElement, CSSProperties } from 'react'
import { Spin } from 'antd'
import { SpinProps } from 'antd/lib/spin'

import './loading-wrapper.scss'

interface ILoadingWrapper extends SpinProps {
  loading: boolean
  minHeight?: string | number
  wrapperClassName?: string
  children?: ReactElement | ReactElement[]
}

LoadingWrapper.defaultProps = {
  minHeight: 200,
  size: 'large',
}

export default function LoadingWrapper({
  delay,
  indicator,
  size,
  loading,
  tip,
  wrapperClassName,
  minHeight,
  children,
  ...restProps
}: ILoadingWrapper) {
  const wrapperStyles: CSSProperties = {
    minHeight: loading ? minHeight : 0,
    position: 'relative',
  }

  return (
    <div style={wrapperStyles} {...restProps}>
      {children}
      <Spin
        className='loading-wrapper-spin'
        delay={delay}
        indicator={indicator}
        size={size}
        spinning={loading}
        tip={tip}
        wrapperClassName={wrapperClassName}
      />
    </div>
  )
}
