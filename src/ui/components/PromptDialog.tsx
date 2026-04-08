'use client'

import React, { ReactNode, useEffect, useId, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquareText, X } from 'lucide-react'

interface PromptDialogProps {
    open: boolean
    title: string
    description?: ReactNode
    placeholder?: string
    initialValue?: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: (value: string) => void
    onCancel: () => void
    optional?: boolean
}

export function PromptDialog({
    open,
    title,
    description,
    placeholder = '',
    initialValue = '',
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    onConfirm,
    onCancel,
    optional = false,
}: PromptDialogProps) {
    const [value, setValue] = useState(initialValue)
    const titleId = useId()
    const descriptionId = useId()

    useEffect(() => {
        if (!open) {
            return
        }
        setValue(initialValue)
    }, [initialValue, open])

    useEffect(() => {
        if (!open) {
            return
        }

        const previousOverflow = document.body.style.overflow
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCancel()
            }
        }

        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleEscape)

        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', handleEscape)
        }
    }, [onCancel, open])

    if (!open) return null

    const modalOverlayStyle: React.CSSProperties = {
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
            'radial-gradient(circle at top, rgba(var(--accent-rgb), 0.16), transparent 30%), rgba(24, 34, 48, 0.42)',
        backdropFilter: 'blur(10px)',
        padding: '24px',
    }

    const modalContentStyle: React.CSSProperties = {
        background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--bg-panel) 100%)',
        borderRadius: 'calc(var(--radius-card) + 4px)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-strong)',
        width: '100%',
        maxWidth: '34rem',
        overflow: 'hidden',
    }

    const buttonStyle: React.CSSProperties = {
        padding: '0.8rem 1.1rem',
        borderRadius: '16px',
        border: '1px solid transparent',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: '0.92rem',
        minWidth: 120,
        transition: 'all 0.2s ease',
    }

    const textareaStyle: React.CSSProperties = {
        width: '100%',
        minHeight: '110px',
        padding: '0.95rem 1rem',
        marginTop: '1rem',
        marginBottom: '0.5rem',
        borderRadius: '18px',
        border: '1px solid var(--border-subtle)',
        background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--surface-veil) 100%)',
        color: 'var(--text-main)',
        fontFamily: 'inherit',
        fontSize: '0.92rem',
        lineHeight: 1.6,
        resize: 'vertical',
        boxSizing: 'border-box',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.42)',
    }

    const handleConfirm = () => {
        if (!optional && !value.trim()) return
        onConfirm(value)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault()
            handleConfirm()
        }
    }

    return (
        <div style={modalOverlayStyle} onClick={onCancel}>
            <motion.div
                style={modalContentStyle}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
            >
                <div style={{ padding: '1.6rem 1.6rem 1.55rem' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            marginBottom: '1rem',
                        }}
                    >
                        <div style={{ display: 'flex', gap: '0.95rem', minWidth: 0 }}>
                            <div
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: '16px',
                                    display: 'grid',
                                    placeItems: 'center',
                                    color: 'var(--accent)',
                                    background: 'rgba(var(--accent-rgb), 0.12)',
                                    border: '1px solid rgba(var(--accent-rgb), 0.18)',
                                    flexShrink: 0,
                                }}
                            >
                                <MessageSquareText size={18} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div
                                    style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 800,
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        color: 'var(--text-faint)',
                                        marginBottom: '0.35rem',
                                    }}
                                >
                                    Entrada adicional
                                </div>
                                <h2
                                    id={titleId}
                                    style={{
                                        fontSize: '1.3rem',
                                        fontWeight: 700,
                                        margin: 0,
                                        color: 'var(--text-main)',
                                        letterSpacing: '-0.03em',
                                    }}
                                >
                                    {title}
                                </h2>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onCancel}
                            aria-label="Cerrar dialogo"
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: '14px',
                                border: '1px solid var(--border-subtle)',
                                background: 'var(--surface-raised)',
                                color: 'var(--text-muted)',
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0,
                                cursor: 'pointer',
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                    {description && (
                        <div
                            id={descriptionId}
                            style={{
                                fontSize: '0.94rem',
                                color: 'var(--text-muted)',
                                lineHeight: '1.65',
                                marginBottom: '0.75rem',
                            }}
                        >
                            {description}
                        </div>
                    )}

                    <textarea
                        style={textareaStyle}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            alignItems: 'center',
                            marginTop: '0.4rem',
                            flexWrap: 'wrap',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '0.78rem',
                                color: 'var(--text-faint)',
                                lineHeight: 1.5,
                            }}
                        >
                            {optional
                                ? 'Puedes dejar este campo vacio si solo quieres continuar.'
                                : 'Usa Ctrl + Enter para confirmar rapido.'}
                        </div>

                        <button
                            type="button"
                            onClick={onCancel}
                            style={{
                                ...buttonStyle,
                                background: 'linear-gradient(180deg, var(--bg-subtle) 0%, var(--surface-veil) 100%)',
                                color: 'var(--text-main)',
                                borderColor: 'var(--border-subtle)',
                            }}
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!optional && !value.trim()}
                            style={{
                                ...buttonStyle,
                                background: 'linear-gradient(180deg, var(--accent) 0%, var(--accent-strong) 100%)',
                                color: 'var(--text-on-accent)',
                                borderColor: 'rgba(var(--accent-rgb), 0.22)',
                                boxShadow: '0 18px 30px rgba(var(--accent-rgb), 0.16)',
                                opacity: (!optional && !value.trim()) ? 0.5 : 1,
                                cursor: (!optional && !value.trim()) ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
