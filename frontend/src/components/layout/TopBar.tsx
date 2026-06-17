import React from 'react';
import { useUIStore } from '../../lib/api';
import NotificationsPopover from '../ui/NotificationsPopover';

interface TopBarProps {
    onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
    const searchQuery = useUIStore(state => state.searchQuery);
    const setSearchQuery = useUIStore(state => state.setSearchQuery);

    return (
        <header className="bg-surface fixed top-0 right-0 w-full md:w-[calc(100%-280px)] h-16 border-b border-outline-variant flex justify-between items-center px-margin-desktop z-10">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 text-primary hover:bg-surface-container-low rounded-full transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <div className="relative hidden sm:block">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                    <input 
                        className="pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-white focus:outline-none focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/20 w-64 transition-all" 
                        placeholder="Buscar chamados..." 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <h2 className="md:hidden font-headline-md text-headline-md text-primary">Chama</h2>
            </div>
            <div className="flex items-center gap-4">
                <NotificationsPopover />
                <img alt="User Profile" className="w-8 h-8 rounded-full border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdm0btvRDR96k4WajTz8H5sLAI7rQdL5xxxgyLc1BN-64AQHJgPAh-IRbNKEJFs2Mwp2aXn8mbOpASMifoc-vfTEt8aCqozcTNMIumtP-Td88EGzNOpgRUdhOEGoEowrucBihnaZjfUjAvKANETMg8UCxsnZsQLG5UCA6xI_nkrNsejqnpW94JLpQIR2hDLF24ibSKGPmYUKSY2WEVDveu1iGwYWyZER4GnIyI8WcRipSDqa_rh5lERFq3Xz94OBEbNO8Vnoz7wUJo"/>
            </div>
        </header>
    );
};

export default TopBar;
