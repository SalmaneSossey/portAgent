import { useState, useRef, useEffect } from 'react'
import { X, Send, Paperclip, Check, Edit } from 'lucide-react'

interface Message {
    id: string
    text: string
    sender: 'agent' | 'user'
    timestamp: Date
    type?: 'text' | 'extraction' | 'validation' | 'options'
    extractedData?: ExtractedData
    options?: ChatOption[]
}

interface ExtractedData {
    fournisseur?: string
    montant?: number
    devise?: string
    date_facture?: string
    reference?: string
}

interface ChatOption {
    id: string
    label: string
    value: string
}

interface ChatWidgetProps {
    onClose: () => void
    onStartDossier: () => Promise<string | null>
    onRunAutopilot: (intent: string, dossierId?: string) => Promise<any>
    dossierId: string | null
}

type ConversationState =
    | 'IDLE'
    | 'ASK_TYPE'
    | 'ASK_PROVENANCE'
    | 'ASK_PRODUCT'
    | 'AWAITING_UPLOAD'
    | 'EXTRACTING'
    | 'VERIFY_EXTRACTION'
    | 'VALIDATING'
    | 'READY_TO_SUBMIT'
    | 'SUBMITTED'

const WELCOME_MESSAGE = "Bonjour ! Je suis PortAgent, votre copilote d'exécution. Je peux vous aider à créer et gérer vos titres d'importation sur PortNet. Comment puis-je vous aider ?"

export const ChatWidget: React.FC<ChatWidgetProps> = ({
    onClose,
    onStartDossier,
    onRunAutopilot,
    dossierId
}) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: WELCOME_MESSAGE,
            sender: 'agent',
            timestamp: new Date(),
            type: 'options',
            options: [
                { id: 'new', label: '📝 Créer un nouveau titre', value: 'nouveau' },
                { id: 'help', label: '❓ Aide et documentation', value: 'help' },
                { id: 'status', label: '📊 Voir mes dossiers', value: 'status' }
            ]
        }
    ])
    const [input, setInput] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [conversationState, setConversationState] = useState<ConversationState>('IDLE')
    const [conversationHistory, setConversationHistory] = useState<{ role: string, content: string }[]>([])
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const addMessage = (
        text: string,
        sender: 'agent' | 'user',
        type: 'text' | 'extraction' | 'validation' | 'options' = 'text',
        extractedData?: ExtractedData,
        options?: ChatOption[]
    ) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text,
            sender,
            timestamp: new Date(),
            type,
            extractedData,
            options
        }])

        // Update conversation history for LLM context
        setConversationHistory(prev => [...prev, { role: sender === 'user' ? 'user' : 'assistant', content: text }])
    }

    // Call LLM chat endpoint
    const sendToLLM = async (message: string): Promise<void> => {
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    dossier_id: dossierId,
                    conversation_history: conversationHistory.slice(-10)
                })
            })

            const data = await res.json()

            if (data.message) {
                // Add agent response with options if provided
                if (data.options && data.options.length > 0) {
                    addMessage(data.message, 'agent', 'options', undefined, data.options)
                } else {
                    addMessage(data.message, 'agent')
                }

                // Handle actions
                if (data.action === 'create_dossier' && !dossierId) {
                    const newId = await onStartDossier()
                    if (newId) {
                        setConversationState('ASK_PROVENANCE')
                    }
                } else if (data.action === 'upload_document') {
                    setConversationState('AWAITING_UPLOAD')
                } else if (data.action === 'validate') {
                    setConversationState('VALIDATING')
                } else if (data.action === 'submit') {
                    setConversationState('READY_TO_SUBMIT')
                }
            }
        } catch (err) {
            console.error('Chat error:', err)
            addMessage("Désolé, une erreur est survenue. Réessayez.", 'agent')
        }
    }

    // Handle option click
    const handleOptionClick = async (option: ChatOption) => {
        // Show user's choice
        addMessage(option.label, 'user')
        setIsProcessing(true)

        try {
            // Send the option value to LLM for contextual response
            await sendToLLM(option.value)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleSend = async () => {
        if (!input.trim() || isProcessing) return

        const userMessage = input.trim()
        addMessage(userMessage, 'user')
        setInput('')
        setIsProcessing(true)

        try {
            // Handle special actions based on conversation state
            const msgLower = userMessage.toLowerCase()

            if (conversationState === 'VERIFY_EXTRACTION') {
                if (msgLower.includes('confirm') || msgLower.includes('oui') || msgLower.includes('correct')) {
                    addMessage("✓ Données confirmées. Je lance la validation du dossier...", 'agent')
                    setConversationState('VALIDATING')
                    await runValidation()
                    return
                }
            }

            if (conversationState === 'READY_TO_SUBMIT') {
                if (msgLower.includes('soumettre') || msgLower.includes('submit') || msgLower.includes('envoyer')) {
                    await submitDossier()
                    return
                }
            }

            // Otherwise, send to LLM
            await sendToLLM(userMessage)

        } finally {
            setIsProcessing(false)
        }
    }

    const runValidation = async () => {
        if (!dossierId) return

        try {
            const res = await fetch('/api/judge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dossier_id: dossierId })
            })
            const data = await res.json()

            if (data.is_valid) {
                setConversationState('READY_TO_SUBMIT')
                addMessage(
                    "✅ **Validation réussie !**\n\nVotre dossier est complet et prêt pour la soumission.",
                    'agent',
                    'options',
                    undefined,
                    [
                        { id: 'submit', label: '📤 Soumettre à PortNet', value: 'soumettre' },
                        { id: 'edit', label: '✏️ Modifier le dossier', value: 'modifier' }
                    ]
                )
            } else {
                const errorsText = data.errors?.map((e: string) => `• ${e}`).join('\n') || 'Éléments manquants'
                addMessage(`⚠️ **Validation incomplète:**\n\n${errorsText}`, 'agent')
            }
        } catch (err) {
            addMessage("Erreur lors de la validation.", 'agent')
        }
    }

    const submitDossier = async () => {
        if (!dossierId) return

        addMessage("📤 Soumission en cours vers PortNet...", 'agent')

        try {
            const res = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dossier_id: dossierId })
            })
            const data = await res.json()

            if (data.status === 'success') {
                setConversationState('SUBMITTED')
                addMessage(
                    `🎉 **Dossier soumis avec succès !**\n\n📋 Référence PortNet: **${data.portnet_reference}**\n\nVotre titre d'importation a été transmis à PortNet pour traitement.`,
                    'agent',
                    'validation'
                )
            } else {
                addMessage(`❌ Erreur: ${data.message || 'Échec de la soumission'}`, 'agent')
            }
        } catch (err) {
            addMessage("Erreur lors de la soumission.", 'agent')
        }
    }

    const handleFileUpload = async (file: File) => {
        if (!dossierId) {
            const newId = await onStartDossier()
            if (!newId) {
                addMessage("Erreur lors de la création du dossier.", 'agent')
                return
            }
        }

        addMessage(`📎 Téléversement de ${file.name}...`, 'agent')
        setConversationState('EXTRACTING')

        const formData = new FormData()
        formData.append('file', file)
        formData.append('dossier_id', dossierId || '')
        formData.append('category', 'facture')

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()

            if (data.file_id) {
                addMessage("✓ Document téléversé avec succès !", 'agent')
                await triggerExtraction(data.file_id)
            } else {
                addMessage("Erreur lors du téléversement.", 'agent')
                setConversationState('AWAITING_UPLOAD')
            }
        } catch (err) {
            addMessage("Erreur lors du téléversement du fichier.", 'agent')
            setConversationState('AWAITING_UPLOAD')
        }
    }

    const triggerExtraction = async (factureId: string) => {
        addMessage("🔍 Extraction des données en cours...", 'agent')

        try {
            const res = await fetch('/api/extract-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ facture_id: factureId })
            })
            const data = await res.json()

            if (data.status === 'success') {
                setConversationState('VERIFY_EXTRACTION')

                const extractionMsg = `📋 **Données extraites de la facture:**\n\n` +
                    `• **Fournisseur:** ${data.fournisseur || 'Non détecté'}\n` +
                    `• **Montant:** ${data.montant?.toLocaleString() || 'Non détecté'} ${data.devise || ''}\n` +
                    `• **Date:** ${data.date_facture || 'Non détectée'}\n` +
                    `• **Référence:** ${data.reference || 'Non détectée'}\n\n` +
                    `Ces informations sont-elles correctes?`

                addMessage(extractionMsg, 'agent', 'options', data as ExtractedData, [
                    { id: 'confirm', label: '✓ Confirmer', value: 'confirmer' },
                    { id: 'modify', label: '✏️ Modifier', value: 'modifier' }
                ])
            } else {
                addMessage("L'extraction n'a pas pu être complétée. Veuillez saisir les informations manuellement.", 'agent')
                setConversationState('AWAITING_UPLOAD')
            }
        } catch (err) {
            addMessage("Erreur lors de l'extraction. Réessayez.", 'agent')
            setConversationState('AWAITING_UPLOAD')
        }
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileUpload(file)
        }
    }

    return (
        <div className="chat-widget">
            <div className="chat-header">
                <div className="chat-header-left">
                    <img
                        src="/assets/portagent-logo.png"
                        alt="PortAgent"
                        className="chat-header-logo"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                        }}
                    />
                    <div>
                        <div className="chat-header-title">PortAgent</div>
                        <div className="chat-header-subtitle">Copilote d'exécution</div>
                    </div>
                </div>
                <button className="chat-header-close" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            <div className="chat-messages">
                {messages.map((msg) => (
                    <div key={msg.id}>
                        <div
                            className={`chat-message ${msg.sender} ${msg.type === 'extraction' ? 'extraction-msg' : ''}`}
                            style={{ whiteSpace: 'pre-wrap' }}
                        >
                            {msg.text}
                        </div>

                        {/* Render clickable options */}
                        {msg.sender === 'agent' && msg.options && msg.options.length > 0 && (
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 8,
                                marginTop: 8,
                                marginBottom: 12
                            }}>
                                {msg.options.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleOptionClick(opt)}
                                        disabled={isProcessing}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: 20,
                                            border: '1px solid #e2e8f0',
                                            background: 'white',
                                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                                            fontSize: 13,
                                            transition: 'all 0.2s',
                                            opacity: isProcessing ? 0.6 : 1
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isProcessing) {
                                                e.currentTarget.style.background = '#ebf4ff'
                                                e.currentTarget.style.borderColor = '#1a4480'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'white'
                                            e.currentTarget.style.borderColor = '#e2e8f0'
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {isProcessing && (
                    <div className="chat-message agent" style={{ opacity: 0.7 }}>
                        <span style={{ display: 'inline-block', animation: 'pulse 1s infinite' }}>●</span>
                        <span style={{ display: 'inline-block', animation: 'pulse 1s infinite', animationDelay: '0.2s' }}>●</span>
                        <span style={{ display: 'inline-block', animation: 'pulse 1s infinite', animationDelay: '0.4s' }}>●</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileInputChange}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 8,
                        opacity: 0.6
                    }}
                    title="Joindre un fichier"
                >
                    <Paperclip size={20} />
                </button>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Tapez votre message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isProcessing}
                />
                <button
                    className="chat-send-btn"
                    onClick={handleSend}
                    disabled={isProcessing || !input.trim()}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    )
}
