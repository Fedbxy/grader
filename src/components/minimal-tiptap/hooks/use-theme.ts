import * as React from 'react'

const QUERY = '(prefers-color-scheme: dark)'

const subscribe = (onChange: () => void) => {
  const darkModeMediaQuery = window.matchMedia(QUERY)
  darkModeMediaQuery.addEventListener('change', onChange)

  return () => {
    darkModeMediaQuery.removeEventListener('change', onChange)
  }
}

export const useTheme = () => {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  )
}

export default useTheme
