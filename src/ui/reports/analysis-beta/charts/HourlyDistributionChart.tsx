'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/reports/analysis-beta/ui/card";
import { useOperationalDashboardStore } from "@/store/useOperationalDashboardStore";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo } from "react";

export default function HourlyDistributionChart() {
    const { data } = useOperationalDashboardStore();

    const chartData = useMemo(() => {
        if (!data?.answered || !data?.abandoned?.clean) return [];

        const hours = new Set<string>();
        data.answered.forEach(c => hours.add(c.hora.split(':')[0]));
        data.abandoned.clean.forEach(c => hours.add(c.hora.split(':')[0]));

        return Array.from(hours).sort().map(h => {
            const prefix = `${h}:`;
            const ans = data.answered.filter(c => c.hora.startsWith(prefix)).reduce((sum, c) => sum + c.llamadas, 0);
            const abn = data.abandoned.clean.filter(c => c.hora.startsWith(prefix)).length;

            return {
                hour: `${h}:00`,
                Contestadas: ans,
                Abandonadas: abn
            };
        });
    }, [data]);

    if (chartData.length === 0) return null;

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Distribución de Llamadas por Hora</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="Contestadas" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                        <Area type="monotone" dataKey="Abandonadas" stackId="1" stroke="#ff8042" fill="#ff8042" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
