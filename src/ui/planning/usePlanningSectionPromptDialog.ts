'use client'

import { useState } from 'react'
import type { PromptConfig } from './planningSectionTypes'

export function usePlanningSectionPromptDialog() {
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null)

  const showConfirmWithInput = (options: {
    title: string
    description: string
    placeholder?: string
    optional?: boolean
  }): Promise<string | undefined> => {
    return new Promise(resolve => {
      setPromptConfig({
        open: true,
        ...options,
        resolve: value => {
          setPromptConfig(null)
          resolve(value)
        },
      })
    })
  }

  return {
    promptConfig,
    showConfirmWithInput,
  }
}
