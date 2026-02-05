
export interface Message {
    id: string;
    role: 'agent' | 'user';
    content: string;
    attachments?: File[];
    timestamp: Date;
}

export interface ExtractedData {
    supplier?: string;
    total_amount?: number;
    currency?: string;
    date?: string;
    num_facture?: string;
    items?: any[];
    incoterm?: string;
    provenance_country?: string;
    main_good?: string;
    customs_office?: string;
    [key: string]: any;
}

export interface AssistantState {
    step: 'IDLE' | 'DEMANDE_NOM' | 'DEMANDE_DEVISE' | 'DEMANDE_FACTURE' | 'EXTRACTION_EN_COURS' | 'VALIDATION_FACTURE' | 'DEMANDE_PAYS' | 'DEMANDE_MARCHANDISE' | 'DEMANDE_BUREAU' | 'DEMANDE_INCOTERM' | 'AUTOPILOT_RUNNING' | 'READY_TO_SUBMIT' | 'SUBMITTED';
    collectedData: ExtractedData;
    files: File[];
    isPipelinOpen: boolean;
    isDropzoneOpen: boolean;
    isTijaraOpen: boolean;
    pipelineStep: number;
    messages: Message[];
}

export const INITIAL_STATE: AssistantState = {
    step: 'IDLE',
    collectedData: {},
    files: [],
    isPipelinOpen: false,
    isDropzoneOpen: false,
    isTijaraOpen: false,
    pipelineStep: 0,
    messages: [
        {
            id: 'welcome',
            role: 'agent',
            content: "Bonjour. Je suis PortAgent, votre assistant d'importation intelligent. Je peux piloter vos formalités directement sur PortNet.",
            timestamp: new Date()
        }
    ]
};
