import React, { CSSProperties, useEffect, useRef } from 'react'
import { createWidget, WidgetOptions } from '@synergetics/embed'

import { InlineStyle } from './inline-style'

export type WidgetProps = Omit<WidgetOptions, 'container'> & {
  id: string
  wid?: string
  token?: string
  avatarAssetId?: string
  style?: CSSProperties
  className?: string
  chatOnly?: boolean
  modelOnly?: boolean
  chatPosition?: 'left' | 'right' | 'top' | 'bottom'
}

export const Widget = ({ id, style = {}, className = '',props}: WidgetProps) => {
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (container.current) {
      const { wid, token, avatarAssetId, chatOnly, modelOnly, chatPosition, ...otherProps } = props
      const ref = createWidget(id, { 
        ...otherProps, 
        container: container.current,
        wid,
        token,
        avatarAssetId,
        chatOnly,
        modelOnly,
        chatPosition
      })
      return () => {
        ref.unmount()
      }
    }
    else{
      console.log("No Error");
    }
  }, [id, props])

  return (
    <>
      <InlineStyle key={id} filename="widget" />
      <div style={style} className={className} ref={container}></div>
    </>
  )
}
