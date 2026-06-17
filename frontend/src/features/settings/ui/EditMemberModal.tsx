import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';

interface EditMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    organizationId: string | null;
    member: any | null;
}

const EditMemberModal: React.FC<EditMemberModalProps> = ({ isOpen, onClose, organizationId, member }) => {
    const queryClient = useQueryClient();
    const [role, setRole] = useState('User');
    const [departmentId, setDepartmentId] = useState('');

    useEffect(() => {
        if (member) {
            setRole(member.role?.name || 'User');
            setDepartmentId(member.department || '');
        }
    }, [member]);

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
        mutationFn: async (data: { role_name: string, department_id: string | null }) => {
            const response = await api.patch(`/organizations/${organizationId}/members/${member.id}/`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members', organizationId] });
            onClose();
        }
    });

    if (!isOpen || !member) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-surface-container-lowest">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">Editar Membro</h2>
                    <button onClick={onClose} className="text-on-surface-variant hover:bg-surface-container-low p-1 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div>
                        <p className="font-bold text-on-surface">{member.user_name || 'Usuário'}</p>
                        <p className="text-sm text-on-surface-variant">{member.user_email}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase">Papel</label>
                        <select 
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full h-12 px-4 bg-white border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        >
                            <option value="Admin">Administrador</option>
                            <option value="Agent">Agente de Atendimento</option>
                            <option value="User">Cliente (Usuário Comum)</option>
                        </select>
                    </div>

                    {role !== 'User' && (
                        <div className="space-y-2">
                            <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase">Departamento</label>
                            <select 
                                value={departmentId}
                                onChange={(e) => setDepartmentId(e.target.value)}
                                className="w-full h-12 px-4 bg-white border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            >
                                <option value="">Sem Departamento</option>
                                {departments.map((dept: any) => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-[#E2E8F0] flex justify-end gap-3 bg-surface-container-lowest">
                    <button onClick={onClose} className="px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button 
                        onClick={() => updateMutation.mutate({ role_name: role, department_id: role === 'User' ? null : departmentId || null })}
                        disabled={updateMutation.isPending}
                        className="px-4 py-2 font-bold text-white bg-primary hover:bg-[#FF8C00] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditMemberModal;
