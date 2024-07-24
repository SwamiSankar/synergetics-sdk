import React, {
  AriaAttributes,
  CSSProperties,
  MutableRefObject,
  ReactHTML,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { ButtonProps } from '@synergetics/embed'

import { genericEmbed, GenericEmbed } from '../utils'

import { InlineStyle } from './inline-style'

type ButtonComponentBaseProps = {
  id: string
  as?: keyof ReactHTML
  buttonProps?: ButtonProps & AriaAttributes
  wid?:string
  token?: string
  avatarAssetId?: string
  chatOnly?: boolean
  modelOnly?: boolean
  chatPosition?: 'left' | 'right' | 'top' | 'bottom'
  style?: CSSProperties
  className?: string
  children?: ReactNode
  embedRef?: MutableRefObject<GenericEmbed | undefined>
}

export type ButtonComponentProps<T> = T & ButtonComponentBaseProps

// type CreateFnProps<T> = Omit<ButtonComponentProps<T>, keyof ButtonComponentBaseProps> & {
//   wid?: string
//   token?: string
//   avatarAssetId?: string
//   chatOnly?: boolean
//   modelOnly?: boolean
//   chatPosition?: 'left' | 'right' | 'top' | 'bottom'
// }

type CreateFn = (id: string, props: any) => GenericEmbed

function makeButtonComponent<T>(createFn: CreateFn, cssFilename: string) {
  return ({
    id,
    children,
    as = 'button',
    style = {},
    className = '',
    buttonProps,
    embedRef,
    ...props
  }: ButtonComponentProps<T>) => {
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
      return () => ref.current?.unmount()
    }, [id, props, ref])

    const handleClick = useMemo(() => () => ref.current?.open(), [ref])

    const triggerElement = React.createElement(as, {
      style,
      className,
      onClick: handleClick,
      'data-testid': `tf-v1-${cssFilename}`,
      children,
      ...buttonProps,
    })

    return (
      <>
        <InlineStyle key={`${id}-${cssFilename}`} filename={cssFilename} />
        {triggerElement}
      </>
    )
  }
}

export { makeButtonComponent }
