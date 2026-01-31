
import { addDays, format, parseISO } from 'date-fns'
import { ActualOperationalLoad } from '../adapter/OperationalCorrelationAdapter'

export type PredictedOperationalLoad = ActualOperationalLoad & {
    source: 'PREDICTION_2026'
}

/**
 * Generates specific prediction curves for 2026 based on standard call center patterns.
 * 
 * Rules:
 * - Mondays: High volume (Recovery from weekend).
 * - Mid-week: Stable.
 * - Weekends: Lower volume.
 * - Growth factor: 1.15x vs standard baseline.
 */
export const PredictionService = {
    generate(startDate: string, days: number = 7): PredictedOperationalLoad[] {
        const result: PredictedOperationalLoad[] = []
        let cursor = parseISO(startDate)

        for (let i = 0; i < days; i++) {
            const dateStr = format(cursor, 'yyyy-MM-dd')
            const dayOfWeek = cursor.getDay() // 0=Sun, 6=Sat

            // Base Baseline
            let baseVolume = 1200 // Default daily volume

            // Seasonality
            if (dayOfWeek === 1) baseVolume = 1500 // Monday Peak
            if (dayOfWeek === 5) baseVolume = 1300 // Friday Peak
            if (dayOfWeek === 6 || dayOfWeek === 0) baseVolume = 800 // Weekend Dip

            // Day/Night Split (70/30 generic split)
            const dayVolume = Math.floor(baseVolume * 0.7)
            const nightVolume = Math.floor(baseVolume * 0.3)

            // Shift: DAY
            result.push({
                date: dateStr,
                shift: 'DAY',
                receivedCalls: dayVolume,
                answeredCalls: Math.floor(dayVolume * 0.95), // 95% SLA
                abandonedCalls: Math.floor(dayVolume * 0.05),
                transactions: Math.floor(dayVolume * 0.4), // 40% conversion
                source: 'PREDICTION_2026'
            })

            // Shift: NIGHT
            result.push({
                date: dateStr,
                shift: 'NIGHT',
                receivedCalls: nightVolume,
                answeredCalls: Math.floor(nightVolume * 0.98), // Higher SLA at night
                abandonedCalls: Math.floor(nightVolume * 0.02),
                transactions: Math.floor(nightVolume * 0.4),
                source: 'PREDICTION_2026'
            })

            cursor = addDays(cursor, 1)
        }

        return result
    }
}
