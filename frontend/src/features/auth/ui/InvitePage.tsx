import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api, authStorage } from '../../../lib/api';

const InvitePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        authStorage.getAccessToken().then(token => {
            setIsAuthenticated(!!token);
        });
    }, []);

    const acceptMutation = useMutation({
        mutationFn: async () => {
            const { data } = await api.post(`/organizations/invites/${id}/accept/`);
            return data;
        },
        onSuccess: (data) => {
            history.push('/dashboard/general');
        },
        onError: (err: any) => {
            alert(err.response?.data?.detail || 'Erro ao aceitar convite.');
        }
    });

    if (isAuthenticated === null) return null; // loading

    return (
        <div className="min-h-screen bg-surface-container flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center border border-outline-variant">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary mb-6">
                    <span className="material-symbols-outlined text-4xl">mark_email_read</span>
                </div>
                
                <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Convite Recebido</h1>
                <p className="text-on-surface-variant font-body-md mb-8">Você foi convidado para participar de uma organização no Chama.</p>

                {isAuthenticated ? (
                    <div className="space-y-4">
                        <p className="text-sm text-on-surface-variant bg-surface-container-low p-4 rounded-lg">
                            Você já está logado no sistema. Ao aceitar este convite, seu nível de acesso e organizações serão atualizados automaticamente.
                        </p>
                        <button 
                            onClick={() => acceptMutation.mutate()}
                            disabled={acceptMutation.isPending}
                            className="w-full bg-primary hover:bg-[#FF8C00] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                        >
                            {acceptMutation.isPending ? 'Processando...' : 'Aceitar Convite e Entrar'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-on-surface-variant bg-surface-container-low p-4 rounded-lg">
                            Para aceitar este convite, você precisa fazer login ou criar uma conta gratuita.
                        </p>
                        <button 
                            onClick={() => history.push(`/login?redirect=/invite/${id}`)}
                            className="w-full bg-primary hover:bg-[#FF8C00] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all"
                        >
                            Fazer Login
                        </button>
                        <button 
                            onClick={() => history.push(`/register?redirect=/invite/${id}`)}
                            className="w-full bg-white border border-outline-variant hover:bg-surface-container-low text-on-surface font-bold py-3 px-4 rounded-xl transition-all"
                        >
                            Criar Nova Conta
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvitePage;
