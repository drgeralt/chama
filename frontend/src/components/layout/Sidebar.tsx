import React from 'react';
import { useLocation } from 'react-router-dom';
import { useIonRouter } from '@ionic/react';
import { useUIStore } from '../../lib/api';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const router = useIonRouter();
    const currentRole = useUIStore(state => state.currentRole);

    const isActive = (path: string) => location.pathname.startsWith(path);

    const getLinkClass = (path: string) => {
        if (isActive(path)) {
            return "flex items-center gap-3 px-4 py-3 bg-white/10 border-l-4 border-primary text-on-primary font-bold rounded-r-lg cursor-pointer";
        }
        return "flex items-center gap-3 px-4 py-3 text-surface-variant/70 hover:text-on-primary hover:bg-white/5 transition-colors rounded-lg cursor-pointer";
    };

    const sidebarClasses = `
        fixed left-0 top-0 h-full w-[280px] bg-[#0F172A] shadow-lg border-r border-outline-variant flex flex-col py-gutter z-30 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
    `;

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
                    onClick={onClose}
                />
            )}
            <nav className={sidebarClasses}>
                <div className="px-gutter mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="font-headline-lg text-headline-lg text-on-primary">Chama</h1>
                        <p className="font-metadata text-metadata text-surface-variant/70">Gestão de Chamados</p>
                    </div>
                    <button className="md:hidden text-white/70 hover:text-white p-2" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            <ul className="flex-1 flex flex-col gap-2 px-4">
                <li>
                    <a onClick={(e) => { e.preventDefault(); router.push('/dashboard/general'); }} className={getLinkClass('/dashboard/general')}>
                        <span className="material-symbols-outlined icon-fill">dashboard</span>
                        <span>Painel Geral</span>
                    </a>
                </li>
                {currentRole !== 'User' && (
                    <>
                        <li>
                            <a onClick={(e) => { e.preventDefault(); router.push('/dashboard/tickets'); }} className={getLinkClass('/dashboard/tickets')}>
                                <span className="material-symbols-outlined icon-fill">list_alt</span>
                                <span>Fila</span>
                            </a>
                        </li>
                        <li>
                            <a onClick={(e) => { e.preventDefault(); router.push('/dashboard/my-day'); }} className={getLinkClass('/dashboard/my-day')}>
                                <span className="material-symbols-outlined icon-fill">today</span>
                                <span>Meu Dia</span>
                            </a>
                        </li>
                        <li>
                            <a onClick={(e) => { e.preventDefault(); router.push('/dashboard/settings'); }} className={getLinkClass('/dashboard/settings')}>
                                <span className="material-symbols-outlined icon-fill">settings</span>
                                <span>Configurações</span>
                            </a>
                        </li>
                    </>
                )}
            </ul>
            <div className="px-4 mt-auto">
                <button 
                    onClick={() => { onClose(); router.push('/new-ticket'); }}
                    className="hidden md:flex w-full bg-[#FF4500] hover:bg-[#FF8C00] text-white font-body-md text-body-md py-3 rounded-lg transition-colors items-center justify-center gap-2 shadow-sm">
                    <span className="material-symbols-outlined">add</span>
                    Novo Chamado
                </button>
            </div>
        </nav>
        </>
    );
};

export default Sidebar;
