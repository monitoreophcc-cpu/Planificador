'use client'

/**
 * Legacy hook kept as a stub because the filesystem did not allow removing the
 * original file during this cleanup. The active incident flow now lives in the
 * Daily Log submission helpers.
 */
export function useIncidentFlow(): never {
  throw new Error(
    'useIncidentFlow está obsoleto. Usa el flujo activo de src/ui/logs/useDailyLogSubmission.tsx.'
  )
}
