import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useHistory } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import { api, useUIStore } from '../../../lib/api';
import { useTicketWebsocket } from '../../../hooks/useTicketWebsocket';

const fetchTickets = async (orgId: string | null) => {
    if (!orgId) return [];
    const { data } = await api.get(`/tickets/?org_id=${orgId}`);
    return data; // Assumes API returns a list or { results: [...] } based on DRF
};

interface TicketData {
    id: string;
    title: string;
    creator?: string;
    department?: string;
    priority?: number;
    status: string;
}

const TicketList: React.FC = () => {
    const history = useHistory();
    const currentOrganizationId = useUIStore(state => state.currentOrganizationId);
    const currentRole = useUIStore(state => state.currentRole);
    const [filterStatus, setFilterStatus] = useState<string | null>('ABERTO');
    
    // Initialize WebSocket connection
    useTicketWebsocket();

    const { data: tickets, isLoading, isError } = useQuery({
        queryKey: ['tickets', currentOrganizationId],
        queryFn: () => fetchTickets(currentOrganizationId),
        enabled: !!currentOrganizationId,
    });

    const ticketArray = Array.isArray(tickets) ? tickets : (tickets?.results || []);
    
    React.useEffect(() => {
        if (currentRole === 'User') {
            history.replace('/dashboard/general');
        }
    }, [currentRole, history]);

    if (currentRole === 'User') return null;

    const filteredTickets = ticketArray.filter((t: TicketData) => {
        if (!filterStatus) return true;
        if (filterStatus === 'CANCELADO') return t.status === 'CANCELADO' || t.status === 'REJEITADO';
        return t.status === filterStatus;
    });

    return (
        <MainLayout>
            <div className="mb-8">
                <h1 className="font-headline-lg text-headline-lg text-on-background mb-6">Fila do Departamento</h1>
                {/* Filter Tabs */}
                <div className="flex gap-6 border-b border-outline-variant">
                    <button 
                        onClick={() => setFilterStatus('ABERTO')}
                        className={`pb-3 font-body-md text-body-md px-2 transition-colors ${filterStatus === 'ABERTO' ? 'text-primary font-bold border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                        Abertos
                    </button>
                    <button 
                        onClick={() => setFilterStatus('ANDAMENTO')}
                        className={`pb-3 font-body-md text-body-md px-2 transition-colors ${filterStatus === 'ANDAMENTO' ? 'text-primary font-bold border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                        Em Andamento
                    </button>
                    <button 
                        onClick={() => setFilterStatus('CANCELADO')}
                        className={`pb-3 font-body-md text-body-md px-2 transition-colors ${filterStatus === 'CANCELADO' ? 'text-primary font-bold border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                        Cancelados
                    </button>
                    <button 
                        onClick={() => setFilterStatus(null)}
                        className={`pb-3 font-body-md text-body-md px-2 transition-colors ${filterStatus === null ? 'text-primary font-bold border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                        Todos
                    </button>
                </div>
            </div>
            {/* Task List Area */}
            <div className="flex flex-col gap-4">
                {isLoading && <p className="p-4 text-center text-on-surface-variant">Carregando chamados...</p>}
                {isError && <p className="p-4 text-center text-error">Erro ao carregar chamados.</p>}

                {filteredTickets.length === 0 && !isLoading && !isError && (
                    <p className="p-4 text-center text-on-surface-variant">Nenhum chamado encontrado nesta fila.</p>
                )}

                {filteredTickets.map((ticket: TicketData) => (
                    <div 
                        key={ticket.id} 
                        onClick={() => history.push(`/tickets/${ticket.id}`)}
                        className="bg-white rounded-lg p-stack-lg flex flex-col sm:flex-row sm:items-center justify-between group relative overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-outline-variant/30 cursor-pointer"
                    >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${ticket.priority === 4 ? 'bg-[#ba1a1a]' :
                                ticket.priority === 3 ? 'bg-[#FF4500]' :
                                    ticket.priority === 2 ? 'bg-[#FFD700]' : 'bg-surface-variant'
                            }`}></div>

                        <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-0">
                            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold border border-outline-variant flex-shrink-0">
                                {ticket.creator?.slice(0, 2)?.toUpperCase() || 'USR'}
                            </div>
                            <div>
                                <h3 className="font-headline-sm text-headline-sm text-on-background mb-1">{ticket.title}</h3>
                                <p className="font-metadata text-metadata text-surface-variant/70">
                                    Criado por {ticket.creator} • Dep: {ticket.department}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between sm:gap-8 ml-10 sm:ml-0">
                            <div className="text-left sm:text-right">
                                <span className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Status</span>
                                <span className="font-metadata text-metadata text-on-surface font-semibold">
                                    {ticket.status}
                                </span>
                            </div>
                            <span className={`px-3 py-1 rounded-full font-metadata text-metadata font-semibold ${ticket.status === 'ABERTO' ? 'bg-primary-container/10 text-primary-container' :
                                    ticket.status === 'ANDAMENTO' ? 'bg-tertiary-container/10 text-tertiary-container' :
                                        'bg-surface-variant/30 text-on-surface-variant'
                                }`}>
                                {ticket.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </MainLayout>
    );
};

export default TicketList;
