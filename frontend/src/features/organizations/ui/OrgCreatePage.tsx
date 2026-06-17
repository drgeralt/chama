import React, { useState } from 'react';
import { IonPage, IonContent, useIonRouter } from '@ionic/react';
import { api, useUIStore } from '../../../lib/api';
import { queryClient } from '../../../lib/queryClient';

const OrgCreatePage: React.FC = () => {
    const router = useIonRouter();
    const setOrganization = useUIStore(state => state.setOrganization);
    
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        // Auto-generate slug
        setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data } = await api.post('/organizations/', {
                name,
                slug,
            });
            
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            
            setOrganization(data.id);
            router.push('/dashboard/general', 'forward', 'replace');
        } catch (error) {
            console.error(error);
            alert('Erro ao criar organização. Verifique se o identificador já está em uso.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <IonPage>
            <IonContent className="bg-[#F8FAFC]">
                <div className="min-h-screen flex items-center justify-center p-4">
                    <main className="w-full max-w-lg mx-auto bg-white p-8 rounded-xl border border-[#E2E8F0] shadow-md">
                        <div className="mb-8 text-center">
                            <h1 className="font-headline-lg text-headline-lg text-[#0F172A] mb-2">Nova Organização</h1>
                            <p className="font-body-md text-body-md text-[#64748B]">Configure seu novo espaço de trabalho.</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="font-medium text-[#0F172A]">Nome da Empresa</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={handleNameChange}
                                    className="w-full rounded-lg border border-outline-variant bg-white py-3 px-4 focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500]"
                                    placeholder="Ex: Acme Corp"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-medium text-[#0F172A]">Identificador Único (URL)</label>
                                <div className="flex items-center">
                                    <span className="bg-surface-container-low border border-outline-variant border-r-0 rounded-l-lg py-3 px-3 text-[#64748B]">chama.com/</span>
                                    <input
                                        type="text"
                                        required
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                                        className="w-full rounded-r-lg border border-outline-variant bg-white py-3 px-4 focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500]"
                                        placeholder="acme-corp"
                                    />
                                </div>
                                <p className="text-xs text-[#64748B]">Isso será usado para acessar sua organização.</p>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.goBack()}
                                    disabled={isLoading}
                                    className="flex-1 rounded-lg border border-[#E2E8F0] py-3 text-[#0F172A] font-medium hover:bg-surface-container-low transition-all disabled:opacity-70"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || !name || !slug}
                                    className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-[#FF4500] py-3 text-white font-medium hover:brightness-110 active:scale-[0.98] transition-all shadow-md disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    ) : (
                                        'Criar Espaço'
                                    )}
                                </button>
                            </div>
                        </form>
                    </main>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default OrgCreatePage;
