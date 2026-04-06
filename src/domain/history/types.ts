export interface HistoryEvent {
  id: string
  timestamp: string
  title: string
  category: 'INCIDENT' | 'RULE' | 'CALENDAR' | 'PLANNING' | 'SYSTEM' | 'SETTINGS'
  subject?: string
  impact?: string
  description?: string
  metadata?: Record<string, any>
}
