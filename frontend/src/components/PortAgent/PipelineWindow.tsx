import { useState, useEffect } from 'react'
import { X, Check, AlertCircle, Loader, Clock } from 'lucide-react'

interface PipelineStep {
    agent: string
    status: 'pending' | 'running' | 'success' | 'error'
    duration_ms: number
    message: string
}

interface PipelineWindowProps {
    dossierId: string | null
    onClose: () => void
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'running':
            return <Loader size={14} className="animate-spin" />
        case 'success':
            return <Check size={14} />
        case 'error':
            return <AlertCircle size={14} />
        default:
            return <Clock size={14} />
    }
}

export const PipelineWindow: React.FC<PipelineWindowProps> = ({ dossierId, onClose }) => {
    const [steps, setSteps] = useState<PipelineStep[]>([])
    const [loading, setLoading] = useState(true)

    // Poll for events when dossierId changes
    useEffect(() => {
        if (!dossierId) {
            setSteps([])
            setLoading(false)
            return
        }

        let active = true
        let pollInterval: NodeJS.Timeout

        const fetchEvents = async () => {
            try {
                const res = await fetch(`/api/dossiers/${dossierId}/events`)
                if (!res.ok) return

                const events = await res.json()

                if (active && events.length > 0) {
                    // Convert events to steps format
                    const pipelineSteps: PipelineStep[] = events.map((e: any) => ({
                        agent: e.agent,
                        status: e.status || 'success',
                        duration_ms: e.duration_ms || 0,
                        message: e.message_readable || e.step || ''
                    }))
                    setSteps(pipelineSteps)
                }
            } catch (err) {
                console.error('Failed to fetch pipeline events:', err)
            } finally {
                if (active) setLoading(false)
            }
        }

        // Fetch immediately
        fetchEvents()

        // Then poll every 2 seconds for live updates
        pollInterval = setInterval(fetchEvents, 2000)

        return () => {
            active = false
            clearInterval(pollInterval)
        }
    }, [dossierId])

    if (!dossierId) {
        return (
            <div className="pipeline-window">
                <div className="pipeline-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Pipeline Multi-Agents</span>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}>
                        <X size={16} />
                    </button>
                </div>
                <div className="pipeline-content" style={{ padding: 20, textAlign: 'center', color: '#718096' }}>
                    Aucun dossier actif
                </div>
            </div>
        )
    }

    return (
        <div className="pipeline-window">
            <div className="pipeline-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Pipeline Multi-Agents</span>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}>
                    <X size={16} />
                </button>
            </div>

            <div className="pipeline-content">
                {loading ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#718096' }}>
                        <Loader size={20} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                        Chargement...
                    </div>
                ) : steps.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#718096' }}>
                        Aucun événement pour le moment
                    </div>
                ) : (
                    steps.map((step, index) => (
                        <div key={index} className="pipeline-step">
                            <div className={`pipeline-step-icon ${step.status}`}>
                                {getStatusIcon(step.status)}
                            </div>
                            <div className="pipeline-step-info">
                                <div className="pipeline-step-name">{step.agent}</div>
                                <div className="pipeline-step-message">{step.message}</div>
                            </div>
                            {step.duration_ms > 0 && (
                                <div className="pipeline-step-duration">
                                    {step.duration_ms}ms
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
