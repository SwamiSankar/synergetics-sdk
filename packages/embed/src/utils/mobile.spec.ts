/**
 * @jest-environment jsdom
 */

import { isBigScreen, isFullscreen, isMobile } from './mobile'

const userAgentSpy = jest.spyOn(window.navigator, 'userAgent', 'get')
const windowScreenSpy = jest.spyOn(window, 'screen', 'get')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).userAgent = userAgentSpy
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).windowScreen = windowScreenSpy

const screens: [boolean, number, number][] = [
  [false, 375, 675],
  [true, 1500, 1000],
  [false, 1500, 675],
  [false, 375, 1000],
  [true, 1024, 768],
]

const userAgents: [boolean, string][] = [
  [true, 'Mobile/14D27 Safari/602.1'],
  [true, 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B)'],
  [false, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3)'],
  [true, 'fake mobile userAgent'],
  [false, 'fake desktop userAgent'],
  [true, 'fake tablet userAgent'],
]

describe('mobile', () => {
  describe('#isBigScreen', () => {
    test.each(screens)('should be %p for width %p px and height %p px', (value, width, height) => {
      windowScreenSpy.mockReturnValue({ width, height } as Screen)
      const result = isBigScreen()
      expect(result).toBe(value)
    })
  })
  describe('#isMobile', () => {
    test.each(userAgents)('should be %p for user agent %p', (value, userAgent) => {
      userAgentSpy.mockReturnValue(userAgent)
      const result = isMobile()
      expect(result).toBe(value)
    })
  })
  describe('#isFullscreen', () => {
    const fullscreens = userAgents.flatMap(([isMobile, userAgent]) =>
      screens.map(([isBigScreen, width, height]) => [isMobile && !isBigScreen, userAgent, width, height])
    )
    test.each(fullscreens)(
      'should be %p for user agent %p, width %p px and height %p px',
      (value, userAgent, width, height) => {
        windowScreenSpy.mockReturnValue({ width, height } as Screen)
        userAgentSpy.mockReturnValue(userAgent as string)
        const result = isFullscreen()
        expect(result).toBe(value)
      }
    )
  })
})
