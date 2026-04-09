'use client'

import React from 'react'
import { AuditDashboard } from './AuditDashboard'

export function AuditPanel({ embedded = false }: { embedded?: boolean }) {
    return (
        <div style={{ padding: embedded ? '0' : '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {!embedded && (
                <header style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Historial y control del sistema</h1>
                    <p style={{ color: '#6b7280' }}>
                        Registro de cambios y semanas guardadas de la planificación.
                    </p>
                </header>
            )}

            <AuditDashboard />
        </div>
    )
}
