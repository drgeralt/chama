import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, useUIStore } from '../../../lib/api';
import MultiSelectDropdown from '../../../components/ui/MultiSelectDropdown';

interface EditTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: any;
    organizationId: string | null;
}

const EditTicketModal: React.FC<EditTicketModalProps> = ({ isOpen, onClose, ticket, organizationId }) => {
    const queryClient = useQueryClient();
    const currentRole = useUIStore(state => state.currentRole);
    const [departmentIds, setDepartmentIds] = useState<string[]>([]);
    const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
    const [priority, setPriority] = useState('2');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        if (ticket && isOpen) {
            setDepartmentIds(ticket.departments_data ? ticket.departments_data.map((d: any) => d.id) : []);
            setAssigneeIds(ticket.assignees_data ? ticket.assignees_data.map((a: any) => a.id) : []);
            setPriority(String(ticket.priority || 2));
            if (ticket.due_date) {
                // Format for datetime-local: YYYY-MM-DDThh:mm
                const date = new Date(ticket.due_date);
                setDueDate(date.toISOString().slice(0, 16));
            } else {
                setDueDate('');
            }
        }
    }, [ticket, isOpen]);

    const { data: members = [] } = useQuery({
        queryKey: ['members', organizationId],
        queryFn: async () => {
            if (!organizationId) return [];
            const { data } = await api.get(`/organizations/${organizationId}/members/`);
            return Array.isArray(data) ? data : (data.results || []);
        },
        enabled: !!organizationId && isOpen,
    });

    const { data: departments = [] } = useQuery({
        queryKey: ['departments', organizationId],
        queryFn: async () => {
            if (!organizationId) return [];
            const { data } = await api.get(`/organizations/${organizationId}/departments/`);
            return Array.isArray(data) ? data : (data.results || []);
        },
        enabled: !!organizationId && isOpen,
    });

    const updateMutation = useMutation({
        mutationFn: async (updatedData: any) => {
            const { data } = await api.patch(`/tickets/${ticket.id}/`, updatedData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            onClose();
        },
        onError: (err: any) => {
            alert(err.response?.data?.detail || 'Erro ao atualizar o chamado.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = {
            priority: parseInt(priority, 10),
            department_ids: departmentIds,
            assignee_ids: assigneeIds,
            due_date: dueDate ? new Date(dueDate).toISOString() : null,
        };
        updateMutation.mutate(payload);
    };

    if (!isOpen || !ticket) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-surface-container-lowest">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">edit_document</span>
                        Editar Chamado
                    </h2>
                    <button onClick={onClose} className="text-on-surface-variant hover:bg-surface-container-low p-1 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        {currentRole !== 'User' && (
                            <>
                                <MultiSelectDropdown 
                                    label="Departamentos"
                                    placeholder="Buscar departamentos..."
                                    options={departments.map((d: any) => ({ id: d.id, label: d.name }))}
                                    selectedIds={departmentIds}
                                    onChange={setDepartmentIds}
                                />

                                <MultiSelectDropdown 
                                    label="Atribuir a"
                                    placeholder="Buscar equipe..."
                                    options={members.filter((m: any) => ['Admin', 'Agent'].includes(m.role?.name)).map((m: any) => ({ id: m.user_id, label: m.user_name || m.user_email }))}
                                    selectedIds={assigneeIds}
                                    onChange={setAssigneeIds}
                                />
                            </>
                        )}

                        <div className="space-y-2">
                            <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase">Prioridade</label>
                            <div className="flex h-12 p-1 bg-surface-container-low rounded-lg border border-outline-variant">
                                <button type="button" onClick={() => setPriority('1')} className={`flex-1 flex items-center justify-center text-sm rounded-md transition-all ${priority === '1' ? 'font-bold bg-[#f0fdf4] border border-[#22c55e] text-[#166534] shadow-sm scale-[1.02]' : 'font-semibold text-on-surface-variant hover:text-on-surface'}`}>Baixa</button>
                                <button type="button" onClick={() => setPriority('2')} className={`flex-1 flex items-center justify-center text-sm rounded-md transition-all ${priority === '2' ? 'font-bold bg-[#fffbeb] border border-[#eab308] text-[#854d0e] shadow-sm scale-[1.02]' : 'font-semibold text-on-surface-variant hover:text-on-surface'}`}>Média</button>
                                <button type="button" onClick={() => setPriority('3')} className={`flex-1 flex items-center justify-center text-sm rounded-md transition-all ${priority === '3' ? 'font-bold bg-[#fef2f2] border border-[#ef4444] text-[#991b1b] shadow-sm scale-[1.02]' : 'font-semibold text-on-surface-variant hover:text-on-surface'}`}>Alta</button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase">Prazo de Entrega (Opcional)</label>
                            <input 
                                type="datetime-local"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full h-12 px-4 bg-white border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="px-4 py-2 font-bold text-white bg-primary hover:bg-[#FF8C00] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTicketModal;
