import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, useIonRouter } from '@ionic/react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useUIStore, authStorage } from '../../lib/api';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const router = useIonRouter();
    const currentOrganizationId = useUIStore(state => state.currentOrganizationId);
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const verifyAuth = async () => {
            const token = await authStorage.getAccessToken();
            if (!token) {
                router.push('/login', 'root', 'replace');
            } else if (!currentOrganizationId) {
                router.push('/organizations', 'root', 'replace');
            } else {
                setIsAuthenticated(true);
            }
            setIsChecking(false);
        };
        verifyAuth();
    }, [currentOrganizationId, router]);

    if (isChecking || !isAuthenticated || !currentOrganizationId) {
        return null; // Don't render until redirected or verified
    }

    return (
        <IonPage>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
            <IonContent className="bg-[#F8FAFC]">
                <div className="flex-1 ml-0 md:ml-[280px] flex flex-col min-h-screen bg-background">
                    <main className="flex-1 mt-16 p-margin-mobile md:p-margin-desktop max-w-container-max mx-auto w-full pb-24">
                        {children}
                    </main>
                    
                    {/* FAB on mobile for quick ticket creation */}
                    <button
                        onClick={() => router.push('/new-ticket')}
                        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#FF4500] text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform z-10"
                    >
                        <span className="material-symbols-outlined icon-fill">add</span>
                    </button>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default MainLayout;
