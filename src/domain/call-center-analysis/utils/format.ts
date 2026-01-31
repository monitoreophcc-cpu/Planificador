export function formatPercent(value: number | undefined | null): string {
    if (value === undefined || value === null || isNaN(value)) return '0%';
    // If value is 0.15, it means 15%? Or 15 means 15%? 
    // In kpi.service.ts, I saw logic: (contestadas / recibidas) * 100.
    // So 15.5 means 15.5%.
    return `${value.toFixed(1)}%`;
}

export function formatCurrency(value: number | undefined | null): string {
    if (value === undefined || value === null || isNaN(value)) return '$0';
    return `$${value.toFixed(2)}`;
}
