import { useState } from 'react'
import { PortNetLayout } from './components/PortNet/Layout'
import { FloatingButton } from './components/PortAgent/FloatingButton'
import { ChatWidget } from './components/PortAgent/ChatWidget'
import { PipelineWindow } from './components/PortAgent/PipelineWindow'

function App() {
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [dossierId, setDossierId] = useState<string | null>(null)
    const [mode, setMode] = useState<'assiste' | 'manuel'>('assiste')
    const [showPipeline, setShowPipeline] = useState(false)
    const [suggestions, setSuggestions] = useState<Record<string, string>>({})

    const handleStartDossier = async () => {
        try {
            const res = await fetch('/api/dossiers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type_ti: 'EI' })
            })
            const data = await res.json()
            setDossierId(data.id)
            setShowPipeline(true)
            return data.id
        } catch (e) {
            console.error('Error creating dossier:', e)
            return null
        }
    }

    const handleRunAutopilot = async (intent: string, currentDossierId?: string) => {
        const id = currentDossierId || dossierId
        if (!id) return

        setShowPipeline(true)

        try {
            const res = await fetch('/api/autopilot/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dossier_id: id, intent_text: intent, mode })
            })
            const data = await res.json()

            if (data.suggestions) {
                setSuggestions(data.suggestions)
            }

            return data
        } catch (e) {
            console.error('Error running autopilot:', e)
            return null
        }
    }

    const handleApplySuggestion = (field: string, value: string) => {
        console.log('Apply suggestion:', field, value)
    }

    return (
        <div className="app">
            <PortNetLayout
                mode={mode}
                onModeChange={setMode}
                suggestions={suggestions}
                onApplySuggestion={handleApplySuggestion}
                dossierId={dossierId}
            />

            {!isChatOpen && (
                <FloatingButton onClick={() => setIsChatOpen(true)} />
            )}

            {isChatOpen && (
                <ChatWidget
                    onClose={() => setIsChatOpen(false)}
                    onStartDossier={handleStartDossier}
                    onRunAutopilot={handleRunAutopilot}
                    dossierId={dossierId}
                />
            )}

            {showPipeline && isChatOpen && (
                <PipelineWindow
                    dossierId={dossierId}
                    onClose={() => setShowPipeline(false)}
                />
            )}
        </div>
    )
}

export default App
