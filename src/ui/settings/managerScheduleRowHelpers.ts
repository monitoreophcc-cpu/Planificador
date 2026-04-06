export function getManagerLoadColor(weeklyLoad: number) {
  if (weeklyLoad > 50) return '#ef4444'
  if (weeklyLoad > 44) return '#f97316'
  if (weeklyLoad > 38) return '#eab308'
  return '#22c55e'
}

export function getManagerLoadProgress(weeklyLoad: number) {
  return Math.min((weeklyLoad / 55) * 100, 100)
}
