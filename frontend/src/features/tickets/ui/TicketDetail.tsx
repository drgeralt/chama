import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '../../../components/layout/MainLayout';
import { api, useUIStore } from '../../../lib/api';
import EditTicketModal from './EditTicketModal';

interface TicketDetailParams {
    id: string;
}

const fetchTicketDetail = async (id: string) => {
    const { data } = await api.get(`/tickets/${id}/`);
    return data;
};

const TicketDetail: React.FC = () => {
    const { id } = useParams<TicketDetailParams>();
    const history = useHistory();
    const [comment, setComment] = useState('');

    const queryClient = useQueryClient();
    const currentOrganizationId = useUIStore(state => state.currentOrganizationId);
    const currentRole = useUIStore(state => state.currentRole);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isInternal, setIsInternal] = useState(false);

    const { data: ticket, isLoading, isError } = useQuery({
        queryKey: ['ticket', id],
        queryFn: () => fetchTicketDetail(id),
        enabled: id !== 'new',
    });

    const { data: comments = [] } = useQuery({
        queryKey: ['ticketComments', id],
        queryFn: async () => {
            const { data } = await api.get(`/tickets/${id}/comments/`);
            return Array.isArray(data) ? data : (data.results || []);
        },
        enabled: id !== 'new',
    });

    const commentMutation = useMutation({
        mutationFn: async (content: string) => {
            const { data } = await api.post(`/tickets/${id}/comments/`, { content, is_internal: isInternal });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticketComments', id] });
            setComment('');
        }
    });

    const transitionMutation = useMutation({
        mutationFn: async (action: string) => {
            const { data } = await api.post(`/tickets/${id}/transition/`, { action });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', id] });
        }
    });

    if (id === 'new') return null;
    if (isLoading) return <MainLayout><p className="p-4">Carregando detalhes...</p></MainLayout>;
    if (isError || !ticket) return <MainLayout><p className="p-4 text-error">Erro ao carregar o chamado.</p></MainLayout>;

    // Priority colors
    const priorityColor = 
        ticket.priority === 4 ? 'text-error bg-error/10 border-error/20' : 
        ticket.priority === 3 ? 'text-[#FF4500] bg-[#FF4500]/10 border-[#FF4500]/20' : 
        ticket.priority === 2 ? 'text-[#FFD700] bg-[#FFD700]/10 border-[#FFD700]/20' : 
        'text-surface-variant bg-surface-variant/10 border-surface-variant/20';
        
    const priorityText = 
        ticket.priority === 4 ? 'Urgente' : 
        ticket.priority === 3 ? 'Alta' : 
        ticket.priority === 2 ? 'Média' : 'Baixa';

    return (
        <MainLayout>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter pb-24">
                {/* Left Panel: Info */}
                <div className="lg:col-span-8 space-y-stack-lg">
                    <div className="bg-surface-container-lowest shadow-[0_4px_6px_-1px_rgba(15,23,42,0.1)] rounded-xl p-stack-lg border border-outline-variant/30">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 bg-surface-container-high text-primary font-label-caps text-label-caps rounded-full uppercase">Ticket</span>
                                    <span className="font-metadata text-metadata text-on-surface-variant">#{ticket.id.split('-')[0]}</span>
                                </div>
                                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-4">{ticket.title}</h1>
                            </div>
                            <div className="flex gap-2 items-center">
                                <button onClick={() => setIsEditModalOpen(true)} className="text-on-surface-variant hover:text-primary transition-colors p-2">
                                    <span className="material-symbols-outlined">edit</span>
                                </button>
                                <span className={`px-3 py-1 font-metadata text-metadata rounded-full border ${priorityColor}`}>{priorityText}</span>
                                <span className="px-3 py-1 bg-secondary-container/20 text-secondary font-metadata text-metadata rounded-full border border-secondary-container/30">{ticket.status}</span>
                            </div>
                        </div>
                        <div className="prose max-w-none font-body-md text-body-md text-on-surface mb-8 whitespace-pre-wrap">
                            {ticket.description || 'Sem descrição.'}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-outline-variant/50">
                            <div>
                                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Criador</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-surface-variant rounded-full flex items-center justify-center text-xs font-bold text-on-surface-variant">
                                        {ticket.creator_name?.slice(0,2)?.toUpperCase() || 'US'}
                                    </div>
                                    <span className="font-metadata text-metadata text-on-surface">{ticket.creator_name || ticket.creator}</span>
                                </div>
                            </div>
                            <div>
                                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Executor</p>
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${ticket.assignee ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-variant text-on-surface-variant border border-dashed border-outline-variant'}`}>
                                        {ticket.assignee_name ? ticket.assignee_name.slice(0,2).toUpperCase() : '--'}
                                    </div>
                                    <span className={`font-metadata text-metadata ${ticket.assignee ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                        {ticket.assignee_name || 'Não atribuído'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Departamento</p>
                                <span className="font-metadata text-metadata text-on-surface">{ticket.department_name || 'N/A'}</span>
                            </div>
                            <div>
                                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Prazo</p>
                                <span className="font-metadata text-metadata text-error font-medium">{ticket.due_date ? new Date(ticket.due_date).toLocaleDateString() : 'Sem prazo'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Timeline/Chat */}
                <div className="lg:col-span-4 flex flex-col gap-stack-md h-[calc(100vh-140px)] sticky top-24">
                    <div className="bg-surface-container-lowest shadow-[0_4px_6px_-1px_rgba(15,23,42,0.1)] rounded-xl border border-outline-variant/30 flex-1 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                            <h3 className="font-headline-sm text-headline-sm text-on-surface">Atividade</h3>
                            <span className="material-symbols-outlined text-on-surface-variant">history</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-surface">
                            {/* System Log */}
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant shrink-0 z-10 relative">
                                    <span className="material-symbols-outlined" style={{fontSize: '16px'}}>add_circle</span>
                                </div>
                                <div className="pt-1 pb-4 border-l border-outline-variant -ml-[19px] pl-8 relative">
                                    <p className="font-metadata text-metadata text-on-surface-variant">Chamado criado por <span className="text-on-surface font-medium">{ticket.creator_name || ticket.creator}</span></p>
                                    <p className="font-label-caps text-label-caps text-on-surface-variant/70 mt-1">{new Date(ticket.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                            {comments.map((c: any) => (
                                <div key={c.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 z-10 relative border border-primary/20">
                                        <span className="material-symbols-outlined" style={{fontSize: '16px'}}>chat_bubble</span>
                                    </div>
                                    <div className="pt-1 pb-4 border-l border-outline-variant -ml-[19px] pl-8 relative">
                                        <p className="font-metadata text-metadata text-on-surface font-medium mb-1">{c.author_name || 'Usuário'}</p>
                                        <div className="bg-white border border-outline-variant/50 rounded-lg p-3 text-body-sm font-body-sm shadow-sm whitespace-pre-wrap">
                                            {c.content}
                                        </div>
                                        <p className="font-label-caps text-label-caps text-on-surface-variant/70 mt-2">{new Date(c.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-outline-variant bg-surface-container-lowest">
                            <div className="relative input-ring rounded-lg border border-outline-variant bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                                <textarea 
                                    className="w-full p-3 bg-transparent font-body-md text-body-md text-on-surface resize-none focus:outline-none" 
                                    placeholder="Adicionar comentário..." 
                                    rows={2}
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                ></textarea>
                                <div className="flex justify-between items-center p-2 border-t border-outline-variant/30">
                                    <div className="flex items-center gap-2 px-2">
                                        {currentRole !== 'User' && (
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isInternal}
                                                    onChange={e => setIsInternal(e.target.checked)}
                                                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20 transition-all cursor-pointer"
                                                />
                                                <span className="font-metadata text-metadata text-on-surface-variant group-hover:text-on-surface transition-colors">Nota Interna (Só Equipe)</span>
                                            </label>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => { if(comment.trim()) commentMutation.mutate(comment); }}
                                        disabled={!comment.trim() || commentMutation.isPending}
                                        className="px-4 py-1.5 bg-primary hover:bg-[#FF8C00] text-white font-metadata text-metadata rounded-md transition-colors active:scale-95 disabled:opacity-50"
                                    >
                                        Comentar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar (Fixed) */}
            <div className="fixed bottom-0 left-0 md:left-[280px] right-0 bg-surface-container-lowest border-t border-outline-variant shadow-[0_-4px_6px_-1px_rgba(15,23,42,0.05)] p-4 flex justify-between items-center z-20">
                <div className="hidden sm:block">
                    <p className="font-metadata text-metadata text-on-surface-variant">Status Atual: <span className="text-on-surface font-medium">{ticket.status}</span></p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={() => history.goBack()} className="flex-1 sm:flex-none px-6 py-2 border border-outline-variant text-on-surface font-headline-sm text-headline-sm rounded-lg hover:bg-surface-container-low transition-colors active:scale-95 bg-white">
                        Voltar
                    </button>
                    {ticket.status === 'ABERTO' && (
                        <button 
                            onClick={() => transitionMutation.mutate('iniciar')}
                            disabled={transitionMutation.isPending}
                            className="flex-1 sm:flex-none px-6 py-2 bg-[#FF4500] hover:bg-[#FF8C00] text-white font-headline-sm text-headline-sm rounded-lg transition-colors active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>play_arrow</span>
                            {transitionMutation.isPending ? 'Iniciando...' : 'Iniciar Trabalho'}
                        </button>
                    )}
                </div>
            </div>

            <EditTicketModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                ticket={ticket} 
                organizationId={currentOrganizationId} 
            />
        </MainLayout>
    );
};

export default TicketDetail;
