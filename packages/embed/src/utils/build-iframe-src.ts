import { ActionableOptions, BaseOptions, EmbedType, SizeableOptions, UrlOptions } from '../base'
import { DEFAULT_DOMAIN } from '../constants'

import { removeUndefinedKeys } from './remove-undefined-keys'
import { isDefined } from './is-defined'
import { getHubspotHiddenFields } from './hubspot'

const getDefaultUrlOptions = (): any => ({
  source: window?.location?.hostname.replace(/^www\./, ''),
  medium: 'embed-sdk',
  mediumVersion: 'next',
})

const addDefaultUrlOptions = (options: UrlOptions): UrlOptions => {
  if (!options.noHeading) {
    options.noHeading = document.querySelectorAll('h1').length > 0
  }

  return { ...getDefaultUrlOptions(), ...removeUndefinedKeys(options) }
}


const mapOptionsToQueryParams = (
  options: UrlOptions & SizeableOptions & ActionableOptions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> => {
  const {
    wid,
    token,
    avatarAssetId,
    chatOnly,
    modelOnly,
    chatPosition,
    autoResize,
    disableScroll,
  } = options
  const params = {
    wid,
    token,
    avatarAssetId,
    chatOnly: chatOnly ? 'true' : undefined,
    modelOnly: modelOnly ? 'true' : undefined,
    chatPosition,
    autoResize: autoResize ? 'true' : undefined,
    disableScroll: disableScroll ? 'true' : undefined,
  }
  return params
}

const getBaseUrl = (formString: string, domain = DEFAULT_DOMAIN): URL => {
  if (formString.startsWith('http://') || formString.startsWith('https://')) {
    return new URL(formString)
  }

  return new URL(`https://${domain}/to/${formString}`)
}

const makePreselectParam = (preselect?: Record<string, string>) => {
  if (!preselect) {
    return null
  }
  const questionRef = Object.keys(preselect).at(0)
  const answerRef = (questionRef && preselect[questionRef]) || undefined

  if (questionRef === undefined || answerRef === undefined) {
    return null
  }
  return {
    key: `answers-${questionRef}`,
    value: answerRef,
  }
}

const buildHashParams = (url: URL, options: BaseOptions & UrlOptions): string => {
  const hashParams = new URLSearchParams()

  if (options.hidden) {
    Object.entries(options.hidden)
      .filter(([, paramValue]) => isDefined(paramValue) && paramValue !== '')
      .forEach(([paramName, paramValue]) => {
        // if transitive params is true, make hidden field values take priority over transitive params
        if (typeof options.transitiveSearchParams === 'boolean') {
          url.searchParams.delete(paramName)
        }
        hashParams.set(paramName, paramValue)
      })
  }

  const preselectParam = makePreselectParam(options.preselect)
  if (preselectParam) {
    const { key, value } = preselectParam
    hashParams.set(key, value)
  }

  return hashParams.toString()
}

export const buildIframeSrc = (params: BuildIframeSrcOptions): string => {
  const { domain, formId,options } = params
  const queryParams = mapOptionsToQueryParams(addDefaultUrlOptions(options))

  const url = getBaseUrl(formId, domain)

  Object.entries(queryParams)
    .filter(([, paramValue]) => isDefined(paramValue))
    .forEach(([paramName, paramValue]) => {
      url.searchParams.set(paramName, paramValue)
    })

  if (options.hubspot) {
    const hubspotHiddenFields = getHubspotHiddenFields()
    options.hidden = { ...options.hidden, ...hubspotHiddenFields }
  }

  url.hash = buildHashParams(url, options)

  return url.href
}

type BuildIframeSrcOptions = {
  domain?: string
  formId: string
  embedId: string
  type: EmbedType
  options: BaseOptions & UrlOptions
}
