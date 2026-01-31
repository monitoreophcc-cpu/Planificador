'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/reports/analysis-beta/ui/card";
import { useOperationalDashboardStore } from "@/store/useOperationalDashboardStore";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function ShiftPerformanceChart() {
    const { metrics, data: storeData, showPrediction } = useOperationalDashboardStore();
    const day = metrics?.kpisByShift?.Día;
    const night = metrics?.kpisByShift?.Noche;

    const predictedDay = storeData?.predictedLoad
        ?.filter((p) => p.shift === 'DAY')
        .reduce((sum, p) => sum + p.receivedCalls, 0) || 0;

    const predictedNight = storeData?.predictedLoad
        ?.filter((p) => p.shift === 'NIGHT')
        .reduce((sum, p) => sum + p.receivedCalls, 0) || 0;

    if (!day || !night) return null;

    const data = [
        {
            name: 'Día',
            Recibidas: day.recibidas,
            Contestadas: day.contestadas,
            Abandonadas: day.abandonadas,
            Predicción: showPrediction ? predictedDay : 0
        },
        {
            name: 'Noche',
            Recibidas: night.recibidas,
            Contestadas: night.contestadas,
            Abandonadas: night.abandonadas,
            Predicción: showPrediction ? predictedNight : 0
        },
    ];

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Rendimiento por Turno</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Recibidas" fill="#8884d8" />
                        <Bar dataKey="Contestadas" fill="#82ca9d" />
                        <Bar dataKey="Abandonadas" fill="#ff8042" />
                        {showPrediction && <Bar dataKey="Predicción" fill="#8b5cf6" stroke="#7c3aed" strokeWidth={1} strokeDasharray="5 5" />}
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
