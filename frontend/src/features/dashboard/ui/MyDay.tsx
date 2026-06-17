import React from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import { useQuery } from '@tanstack/react-query';
import { useHistory } from 'react-router-dom';
import { api, useUIStore } from '../../../lib/api';
import { useTicketWebsocket } from '../../../hooks/useTicketWebsocket';

const fetchTickets = async (orgId: string | null) => {
    if (!orgId) return [];
    const { data } = await api.get(`/tickets/?org_id=${orgId}`);
    return data;
};

interface TicketData {
    id: string;
    title: string;
    creator?: string;
    department?: string;
    priority?: number;
    status: string;
    description?: string;
    due_date?: string;
    assignee_id?: string;
}

const MyDay: React.FC = () => {
    const history = useHistory();
    const currentOrganizationId = useUIStore(state => state.currentOrganizationId);
    const currentRole = useUIStore(state => state.currentRole);
    const searchQuery = useUIStore(state => state.searchQuery);
    const [showOnlyMine, setShowOnlyMine] = React.useState(false);
    const [userId, setUserId] = React.useState<string | null>(null);

    React.useEffect(() => {
        import('../../../lib/api').then(({ authStorage }) => {
            authStorage.getAccessToken().then(token => {
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        setUserId(payload.user_id);
                    } catch (e) {}
                }
            });
        });
    }, []);

    useTicketWebsocket();

    const { data: tickets, isLoading } = useQuery({
        queryKey: ['tickets', currentOrganizationId],
        queryFn: () => fetchTickets(currentOrganizationId),
        enabled: !!currentOrganizationId,
    });

    const ticketArray: TicketData[] = Array.isArray(tickets) ? tickets : (tickets?.results || []);

    React.useEffect(() => {
        if (currentRole === 'User') {
            history.replace('/dashboard/general');
        }
    }, [currentRole, history]);

    if (currentRole === 'User') return null;

    const filteredTickets = ticketArray.filter(t => {
        if (showOnlyMine && userId && t.assignee_id !== userId) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.creator?.toLowerCase().includes(q);
    });

    const todo = filteredTickets.filter(t => t.status === 'ABERTO');
    const doing = filteredTickets.filter(t => t.status === 'ANDAMENTO');
    const review = filteredTickets.filter(t => t.status !== 'ABERTO' && t.status !== 'ANDAMENTO');

    const renderCard = (ticket: TicketData) => {
        const priorityColor = 
            ticket.priority === 4 ? 'bg-[#ba1a1a]' : 
            ticket.priority === 3 ? 'bg-[#FF4500]' : 
            ticket.priority === 2 ? 'bg-[#FFD700]' : 'bg-[#22C55E]';
            
        const priorityLabel = 
            ticket.priority === 4 ? 'Urgente' : 
            ticket.priority === 3 ? 'Alta Prioridade' : 
            ticket.priority === 2 ? 'Média Prioridade' : 'Baixa Prioridade';
            
        const labelBg = 
            ticket.priority === 4 ? 'bg-error-container/20 text-error' : 
            ticket.priority === 3 ? 'bg-error-container/20 text-error' : 
            ticket.priority === 2 ? 'bg-tertiary-container/20 text-tertiary' : 'bg-[#22C55E]/10 text-[#166534]';

        let dueDateLabel = null;
        if (ticket.due_date) {
            const due = new Date(ticket.due_date);
            const now = new Date();
            const isOverdue = due < now && ticket.status !== 'CONCLUIDO' && ticket.status !== 'CANCELADO';
            const isToday = due.toDateString() === now.toDateString();
            
            if (isOverdue) {
                dueDateLabel = <div className="bg-error/10 text-error px-2 py-1 rounded font-metadata text-[12px] flex items-center gap-1 border border-error/20"><span className="material-symbols-outlined text-[14px]">warning</span>Atrasado</div>;
            } else if (isToday) {
                dueDateLabel = <div className="bg-[#FF8C00]/10 text-[#FF8C00] px-2 py-1 rounded font-metadata text-[12px] flex items-center gap-1 border border-[#FF8C00]/20"><span className="material-symbols-outlined text-[14px]">today</span>Vence Hoje</div>;
            } else {
                dueDateLabel = <div className="bg-surface-variant/30 text-on-surface-variant px-2 py-1 rounded font-metadata text-[12px] flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">event</span>{due.toLocaleDateString()}</div>;
            }
        }

        return (
            <div 
                key={ticket.id} 
                onClick={() => history.push(`/tickets/${ticket.id}`)}
                className="bg-white rounded-lg p-4 shadow-[0_4px_6px_-1px_rgba(15,23,42,0.1),0_2px_4px_-2px_rgba(15,23,42,0.05)] border border-[#E2E8F0] cursor-pointer relative pl-5 hover:border-outline-variant transition-colors flex flex-col"
            >
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${priorityColor}`}></div>
                <div className="flex justify-between items-start mb-2">
                    <div className={`${labelBg} px-2 py-1 rounded-full font-label-caps text-label-caps inline-block`}>{priorityLabel}</div>
                    {dueDateLabel}
                </div>
                <h4 className="font-body-lg text-body-lg text-on-surface font-semibold mb-2 leading-tight">{ticket.title}</h4>
                <p className="text-on-surface-variant font-metadata text-metadata mb-4 line-clamp-2 flex-1">{ticket.description || 'Sem descrição'}</p>
                <div className="flex justify-between items-center border-t border-outline-variant/30 pt-3 mt-auto">
                    <div className="flex items-center gap-1 text-on-surface-variant font-metadata text-[12px]">
                        <span className="material-symbols-outlined text-[16px]">person</span>
                        {ticket.creator || 'Desconhecido'}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <MainLayout>
            <div className="max-w-[1440px] mx-auto h-full flex flex-col">
                <div className="mb-stack-lg flex justify-between items-end">
                    <div>
                        <h1 className="font-headline-lg text-headline-lg text-on-background">Meu Dia</h1>
                        <p className="text-on-surface-variant font-body-md mt-1">
                            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowOnlyMine(!showOnlyMine)}
                            className={`px-4 py-2 border rounded-lg font-metadata text-metadata flex items-center gap-2 transition-colors ${showOnlyMine ? 'bg-primary text-white border-primary' : 'border-[#E2E8F0] text-on-surface bg-white hover:bg-surface-container-low'}`}
                        >
                            <span className="material-symbols-outlined text-[18px]">person</span>
                            {showOnlyMine ? 'Meus Chamados' : 'Todos'}
                        </button>
                    </div>
                </div>

                {/* Kanban Board */}
                <div className="flex-1 flex gap-gutter min-w-[900px] pb-4 overflow-x-auto">
                    {/* Column: Para Fazer */}
                    <div className="flex-1 flex flex-col bg-surface rounded-xl border border-outline-variant/50 shadow-sm overflow-hidden min-w-[300px]">
                        <div className="p-4 border-b border-outline-variant/50 bg-white/50 flex justify-between items-center">
                            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                                Para Fazer
                                <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded-full font-metadata text-[12px]">{todo.length}</span>
                            </h3>
                        </div>
                        <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
                            {todo.map(renderCard)}
                        </div>
                    </div>

                    {/* Column: Fazendo */}
                    <div className="flex-1 flex flex-col bg-surface rounded-xl border border-outline-variant/50 shadow-sm overflow-hidden min-w-[300px]">
                        <div className="p-4 border-b border-primary/20 bg-primary/5 flex justify-between items-center">
                            <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
                                Fazendo
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-metadata text-[12px]">{doing.length}</span>
                            </h3>
                        </div>
                        <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
                            {doing.map(renderCard)}
                        </div>
                    </div>

                    {/* Column: Em Revisão */}
                    <div className="flex-1 flex flex-col bg-surface rounded-xl border border-outline-variant/50 shadow-sm overflow-hidden min-w-[300px]">
                        <div className="p-4 border-b border-outline-variant/50 bg-white/50 flex justify-between items-center">
                            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                                Concluídos / Revisão
                                <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded-full font-metadata text-[12px]">{review.length}</span>
                            </h3>
                        </div>
                        <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
                            {review.map(renderCard)}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default MyDay;
