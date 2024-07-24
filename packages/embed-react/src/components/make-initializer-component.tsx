import React, { MutableRefObject, useEffect, useRef } from 'react'

import { genericEmbed, GenericEmbed } from '../utils'

import { InlineStyle } from './inline-style'

type InitializerComponentBaseProps = {
  id: string
  embedRef?: MutableRefObject<GenericEmbed | undefined>
  wid?:string
  token?: string
  avatarAssetId?: string
  chatOnly?: boolean
  modelOnly?: boolean
  chatPosition?: 'left' | 'right' | 'top' | 'bottom'
}

export type InitializerComponentProps<T> = T & InitializerComponentBaseProps

// type CreateFnProps<T> = Omit<InitializerComponentProps<T>, keyof InitializerComponentBaseProps> & {
//   wid?: string
//   token?: string
//   avatarAssetId?: string
//   chatOnly?: boolean
//   modelOnly?: boolean
//   chatPosition?: 'left' | 'right' | 'top' | 'bottom'
// }

type CreateFn = (id: string, props: any) => GenericEmbed

function makeInitializerComponent<T>(createFn: CreateFn, cssFilename: string) {
  return ({ id, embedRef, ...props }: InitializerComponentProps<T>) => {
    const internalRef = useRef(genericEmbed)
    const ref = embedRef || internalRef

    useEffect(() => {
      const { wid, token, avatarAssetId, chatOnly, modelOnly, chatPosition, ...otherProps } = props
      ref.current = createFn(id, { 
        ...otherProps, 
        wid, 
        token, 
        avatarAssetId, 
        chatOnly, 
        modelOnly, 
        chatPosition 
      })
      return () => {
        ref.current?.unmount()
      }
    }, [id, props, ref])

    return <InlineStyle key={`${id}-${cssFilename}`} filename={cssFilename} />
  }
}

export { makeInitializerComponent }
