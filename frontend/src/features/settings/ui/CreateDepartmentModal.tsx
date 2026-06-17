import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

interface CreateDepartmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    organizationId: string | null;
}

const MATERIAL_ICONS = [
    'domain', 'desktop_windows', 'headset_mic', 'account_balance',
    'gavel', 'engineering', 'science', 'local_shipping',
    'support_agent', 'campaign', 'shopping_cart', 'storefront',
    'groups', 'medical_services', 'school', 'restaurant',
    'factory', 'payments'
];

const CreateDepartmentModal: React.FC<CreateDepartmentModalProps> = ({ isOpen, onClose, organizationId }) => {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('domain');

    const createMutation = useMutation({
        mutationFn: async (data: { name: string; icon: string }) => {
            const response = await api.post(`/organizations/${organizationId}/departments/`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments', organizationId] });
            setName('');
            setSelectedIcon('domain');
            onClose();
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">Novo Departamento</h2>
                    <button onClick={onClose} className="text-on-surface-variant hover:bg-surface-container-low p-1 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase">Nome do Departamento</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Recursos Humanos"
                            className="w-full h-12 px-4 bg-white border border-[#E2E8F0] rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase">Ícone</label>
                        <div className="grid grid-cols-6 gap-2">
                            {MATERIAL_ICONS.map((icon) => (
                                <button
                                    key={icon}
                                    onClick={() => setSelectedIcon(icon)}
                                    className={`h-10 w-10 flex items-center justify-center rounded-lg border transition-all ${selectedIcon === icon ? 'border-primary bg-primary/10 text-primary' : 'border-[#E2E8F0] text-on-surface-variant hover:bg-surface-container-low'}`}
                                >
                                    <span className="material-symbols-outlined text-xl">{icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-[#E2E8F0] flex justify-end gap-3 bg-surface-container-lowest">
                    <button onClick={onClose} className="px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button 
                        onClick={() => createMutation.mutate({ name, icon: selectedIcon })}
                        disabled={!name || createMutation.isPending}
                        className="px-4 py-2 font-bold text-white bg-primary hover:bg-[#FF8C00] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {createMutation.isPending ? 'Salvando...' : 'Criar Departamento'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateDepartmentModal;
