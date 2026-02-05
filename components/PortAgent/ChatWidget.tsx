
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortAgentLogo } from './Logo';
import { DropzoneWindow } from './Windows/DropzoneWindow';
import { PipelineWindow } from './Windows/PipelineWindow';
import { TijariaWindow } from './Windows/TijariaWindow';
import { JuryConsole } from './Windows/JuryConsole';
import { AssistantState, INITIAL_STATE, Message } from './AssistantState';

const QUICK_REPLIES = {
    'DEMANDE_NOM': [],
    'DEMANDE_DEVISE': ['EUR', 'USD', 'MAD'],
    'DEMANDE_FACTURE': [],
    'DEMANDE_PAYS': ['Maroc', 'Chine', 'France', 'Espagne'],
    'DEMANDE_MARCHANDISE': ['Tissus', 'Pièces Auto', 'Fruits', 'Machinerie'],
    'DEMANDE_BUREAU': ['Casa Port', 'Tanger Med', 'Jorf Lasfar'],
    'DEMANDE_INCOTERM': ['FOB', 'CIF', 'EXW'],
};

interface ChatWidgetProps {
    isOpen: boolean;
    modeJury: boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, modeJury }) => {
    const [state, setState] = useState<AssistantState>(INITIAL_STATE);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [state.messages]);

    const addMessage = (text: string, role: 'agent' | 'user' = 'agent', attachments: File[] = []) => {
        setState(prev => ({
            ...prev,
            messages: [...prev.messages, {
                id: Math.random().toString(36),
                role,
                content: text,
                attachments,
                timestamp: new Date()
            }]
        }));
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const txt = input;
        setInput("");
        addMessage(txt, 'user');

        // Process User Input through State Machine
        await processInput(txt);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length) return;
        const file = event.target.files[0];
        addMessage(`Pièce jointe: ${file.name}`, 'user', [file]);

        if (state.step === 'DEMANDE_FACTURE') {
            await processInvoiceUpload(file);
        } else {
            // Just generic upload logic if needed
        }
    };

    // --- CORE LOGIC ENGINE ---

    const processInput = async (msg: string) => {
        // If we represent a specific step, use the strict state machine
        if (state.step !== 'IDLE' && state.step !== 'READY_TO_SUBMIT') {
            processStateMachine(msg);
            return;
        }

        // Otherwise, use the LLM Brain
        try {
            const res = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            });

            if (!res.ok) {
                // If endpoint doesn't exist (404) or error, throw to trigger fallback
                throw new Error(`Server error: ${res.status}`);
            }

            const data = await res.json();

            // Display Agent Response
            if (data.response) {
                addMessage(data.response);
            }

            // Act on Intent
            if (data.intent === 'START_IMPORT') {
                setState(prev => ({ ...prev, step: 'DEMANDE_NOM' }));
                setTimeout(() => addMessage("Pour commencer, quel est le nom du fournisseur / expéditeur ?"), 800);
            } else if (data.intent === 'QUESTION') {
                // Trigger Tijaria lookup for deeper details if needed, or just rely on Gemini's answer
                // For visual flair, let's open the window briefly
                setState(prev => ({ ...prev, isTijaraOpen: true }));
            }

        } catch (e) {
            // Fallback if backend offline
            console.error(e);
            if (msg.toLowerCase().includes("démarrer")) {
                addMessage("Mode secours activé. Démarrage de la procédure.");
                setState(prev => ({ ...prev, step: 'DEMANDE_NOM' }));
            } else {
                addMessage("Je n'arrive pas à joindre mon cerveau. Dites 'Démarrer' pour forcer.");
            }
        }
    };

    const processStateMachine = (msg: string) => {
        const txt = msg.toLowerCase();
        // State Machine Transition
        switch (state.step) {
            case 'IDLE':
                addMessage("Dites 'Démarrer' pour lancer une nouvelle procédure d'importation.");
                break;
            case 'DEMANDE_NOM':
                setState(prev => ({ ...prev, collectedData: { ...prev.collectedData, supplier: msg }, step: 'DEMANDE_DEVISE' }));
                setTimeout(() => addMessage("Merci. Quelle est la devise de la transaction ?"), 400);
                break;
            case 'DEMANDE_DEVISE':
                setState(prev => ({ ...prev, collectedData: { ...prev.collectedData, currency: msg.toUpperCase() }, step: 'DEMANDE_FACTURE' }));
                setTimeout(() => addMessage("Veuillez maintenant joindre la facture commerciale (PDF/Image)."), 400);
                break;
            case 'DEMANDE_FACTURE':
                // Check if user entered text instead of uploading
                if (msg.length > 0) {
                    // Assume they are skipping or entering manual data?
                    // Let's ask them to confirm if they want to skip.
                    // Or just assume they entered the Total Amount manually if it looks like a number.
                    if (!isNaN(parseFloat(msg))) {
                        setState(prev => ({
                            ...prev,
                            collectedData: { ...prev.collectedData, total_amount: parseFloat(msg) },
                            step: 'DEMANDE_PAYS'
                        }));
                        addMessage(`Montant noté : ${msg}. Quel est le pays de provenance ?`);
                    } else {
                        addMessage("Je n'ai pas compris. Veuillez charger un PDF ou entrer le montant total manuellement.");
                    }
                }
                break;
            case 'DEMANDE_PAYS':
                setState(prev => ({ ...prev, collectedData: { ...prev.collectedData, provenance_country: msg }, step: 'DEMANDE_MARCHANDISE' }));
                setTimeout(() => addMessage("Quelle est la nature principale de la marchandise ?"), 400);
                break;
            case 'DEMANDE_MARCHANDISE':
                setState(prev => ({ ...prev, collectedData: { ...prev.collectedData, main_good: msg }, step: 'DEMANDE_BUREAU' }));
                setTimeout(() => addMessage("Quel est le bureau de dédouanement envisagé ?"), 400);
                break;
            case 'DEMANDE_BUREAU':
                setState(prev => ({ ...prev, collectedData: { ...prev.collectedData, customs_office: msg }, step: 'DEMANDE_INCOTERM' }));
                setTimeout(() => addMessage("Et enfin, l'Incoterm ?"), 400);
                break;
            case 'DEMANDE_INCOTERM':
                setState(prev => ({ ...prev, collectedData: { ...prev.collectedData, incoterm: msg.toUpperCase() }, step: 'AUTOPILOT_RUNNING', isPipelinOpen: true }));
                addMessage("Parfait. Je lance l'analyse complète et la vérification réglementaire...");
                runAutopilot();
                break;
            case 'READY_TO_SUBMIT':
                if (txt.includes("oui") || txt.includes("soumettre")) {
                    submitDossier();
                } else {
                    addMessage("Dossier en attente. Dites 'Soumettre' pour valider.");
                }
                break;
        }
    };

    const processInvoiceUpload = async (file: File) => {
        setState(prev => ({ ...prev, isDropzoneOpen: true, step: 'EXTRACTION_EN_COURS' }));

        // 1. Upload
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:8000/analyze', { method: 'POST', body: formData });
            if (!res.ok) throw new Error("Erreur backend");
            const data = await res.json();

            setState(prev => ({
                ...prev,
                collectedData: { ...prev.collectedData, ...data.data },
                isDropzoneOpen: false,
                step: 'DEMANDE_PAYS' // Move to next missing field
            }));

            addMessage(`Facture analysée avec succès. Montant identifié: ${data.data.total_amount} ${data.data.currency || ''}.`);
            setTimeout(() => addMessage("Quel est le pays de provenance ?"), 800);

        } catch (e) {
            addMessage("Erreur lors de l'analyse de la facture. Réessayez ou saisissez manuellement.");
            setState(prev => ({ ...prev, isDropzoneOpen: false, step: 'DEMANDE_FACTURE' }));
        }
    };

    const runAutopilot = async () => {
        // Step through the pipeline
        for (let i = 0; i <= 4; i++) {
            setState(prev => ({ ...prev, pipelineStep: i }));
            await new Promise(r => setTimeout(r, 1500)); // Visual delay
        }

        // Finalize
        setState(prev => ({
            ...prev,
            isPipelinOpen: false, // Keep open or close? Maybe close and show card
            step: 'READY_TO_SUBMIT'
        }));

        addMessage("Vérifications terminées. Le dossier est complet et conforme. Voulez-vous le soumettre au guichet unique ?");
    };

    const submitDossier = async () => {
        setState(prev => ({ ...prev, step: 'SUBMITTED' }));
        try {
            await fetch('http://localhost:8000/submit', {
                method: 'POST',
                body: JSON.stringify(state.collectedData),
                headers: { 'Content-Type': 'application/json' }
            });
            addMessage("Dossier soumis avec succès ! Référence: PN-2026-X892. Une copie PDF a été générée.");
        } catch {
            addMessage("Erreur de soumission simulée.");
        }
    };

    // --- RENDER ---

    if (!isOpen) return null;

    const currentQuickReplies = QUICK_REPLIES[state.step as keyof typeof QUICK_REPLIES] || [];

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="fixed bottom-32 right-8 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 font-sans border border-slate-100"
            >
                {/* Header */}
                <div className="bg-[#0a1d37] p-4 flex items-center justify-between text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-1.5 rounded-lg">
                            <PortAgentLogo size={24} className="text-white" />
                        </div>
                        <div>
                            <div className="font-bold text-sm">PortAgent Assistant</div>
                            <div className="text-[10px] text-blue-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                En ligne
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="text-white/70 hover:text-white"><i className="fa-solid fa-expand"></i></button>
                        <button className="text-white/70 hover:text-white"><i className="fa-solid fa-ellipsis-vertical"></i></button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
                    {state.messages.map((m) => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {m.role === 'agent' && (
                                <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center mr-2 shadow-sm shrink-0">
                                    <PortAgentLogo size={16} />
                                </div>
                            )}
                            <div className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${m.role === 'user'
                                ? 'bg-[#0a1d37] text-white rounded-tr-none'
                                : 'bg-white text-slate-700 border border-gray-100 rounded-tl-none'
                                }`}>
                                {m.content}
                                {m.attachments && m.attachments.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {m.attachments.map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-black/10 rounded-lg px-2 py-1 text-xs">
                                                <i className="fa-solid fa-paperclip"></i>
                                                <span className="truncate max-w-[100px]">{f.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Final Success Card if Submitted */}
                    {state.step === 'SUBMITTED' && (
                        <div className="mx-8 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                <i className="fa-solid fa-check text-xl"></i>
                            </div>
                            <div className="font-bold text-green-800 text-sm mb-1">Dossier Soumis</div>
                            <div className="text-xs text-green-600 mb-3">Votre demande a été enregistrée sous la référence PN-2026-X892</div>
                            <button className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-green-700 transition">
                                <i className="fa-solid fa-download mr-1"></i> Télécharger Reçu
                            </button>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                {currentQuickReplies.length > 0 && (
                    <div className="px-4 py-2 flex gap-2 overflow-x-auto bg-slate-50 border-t border-slate-100">
                        {currentQuickReplies.map(reply => (
                            <button
                                key={reply}
                                onClick={() => { setInput(reply); handleSend(); }} // Actually triggers send directly is better but needs re-render. 
                                // Better:
                                // onClick={() => { processInput(reply); addMessage(reply, 'user'); }}
                                // But to leverage handleSend logic locally:
                                className="whitespace-nowrap px-3 py-1.5 bg-white border border-blue-200 text-[#0a1d37] text-xs font-medium rounded-full hover:bg-blue-50 transition shadow-sm"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-slate-200">
                    <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 border border-slate-200 focus-within:border-[#0a1d37] focus-within:ring-1 focus-within:ring-[#0a1d37]/20 transition-all">
                        <label className="cursor-pointer text-gray-400 hover:text-[#0a1d37] transition">
                            <i className="fa-solid fa-paperclip"></i>
                            <input type="file" className="hidden" onChange={handleFileUpload} />
                        </label>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Écrivez un message..."
                            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${input.trim() ? 'bg-[#0a1d37] text-white shadow-md' : 'bg-gray-200 text-gray-400'}`}
                        >
                            <i className="fa-solid fa-paper-plane text-xs"></i>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Render Context Windows (outside the chat box) */}
            <DropzoneWindow isOpen={state.isDropzoneOpen} progress={65} status="Extraction Intelligente..." />
            <PipelineWindow isOpen={state.isPipelinOpen} currentStep={state.pipelineStep} />
            <TijariaWindow isOpen={state.isTijaraOpen} query={state.messages[state.messages.length - 1]?.content || ""} />
            <JuryConsole isOpen={modeJury} logs={[]} payload={state.collectedData} />
        </>
    );
};
