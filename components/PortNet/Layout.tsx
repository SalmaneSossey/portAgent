import React, { useState } from 'react';

const Header = () => (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 shadow-sm z-0">
        <div className="flex items-center gap-4">
            {/* PortNet Replica Logo */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#1a4480] flex items-center justify-center text-white font-serif font-bold text-xl">P</div>
                <div className="flex flex-col">
                    <span className="text-[#1a4480] font-bold text-lg leading-none tracking-tight">PORTNET</span>
                    <span className="text-[0.5rem] tracking-wider text-gray-500 uppercase">Guichet Unique National</span>
                </div>
            </div>
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            <span className="text-gray-500 text-sm">Tableau de bord</span>
        </div>

        <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-gray-700">SARL IMPORT EXPORT</div>
                <div className="text-[10px] text-gray-400">Code: 12345678</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <i className="fa-solid fa-user"></i>
            </div>
        </div>
    </header>
);

const Sidebar = ({ activePage, onNavigate }: { activePage: string, onNavigate: (page: string) => void }) => (
    <aside className="w-64 bg-[#1a4480] text-blue-100 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-4 py-6">
            <div className="text-xs uppercase opacity-50 tracking-widest font-bold mb-4">Menu Principal</div>
            <nav className="space-y-1">
                <NavItem icon="fa-gauge" label="Tableau de bord" id="dashboard" active={activePage === 'dashboard'} onClick={() => onNavigate('dashboard')} />
                <NavItem icon="fa-file-circle-plus" label="Nouvelle Demande" id="new_request" active={activePage === 'new_request'} onClick={() => onNavigate('new_request')} />
                <NavItem icon="fa-folder-open" label="Mes Dossiers" id="files" active={activePage === 'files'} onClick={() => onNavigate('files')} />
                <NavItem icon="fa-receipt" label="Paiements" id="payments" active={activePage === 'payments'} onClick={() => onNavigate('payments')} />
                <NavItem icon="fa-book" label="Base de Connaissance" id="kb" active={activePage === 'kb'} onClick={() => onNavigate('kb')} />
            </nav>
        </div>
        <div className="mt-auto p-4 border-t border-blue-900/50">
            <NavItem icon="fa-gear" label="Paramètres" id="settings" active={activePage === 'settings'} onClick={() => onNavigate('settings')} />
            <NavItem icon="fa-right-from-bracket" label="Déconnexion" id="logout" />
        </div>
    </aside>
);

const NavItem = ({ icon, label, id, active, onClick }: { icon: string, label: string, id?: string, active?: boolean, onClick?: () => void }) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${active ? 'bg-blue-700 text-white shadow-sm' : 'hover:bg-blue-800/50 hover:text-white'}`}
    >
        <i className={`fa-solid ${icon} w-5 text-center`}></i>
        <span className="text-sm font-medium">{label}</span>
    </div>
);

const DashboardPlaceholder = () => (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real Dashboard Look */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-2">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#1a4480]">Statistiques des Importations</h3>
                <button className="h-8 px-4 bg-blue-50 rounded text-blue-800 text-xs font-bold hover:bg-blue-100 transition">EXPORTER CSV</button>
            </div>
            <div className="h-64 bg-gradient-to-b from-blue-50/50 to-white rounded border border-dashed border-blue-100 flex items-center justify-center text-blue-300 flex-col gap-2">
                <i className="fa-solid fa-chart-area text-4xl opacity-50"></i>
                <span className="text-sm font-medium">Volume des transactions (2025-2026)</span>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 tracking-wide">Dernières Activités</h3>
            <div className="space-y-4">
                {[
                    { label: "Titre d'importation validé", date: "Il y a 2h", icon: "fa-check", color: "bg-green-100 text-green-600" },
                    { label: "Paiement frais portuaires", date: "Hier", icon: "fa-dollar-sign", color: "bg-blue-100 text-blue-600" },
                    { label: "Correction requise (Douane)", date: "02 Fév", icon: "fa-triangle-exclamation", color: "bg-orange-100 text-orange-600" }
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                            <i className={`fa-solid ${item.icon} text-xs`}></i>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-700">{item.label}</div>
                            <div className="text-[10px] text-gray-400">{item.date}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-3">
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 tracking-wide">Raccourcis Rapides</h3>
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: "Recherche Tarifaire", icon: "fa-magnifying-glass" },
                    { label: "Simulateur Droits", icon: "fa-calculator" },
                    { label: "Annuaire Opérateurs", icon: "fa-address-book" },
                    { label: "Réclamations", icon: "fa-headset" }
                ].map((item, i) => (
                    <div key={i} className="h-24 bg-gray-50 rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-md transition cursor-pointer flex flex-col items-center justify-center gap-2 group">
                        <i className={`fa-solid ${item.icon} text-xl text-gray-400 group-hover:text-[#1a4480]`}></i>
                        <span className="text-xs font-bold text-gray-500 group-hover:text-[#1a4480]">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const GenericPlaceholder = ({ title }: { title: string }) => (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl border border-gray-200 shadow-lg">
        <h2 className="text-2xl font-bold text-[#1a4480] mb-8 border-b border-gray-100 pb-4 flex items-center gap-3">
            <i className="fa-solid fa-file-lines text-blue-600"></i>
            {title}
        </h2>

        {/* Fake Form */}
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Référence Dossier</label>
                    <input disabled type="text" value="PN-2026-TEMP-001" className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Date de création</label>
                    <input disabled type="text" value={new Date().toLocaleDateString()} className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Titulaire / Importateur</label>
                <div className="w-full bg-blue-50 border border-blue-200 rounded px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                        <i className="fa-solid fa-building"></i>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-blue-900">SARL IMPORT EXPORT</div>
                        <div className="text-xs text-blue-600">ICE: 123456789</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Bureau Douanier</label>
                    <select className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-500">
                        <option>Casablanca Port</option>
                        <option>Tanger Med</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Régime Douanier</label>
                    <select className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-500">
                        <option>Mise à la consommation</option>
                        <option>Admission Temporaire</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Devise</label>
                    <select className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-500">
                        <option>EUR - Euro</option>
                        <option>USD - Dollar US</option>
                    </select>
                </div>
            </div>

            <div className="mt-8 border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                <i className="fa-solid fa-cloud-arrow-up text-3xl mb-2 text-gray-300"></i>
                <span className="text-sm font-medium">Zone de pièces jointes</span>
                <span className="text-xs">Les documents extraits apparaîtront ici</span>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-8">
                <button className="px-6 py-2 border border-gray-300 rounded text-sm font-bold text-gray-600 hover:bg-gray-50">Annuler</button>
                <button className="px-6 py-2 bg-[#1a4480] rounded text-sm font-bold text-white shadow-lg hover:bg-blue-900 flex items-center gap-2">
                    <i className="fa-solid fa-save"></i>
                    Enregistrer Brouillon
                </button>
            </div>
        </div>
    </div>
);

export const PortNetLayout = ({ children }: { children?: React.ReactNode }) => {
    const [activePage, setActivePage] = useState('dashboard');

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard': return <DashboardPlaceholder />;
            case 'new_request': return <GenericPlaceholder title="Création d'un nouveau titre d'importation" />;
            case 'files': return <GenericPlaceholder title="Mes Dossiers en cours" />;
            case 'payments': return <GenericPlaceholder title="Historique des Paiements" />;
            case 'kb': return <GenericPlaceholder title="Base de Connaissance Tarifaire" />;
            default: return <DashboardPlaceholder />;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 text-slate-800 font-sans">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar activePage={activePage} onNavigate={setActivePage} />
                <main className="flex-1 overflow-auto relative p-6">
                    {children || renderContent()}
                </main>
            </div>
        </div>
    );
};
