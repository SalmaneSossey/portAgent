import { useState } from 'react'
import { FileText, Folder, Search, CreditCard, BookOpen, Clock, Settings, LogOut, Package, FileCheck } from 'lucide-react'

interface LayoutProps {
    mode: 'assiste' | 'manuel'
    onModeChange: (mode: 'assiste' | 'manuel') => void
    suggestions: Record<string, string>
    onApplySuggestion: (field: string, value: string) => void
    dossierId: string | null
}

const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Folder },
    { id: 'nouveau', label: 'Nouveau Titre', icon: FileText },
    { id: 'gestion', label: 'Gestion des titres', icon: Search },
    { id: 'paiements', label: 'Paiements', icon: CreditCard },
    { id: 'connaissance', label: 'Base de Connaissance', icon: BookOpen },
    { id: 'journal', label: 'Journal', icon: Clock },
]

export const PortNetLayout: React.FC<LayoutProps> = ({
    mode,
    onModeChange,
    suggestions,
    onApplySuggestion,
    dossierId
}) => {
    const [activePage, setActivePage] = useState('nouveau')
    const [formData, setFormData] = useState({
        type_ti: 'EI',
        importateur: 'SARL IMPORT EXPORT',
        provenance: '',
        devise: 'USD',
        marchandise: '',
        hs_code: ''
    })

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const renderSuggestion = (field: string) => {
        if (!suggestions[field]) return null

        return (
            <div className="suggestion-chip">
                <span className="suggestion-chip-label">Proposition PortAgent:</span>
                <span className="suggestion-chip-value">{suggestions[field]}</span>
                <div className="suggestion-chip-actions">
                    <button
                        className="suggestion-chip-btn apply"
                        onClick={() => {
                            handleInputChange(field, suggestions[field])
                            onApplySuggestion(field, suggestions[field])
                        }}
                    >
                        Appliquer
                    </button>
                    <button className="suggestion-chip-btn modify">Modifier</button>
                </div>
            </div>
        )
    }

    // Render content based on active page
    const renderPageContent = () => {
        switch (activePage) {
            case 'dashboard':
                return (
                    <div className="form-section">
                        <h2 className="form-section-title">Tableau de bord</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                            <div style={{ background: '#ebf4ff', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1a4480' }}>3</div>
                                <div style={{ color: '#4a5568', marginTop: 8 }}>Titres en cours</div>
                            </div>
                            <div style={{ background: '#f0fff4', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#38a169' }}>12</div>
                                <div style={{ color: '#4a5568', marginTop: 8 }}>Titres validés</div>
                            </div>
                            <div style={{ background: '#fef3c7', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#d69e2e' }}>2</div>
                                <div style={{ color: '#4a5568', marginTop: 8 }}>En attente</div>
                            </div>
                        </div>
                        <div style={{ marginTop: 24 }}>
                            <h3 style={{ fontSize: 16, marginBottom: 16, color: '#2d3748' }}>Activité récente</h3>
                            <div style={{ background: '#f7fafc', padding: 16, borderRadius: 8, marginBottom: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Titre EI-2026-0042 créé</span>
                                    <span style={{ color: '#718096' }}>Il y a 2h</span>
                                </div>
                            </div>
                            <div style={{ background: '#f7fafc', padding: 16, borderRadius: 8, marginBottom: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Titre EI-2026-0041 validé</span>
                                    <span style={{ color: '#718096' }}>Il y a 5h</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case 'gestion':
                return (
                    <div className="form-section">
                        <h2 className="form-section-title">Gestion des titres</h2>
                        <div style={{ marginBottom: 16 }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Rechercher un titre par référence, importateur..."
                                style={{ width: '100%' }}
                            />
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f7fafc', textAlign: 'left' }}>
                                    <th style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>Référence</th>
                                    <th style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>Type</th>
                                    <th style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>Statut</th>
                                    <th style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>Date</th>
                                    <th style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>EI-2026-0042</td>
                                    <td style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>EI</td>
                                    <td style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>
                                        <span style={{ background: '#c6f6d5', color: '#276749', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>Validé</span>
                                    </td>
                                    <td style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>05/02/2026</td>
                                    <td style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>
                                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }}>Voir</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>EI-2026-0041</td>
                                    <td style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>EI</td>
                                    <td style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>
                                        <span style={{ background: '#bee3f8', color: '#2b6cb0', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>En cours</span>
                                    </td>
                                    <td style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>04/02/2026</td>
                                    <td style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>
                                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }}>Voir</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )

            case 'paiements':
                return (
                    <div className="form-section">
                        <h2 className="form-section-title">Paiements</h2>
                        <div style={{ textAlign: 'center', padding: 40, color: '#718096' }}>
                            <CreditCard size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
                            <p>Aucun paiement en attente</p>
                        </div>
                    </div>
                )

            case 'connaissance':
                return (
                    <div className="form-section">
                        <h2 className="form-section-title">Base de Connaissance</h2>
                        <div style={{ marginBottom: 16 }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Rechercher un code HS, une réglementation..."
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            <div style={{ background: '#f7fafc', padding: 20, borderRadius: 12, cursor: 'pointer' }}>
                                <Package size={24} style={{ color: '#1a4480', marginBottom: 8 }} />
                                <div style={{ fontWeight: 500 }}>Codes Douaniers (HS)</div>
                                <div style={{ fontSize: 13, color: '#718096' }}>Rechercher le code HS approprié</div>
                            </div>
                            <div style={{ background: '#f7fafc', padding: 20, borderRadius: 12, cursor: 'pointer' }}>
                                <FileCheck size={24} style={{ color: '#1a4480', marginBottom: 8 }} />
                                <div style={{ fontWeight: 500 }}>Réglementations</div>
                                <div style={{ fontSize: 13, color: '#718096' }}>Consulter les règles d'importation</div>
                            </div>
                        </div>
                    </div>
                )

            case 'journal':
                return (
                    <div className="form-section">
                        <h2 className="form-section-title">Journal d'activité</h2>
                        <div style={{ background: '#f7fafc', padding: 16, borderRadius: 8, marginBottom: 8 }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <Clock size={16} style={{ color: '#718096', marginTop: 2 }} />
                                <div>
                                    <div>Connexion réussie</div>
                                    <div style={{ fontSize: 12, color: '#718096' }}>05/02/2026 à 14:32</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ background: '#f7fafc', padding: 16, borderRadius: 8, marginBottom: 8 }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <Clock size={16} style={{ color: '#718096', marginTop: 2 }} />
                                <div>
                                    <div>Titre EI-2026-0042 créé</div>
                                    <div style={{ fontSize: 12, color: '#718096' }}>05/02/2026 à 14:35</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case 'nouveau':
            default:
                return (
                    <>
                        {/* Form Sections */}
                        <div className="form-section">
                            <h2 className="form-section-title">Nouveau Titre d'Importation</h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Type de Titre *</label>
                                    <select
                                        className="form-select"
                                        value={formData.type_ti}
                                        onChange={(e) => handleInputChange('type_ti', e.target.value)}
                                    >
                                        <option value="EI">EI - Engagement d'Importation</option>
                                        <option value="LI">LI - Licence d'Importation</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Importateur</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.importateur}
                                        onChange={(e) => handleInputChange('importateur', e.target.value)}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h2 className="form-section-title">Pays de Provenance</h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Pays *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Ex: Chine, France, Allemagne..."
                                        value={formData.provenance}
                                        onChange={(e) => handleInputChange('provenance', e.target.value)}
                                    />
                                    {renderSuggestion('provenance')}
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h2 className="form-section-title">Factures</h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Devise *</label>
                                    <select
                                        className="form-select"
                                        value={formData.devise}
                                        onChange={(e) => handleInputChange('devise', e.target.value)}
                                    >
                                        <option value="USD">USD - Dollar américain</option>
                                        <option value="EUR">EUR - Euro</option>
                                        <option value="GBP">GBP - Livre sterling</option>
                                        <option value="CNY">CNY - Yuan chinois</option>
                                    </select>
                                    {renderSuggestion('devise')}
                                </div>
                            </div>

                            <div style={{ marginTop: 16, padding: 24, border: '2px dashed #e2e8f0', borderRadius: 12, textAlign: 'center', color: '#718096' }}>
                                <FileText size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                                <p>Glissez une facture ici ou cliquez pour téléverser</p>
                                <p style={{ fontSize: 12, marginTop: 4 }}>PDF, JPG, PNG acceptés</p>
                            </div>
                        </div>

                        <div className="form-section">
                            <h2 className="form-section-title">Marchandises</h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Désignation *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Description de la marchandise..."
                                        value={formData.marchandise}
                                        onChange={(e) => handleInputChange('marchandise', e.target.value)}
                                    />
                                    {renderSuggestion('marchandise')}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Code HS</label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Ex: 6204.62"
                                            value={formData.hs_code}
                                            onChange={(e) => handleInputChange('hs_code', e.target.value)}
                                            style={{ flex: 1 }}
                                        />
                                        <button className="btn btn-secondary">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                    {renderSuggestion('hs_code')}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                            <button className="btn btn-secondary">Effacer</button>
                            <button className="btn btn-primary">Créer le Titre</button>
                            {dossierId && (
                                <button className="btn btn-success">Soumettre sur PortNet</button>
                            )}
                        </div>
                    </>
                )
        }
    }

    return (
        <div className="portnet-layout">
            {/* Header */}
            <header className="portnet-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        fontWeight: 'bold',
                        fontSize: 20,
                        letterSpacing: 1,
                        background: 'linear-gradient(90deg, #fff 60%, #f6ad55)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        PORTNET
                    </div>
                    <span style={{ opacity: 0.5, margin: '0 8px' }}>|</span>
                    <span style={{ fontSize: 12, opacity: 0.8 }}>Guichet Unique</span>
                </div>
                <span className="portnet-header-breadcrumb">
                    Importation → Titre et Documents → Nouveau Titre d'Importation
                </span>
                <div className="portnet-header-profile">
                    <span>SARL IMPORT EXPORT</span>
                    <span style={{ opacity: 0.7 }}>Code: 12345678</span>
                </div>
            </header>

            <div className="portnet-main">
                {/* Sidebar */}
                <aside className="portnet-sidebar">
                    <div className="sidebar-section">
                        <div className="sidebar-title">Menu Principal</div>
                        {menuItems.map(item => (
                            <div
                                key={item.id}
                                className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
                                onClick={() => setActivePage(item.id)}
                            >
                                <item.icon className="sidebar-item-icon" size={18} />
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="sidebar-section" style={{ marginTop: 'auto', paddingTop: 20 }}>
                        <div
                            className="sidebar-item"
                            onClick={() => { }}
                        >
                            <Settings className="sidebar-item-icon" size={18} />
                            <span>Paramètres</span>
                        </div>
                        <div className="sidebar-item">
                            <LogOut className="sidebar-item-icon" size={18} />
                            <span>Déconnexion</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="portnet-content">
                    {/* Mode Toggle */}
                    <div className="mode-toggle">
                        <span className="mode-toggle-label">Mode :</span>
                        <div className="mode-toggle-switch">
                            <div
                                className={`mode-toggle-option ${mode === 'manuel' ? 'active' : ''}`}
                                onClick={() => onModeChange('manuel')}
                            >
                                Manuel
                            </div>
                            <div
                                className={`mode-toggle-option ${mode === 'assiste' ? 'active' : ''}`}
                                onClick={() => onModeChange('assiste')}
                            >
                                Assisté
                            </div>
                        </div>
                    </div>

                    {/* Page Content */}
                    {renderPageContent()}
                </main>
            </div>
        </div>
    )
}
