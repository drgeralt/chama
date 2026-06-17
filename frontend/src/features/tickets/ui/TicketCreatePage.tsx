import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIonRouter } from '@ionic/react';
import { api, useUIStore, authStorage } from '../../../lib/api';
import MainLayout from '../../../components/layout/MainLayout';

const TicketCreatePage: React.FC = () => {
    const router = useIonRouter();
    const queryClient = useQueryClient();
    const currentOrganizationId = useUIStore(state => state.currentOrganizationId);

    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [priority, setPriority] = useState('2');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [userId, setUserId] = React.useState<string | null>(null);

    React.useEffect(() => {
        authStorage.getAccessToken().then(token => {
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUserId(payload.user_id);
                } catch (e) {}
            }
        });
    }, []);

    const { data: membersData } = useQuery({
        queryKey: ['members', currentOrganizationId],
        queryFn: async () => {
            if (!currentOrganizationId) return [];
            const { data } = await api.get(`/organizations/${currentOrganizationId}/members/`);
            return data;
        },
        enabled: !!currentOrganizationId,
    });

    const { data: departmentsData } = useQuery({
        queryKey: ['departments', currentOrganizationId],
        queryFn: async () => {
            if (!currentOrganizationId) return [];
            const { data } = await api.get(`/organizations/${currentOrganizationId}/departments/`);
            return data;
        },
        enabled: !!currentOrganizationId,
    });

    const members = Array.isArray(membersData) ? membersData : (membersData?.results || []);
    const departmentsList = Array.isArray(departmentsData) ? departmentsData : (departmentsData?.results || []);
    
    const currentUserMember = members.find((m: any) => m.user_id === userId);
    const isCommonUser = currentUserMember?.role?.name === 'User';

    const createTicketMutation = useMutation({
        mutationFn: async (newTicket: any) => {
            const { data } = await api.post('/tickets/', newTicket);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            router.goBack(); 
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createTicketMutation.mutate({
            title,
            department_id: department || undefined,
            priority: parseInt(priority, 10),
            description,
            due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
            assignee_id: assigneeId || undefined,
            organization_id: currentOrganizationId
        });
    };

    return (
        <MainLayout>
            <div className="flex items-center justify-center min-h-[calc(100vh-140px)]">
                {/* Focused Interaction Area */}
                <div className="w-full max-w-2xl bg-white rounded-xl border border-outline-variant shadow-[0_4px_6px_-1px_rgba(15,23,42,0.1)] overflow-hidden z-10 relative">
                    {/* Header with progress visualization */}
                    <div className="p-8 border-b border-outline-variant bg-surface-container-lowest">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-3xl">add_task</span>
                            </div>
                            <div>
                                <h1 className="font-headline-lg text-headline-lg text-on-surface">Novo Chamado</h1>
                                <p className="text-on-surface-variant text-sm">Preencha os dados abaixo para iniciar uma nova solicitação.</p>
                            </div>
                        </div>
                    </div>
                    
                    <form className="p-8 space-y-6 bg-white" id="new-task-form" onSubmit={handleSubmit}>
                        {/* Title Input */}
                        <div className="space-y-2">
                            <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="title">Título do Chamado</label>
                            <input 
                                className="w-full h-12 px-4 bg-white border border-outline-variant rounded-lg focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/20 transition-all placeholder:text-surface-variant outline-none" 
                                id="title" 
                                name="title" 
                                placeholder="Ex: Problemas no acesso ao servidor de arquivos" 
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Department Select - Só mostra se não for user comum */}
                            {!isCommonUser && (
                                <div className="space-y-2">
                                    <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="department">Departamento Destino</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full h-12 px-4 bg-white border border-outline-variant rounded-lg focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/20 transition-all outline-none appearance-none" 
                                            id="department" 
                                            name="department"
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                        >
                                            <option disabled value="">Selecione um depto (Opcional)</option>
                                            {departmentsList.map((dept: any) => (
                                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                                    </div>
                                </div>
                            )}

                            {/* Assignee Select - Só mostra se não for user comum */}
                            {!isCommonUser && (
                                <div className="space-y-2">
                                    <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="assignee">Atribuir a</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full h-12 px-4 bg-white border border-outline-variant rounded-lg focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/20 transition-all outline-none appearance-none" 
                                            id="assignee" 
                                            name="assignee"
                                            value={assigneeId}
                                            onChange={(e) => setAssigneeId(e.target.value)}
                                        >
                                            <option value="">Não atribuído</option>
                                            {members.map((m: any) => (
                                                <option key={m.user_id} value={m.user_id}>{m.user_name || m.user_email}</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                                    </div>
                                </div>
                            )}

                            {/* Priority Segmented Control */}
                            <div className="space-y-2">
                                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase">Prioridade</label>
                                <div className="flex h-12 p-1 bg-surface-container-low rounded-lg border border-outline-variant">
                                    <button 
                                        type="button"
                                        onClick={() => setPriority('1')}
                                        className={`flex-1 flex items-center justify-center text-sm rounded-md transition-all ${priority === '1' ? 'font-bold bg-[#f0fdf4] border border-[#22c55e] text-[#166534] shadow-sm scale-[1.02]' : 'font-semibold text-on-surface-variant hover:text-on-surface'}`}
                                    >
                                        Baixa
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setPriority('2')}
                                        className={`flex-1 flex items-center justify-center text-sm rounded-md transition-all ${priority === '2' ? 'font-bold bg-[#fffbeb] border border-[#eab308] text-[#854d0e] shadow-sm scale-[1.02]' : 'font-semibold text-on-surface-variant hover:text-on-surface'}`}
                                    >
                                        Média
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setPriority('3')}
                                        className={`flex-1 flex items-center justify-center text-sm rounded-md transition-all ${priority === '3' ? 'font-bold bg-[#fef2f2] border border-[#ef4444] text-[#991b1b] shadow-sm scale-[1.02]' : 'font-semibold text-on-surface-variant hover:text-on-surface'}`}
                                    >
                                        Alta
                                    </button>
                                </div>
                            </div>

                            {/* Due Date Input */}
                            <div className="space-y-2">
                                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="dueDate">Prazo de Entrega (Opcional)</label>
                                <input 
                                    className="w-full h-12 px-4 bg-white border border-outline-variant rounded-lg focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/20 transition-all outline-none" 
                                    id="dueDate" 
                                    name="dueDate" 
                                    type="datetime-local"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Description Area */}
                        <div className="space-y-2">
                            <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="description">Descrição Detalhada</label>
                            <textarea 
                                className="w-full p-4 bg-white border border-outline-variant rounded-lg focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/20 transition-all placeholder:text-surface-variant outline-none resize-none" 
                                id="description" 
                                name="description" 
                                placeholder="Descreva com detalhes o ocorrido para agilizar o atendimento..." 
                                rows={5}
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>

                        {/* Action Area */}
                        <div className="pt-4 flex items-center justify-between gap-4 border-t border-outline-variant/30 mt-6">
                            <button 
                                type="button"
                                onClick={() => router.goBack()}
                                className="px-6 h-12 flex items-center justify-center font-bold text-on-surface-variant hover:bg-surface-container-low transition-all rounded-lg active:scale-95"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit"
                                disabled={createTicketMutation.isPending}
                                className={`flex-1 max-w-xs h-12 text-white font-bold rounded-lg shadow-lg shadow-[#FF4500]/20 transition-all flex items-center justify-center gap-2 active:scale-95 ${createTicketMutation.isSuccess ? 'bg-green-600' : 'bg-[#FF4500] hover:bg-[#FF8C00]'} ${createTicketMutation.isPending ? 'opacity-70' : ''}`}
                            >
                                {createTicketMutation.isPending ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">refresh</span>
                                        <span>Processando...</span>
                                    </>
                                ) : createTicketMutation.isSuccess ? (
                                    <>
                                        <span className="material-symbols-outlined">check_circle</span>
                                        <span>Sucesso!</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Criar Chamado</span>
                                        <span className="material-symbols-outlined">send</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

export default TicketCreatePage;
