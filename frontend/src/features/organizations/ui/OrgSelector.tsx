import React from 'react';
import { IonPage, IonContent, useIonRouter } from '@ionic/react';
import { useQuery } from '@tanstack/react-query';
import { api, useUIStore } from '../../../lib/api';

interface Organization {
    id: string;
    name: string;
    slug: string;
    description?: string;
    current_role?: string;
}

const fetchOrganizations = async () => {
    const { data } = await api.get('/organizations/');
    return data;
};

const OrgSelector: React.FC = () => {
    const router = useIonRouter();
    const setOrganization = useUIStore(state => state.setOrganization);

    const { data: orgData, isLoading, isError } = useQuery({
        queryKey: ['organizations'],
        queryFn: fetchOrganizations,
    });

    const orgs = Array.isArray(orgData) ? orgData : (orgData?.results || []);

    const handleSelectOrg = (org: Organization) => {
        setOrganization(org.id, org.current_role);
        router.push('/dashboard/general', 'forward', 'replace');
    };

    return (
        <IonPage>
            <IonContent className="bg-[#F8FAFC]">
                <div className="min-h-screen flex items-center justify-center p-4">
                    <main className="w-full max-w-4xl mx-auto flex flex-col items-center">
                        <div className="mb-12 text-center">
                            <h1 className="font-headline-lg text-headline-lg text-[#0F172A] mb-2 hidden md:block">Escolha sua Organização</h1>
                            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-[#0F172A] mb-2 block md:hidden">Escolha sua Organização</h1>
                            <p className="font-body-md text-body-md text-[#64748B]">Selecione um espaço de trabalho para continuar</p>
                        </div>
                        
                        {isLoading && <p>Carregando...</p>}
                        {isError && <p className="text-error">Erro ao carregar organizações.</p>}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-12">
                            {orgs.map((org: Organization) => (
                                <button 
                                    key={org.id}
                                    onClick={() => handleSelectOrg(org)}
                                    className="group flex flex-col items-center justify-center p-8 bg-surface-container-lowest rounded-lg border border-[#E2E8F0] shadow-[0_4px_6px_-1px_rgba(15,23,42,0.1),0_2px_4px_-2px_rgba(15,23,42,0.05)] hover:border-[#FF4500] hover:ring-2 hover:ring-[#FF4500]/20 transition-all duration-200"
                                >
                                    <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4 text-[#0F172A] group-hover:text-[#FF4500] transition-colors">
                                        <span className="material-symbols-outlined text-3xl">domain</span>
                                    </div>
                                    <h2 className="font-headline-sm text-headline-sm text-[#0F172A]">{org.name}</h2>
                                    <p className="font-metadata text-metadata text-[#64748B] mt-1">{org.slug}</p>
                                </button>
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => router.push('/organizations/new', 'forward', 'push')}
                            className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-[#E2E8F0] text-[#0F172A] font-body-md text-body-md font-medium hover:border-[#0F172A] hover:bg-surface-container-low transition-all duration-200"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Criar Nova Organização
                        </button>
                    </main>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default OrgSelector;
