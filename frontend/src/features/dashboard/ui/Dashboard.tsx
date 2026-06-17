import React, { useMemo } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import { useQuery } from '@tanstack/react-query';
import { useIonRouter } from '@ionic/react';
import { api, useUIStore } from '../../../lib/api';

const fetchTickets = async (orgId: string | null) => {
    if (!orgId) return [];
    const { data } = await api.get(`/tickets/?org_id=${orgId}`);
    return Array.isArray(data) ? data : (data.results || []);
};

const Dashboard: React.FC = () => {
    const router = useIonRouter();
    const currentOrganizationId = useUIStore(state => state.currentOrganizationId);
    const searchQuery = useUIStore(state => state.searchQuery);

    const { data: tickets = [], isLoading } = useQuery({
        queryKey: ['tickets', currentOrganizationId],
        queryFn: () => fetchTickets(currentOrganizationId),
        enabled: !!currentOrganizationId,
    });

    const metrics = useMemo(() => {
        let emFila = 0;
        let emAndamento = 0;
        let emRevisao = 0;

        tickets.forEach((t: any) => {
            if (t.status === 'ABERTO') emFila++;
            if (t.status === 'ANDAMENTO') emAndamento++;
            if (t.status === 'REVISAO') emRevisao++;
        });

        return { emFila, emAndamento, emRevisao };
    }, [tickets]);

    const recentFeed = useMemo(() => {
        let filtered = [...tickets];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter((t: any) => 
                t.title.toLowerCase().includes(q) || 
                (t.description && t.description.toLowerCase().includes(q)) || 
                (t.creator_name && t.creator_name.toLowerCase().includes(q))
            );
        }

        return filtered
            .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 5);
    }, [tickets, searchQuery]);

    return (
        <MainLayout>
            <div className="mb-8">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Painel Geral</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Em Fila */}
                <div className="bg-[#FFFFFF] rounded-lg p-[24px] shadow-sm border-l-4 border-surface-variant flex items-center justify-between border border-outline-variant/30">
                    <div>
                        <p className="font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase tracking-wider">Em Fila</p>
                        <p className="font-display-lg text-display-lg text-on-surface">{isLoading ? '...' : metrics.emFila}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-3xl">inbox</span>
                    </div>
                </div>

                {/* Pendentes */}
                <div className="bg-[#FFFFFF] rounded-lg p-[24px] shadow-sm border-l-4 border-[#FF8C00] flex items-center justify-between border border-outline-variant/30">
                    <div>
                        <p className="font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase tracking-wider">Em Andamento</p>
                        <p className="font-display-lg text-display-lg text-on-surface">{isLoading ? '...' : metrics.emAndamento}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#FF8C00]/10 flex items-center justify-center text-[#FF8C00]">
                        <span className="material-symbols-outlined text-3xl">assignment</span>
                    </div>
                </div>

                {/* Aguardando Revisão */}
                <div className="bg-[#FFFFFF] rounded-lg p-[24px] shadow-sm border-l-4 border-[#FFD700] flex items-center justify-between border border-outline-variant/30">
                    <div>
                        <p className="font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase tracking-wider">Aguardando Revisão</p>
                        <p className="font-display-lg text-display-lg text-on-surface">{isLoading ? '...' : metrics.emRevisao}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#B8860B]">
                        <span className="material-symbols-outlined text-3xl">pending_actions</span>
                    </div>
                </div>
            </div>

            {/* Feed Recente */}
            <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Feed Recente</h3>
                <div className="bg-[#FFFFFF] rounded-lg shadow-sm border border-outline-variant/30 overflow-hidden">
                    <ul className="divide-y divide-outline-variant">
                        {recentFeed.length === 0 && !isLoading && (
                            <li className="p-[24px] text-center text-on-surface-variant">Nenhuma atividade recente registrada.</li>
                        )}
                        {recentFeed.map((ticket: any) => (
                            <li key={ticket.id} className="p-[24px] hover:bg-surface-container-low transition-colors flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold border border-outline-variant">
                                        <span className="material-symbols-outlined text-sm">notifications</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-body-md text-body-md text-on-surface">
                                        O chamado <a 
                                            className="text-primary hover:underline cursor-pointer" 
                                            onClick={(e) => { e.preventDefault(); router.push(`/tickets/${ticket.id}`); }}
                                        >{ticket.title}</a> foi atualizado recentemente.
                                    </p>
                                    <p className="font-metadata text-metadata text-on-surface-variant mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">schedule</span> 
                                        {new Date(ticket.updated_at).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
