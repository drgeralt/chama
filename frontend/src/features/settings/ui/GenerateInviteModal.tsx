import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';

interface GenerateInviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    organizationId: string | null;
}

const GenerateInviteModal: React.FC<GenerateInviteModalProps> = ({ isOpen, onClose, organizationId }) => {
    const [role, setRole] = useState('User');
    const [inviteLink, setInviteLink] = useState('');

    const generateMutation = useMutation({
        mutationFn: async (data: { role: string }) => {
            const response = await api.post(`/organizations/${organizationId}/invites/`, data);
            return response.data;
        },
        onSuccess: (data) => {
            const link = `${window.location.origin}/invite/${data.id}`;
            setInviteLink(link);
            navigator.clipboard.writeText(link);
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-surface-container-lowest">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">link</span>
                        Gerar Link de Convite
                    </h2>
                    <button onClick={onClose} className="text-on-surface-variant hover:bg-surface-container-low p-1 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    {!inviteLink ? (
                        <>
                            <p className="text-on-surface-variant font-body-md text-body-md">
                                Selecione o nível de permissão que este link concederá a quem acessá-lo.
                            </p>

                            <div className="space-y-3">
                                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase">Nível de Acesso (Cargo)</label>
                                
                                <div className="space-y-2">
                                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${role === 'Admin' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:bg-surface-container-lowest'}`}>
                                        <input type="radio" name="role" value="Admin" checked={role === 'Admin'} onChange={() => setRole('Admin')} className="mt-1 accent-primary" />
                                        <div>
                                            <p className="font-bold text-on-surface">Administrador</p>
                                            <p className="text-xs text-on-surface-variant mt-1">Acesso total. Pode criar departamentos, gerar convites e gerenciar chamados de qualquer pessoa.</p>
                                        </div>
                                    </label>
                                    
                                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${role === 'Agent' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:bg-surface-container-lowest'}`}>
                                        <input type="radio" name="role" value="Agent" checked={role === 'Agent'} onChange={() => setRole('Agent')} className="mt-1 accent-primary" />
                                        <div>
                                            <p className="font-bold text-on-surface">Agente de Atendimento</p>
                                            <p className="text-xs text-on-surface-variant mt-1">Pode ser atribuído a chamados, responder tickets de clientes e alterar status internos.</p>
                                        </div>
                                    </label>

                                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${role === 'User' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:bg-surface-container-lowest'}`}>
                                        <input type="radio" name="role" value="User" checked={role === 'User'} onChange={() => setRole('User')} className="mt-1 accent-primary" />
                                        <div>
                                            <p className="font-bold text-on-surface">Cliente (Usuário Comum)</p>
                                            <p className="text-xs text-on-surface-variant mt-1">Pode apenas abrir chamados para sua empresa e acompanhar o status das próprias solicitações.</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button 
                                onClick={() => generateMutation.mutate({ role })}
                                disabled={generateMutation.isPending}
                                className="w-full mt-4 px-4 py-3 font-bold text-white bg-primary hover:bg-[#FF8C00] rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {generateMutation.isPending ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">refresh</span>
                                        Gerando...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">add_link</span>
                                        Criar Link Mágico
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <div className="space-y-4 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4">
                                <span className="material-symbols-outlined text-4xl">check_circle</span>
                            </div>
                            <h3 className="font-headline-sm text-on-surface">Convite Gerado com Sucesso!</h3>
                            <p className="text-on-surface-variant text-sm mb-4">
                                Este link expira em 7 dias e concederá acesso de <strong>{role}</strong> à sua organização.
                            </p>
                            
                            <div className="flex items-center gap-2 bg-surface-container-low p-2 rounded border border-outline-variant">
                                <input readOnly value={inviteLink} className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface" />
                                <button 
                                    onClick={() => navigator.clipboard.writeText(inviteLink)}
                                    className="p-2 bg-primary text-white rounded hover:bg-[#FF8C00] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">content_copy</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-[#E2E8F0] flex justify-end gap-3 bg-surface-container-lowest">
                    <button onClick={onClose} className="px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
                        {inviteLink ? 'Fechar' : 'Cancelar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GenerateInviteModal;
