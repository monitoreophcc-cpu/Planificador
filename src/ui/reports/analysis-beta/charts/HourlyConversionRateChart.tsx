'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/reports/analysis-beta/ui/card";
import { useOperationalDashboardStore } from "@/store/useOperationalDashboardStore";
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo } from "react";

export default function HourlyConversionRateChart() {
    const { data } = useOperationalDashboardStore();

    const chartData = useMemo(() => {
        if (!data?.answered || !data.transactions) return [];
        // Assuming calculation: Transactions / Answered
        const hours = new Set<string>();
        data.answered.forEach(c => hours.add(c.hora.split(':')[0]));

        return Array.from(hours).sort().map(h => {
            const prefix = `${h}:`;
            const ans = data.answered.filter(c => c.hora.startsWith(prefix)).reduce((sum, c) => sum + c.llamadas, 0);
            const trx = data.transactions.filter(t => t.hora.startsWith(prefix)).length;

            return {
                hour: `${h}:00`,
                Conversion: ans > 0 ? (trx / ans) * 100 : 0
            };
        });
    }, [data]);

    if (chartData.length === 0) return null;

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Conversión por Hora (%)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Conversion" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
