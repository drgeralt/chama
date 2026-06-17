import React, { useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import CreateDepartmentModal from './CreateDepartmentModal';
import GenerateInviteModal from './GenerateInviteModal';
import EditMemberModal from './EditMemberModal';
import { useQuery } from '@tanstack/react-query';
import { useIonRouter } from '@ionic/react';
import { api, useUIStore } from '../../../lib/api';

const fetchDepartments = async (orgId: string | null) => {
    if (!orgId) return [];
    const { data } = await api.get(`/organizations/${orgId}/departments/`);
    return Array.isArray(data) ? data : (data.results || []);
};

const fetchMembers = async (orgId: string | null) => {
    if (!orgId) return [];
    const { data } = await api.get(`/organizations/${orgId}/members/`);
    return Array.isArray(data) ? data : (data.results || []);
};

const Settings: React.FC = () => {
    const router = useIonRouter();
    const currentOrganizationId = useUIStore(state => state.currentOrganizationId);
    const currentRole = useUIStore(state => state.currentRole);
    const [activeTab, setActiveTab] = useState<'equipe' | 'clientes'>('equipe');
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
    const [selectedMember, setSelectedMember] = useState<any>(null);

    const { data: departments = [], isLoading: isLoadingDept } = useQuery({
        queryKey: ['departments', currentOrganizationId],
        queryFn: () => fetchDepartments(currentOrganizationId),
        enabled: !!currentOrganizationId,
    });

    const { data: members = [], isLoading: isLoadingMembers } = useQuery({
        queryKey: ['members', currentOrganizationId],
        queryFn: () => fetchMembers(currentOrganizationId),
        enabled: !!currentOrganizationId,
    });

    React.useEffect(() => {
        if (currentRole === 'User') {
            router.push('/dashboard/general', 'root', 'replace');
        }
    }, [currentRole, router]);

    if (currentRole === 'User') return null;

    return (
        <MainLayout>
            <div className="space-y-stack-lg">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Configurações da Organização</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Gerencie a estrutura da sua empresa e os membros da equipe.</p>
                    </div>
                    <button 
                        onClick={() => setIsGeneratingInvite(true)}
                        className="bg-[#FF4500] hover:bg-[#FF8C00] text-white px-6 py-2.5 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap w-full md:w-auto justify-center">
                        <span className="material-symbols-outlined">link</span>
                        Gerar Link de Convite
                    </button>
                </div>

                {/* Main Bento Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                    {/* Tree View (Departments) - Left Column */}
                    <section className="lg:col-span-4 bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-headline-sm text-headline-sm text-on-surface">Estrutura (Departamentos)</h2>
                            <button onClick={() => setIsDeptModalOpen(true)} className="text-primary hover:bg-primary/10 p-1.5 rounded-md transition-colors">
                                <span className="material-symbols-outlined">add_business</span>
                            </button>
                        </div>
                        <div className="space-y-1">
                            {isLoadingDept && <p className="text-on-surface-variant text-sm">Carregando departamentos...</p>}
                            {!isLoadingDept && departments.length === 0 && (
                                <p className="text-on-surface-variant text-sm italic">Nenhum departamento cadastrado.</p>
                            )}
                            
                            {departments.map((dept: any) => (
                                <div key={dept.id} className={`flex items-center gap-2 py-2 px-2 hover:bg-surface-container-low rounded-md cursor-pointer transition-colors ${dept.parent_id ? 'pl-6' : ''}`}>
                                    <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
                                    <span className="material-symbols-outlined text-primary text-lg">{dept.icon || 'domain'}</span>
                                    <span className="font-metadata text-metadata font-bold text-on-surface">{dept.name}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                    
                    {/* Members Table - Right Column */}
                    <section className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 border-b border-[#E2E8F0] w-full">
                                <button 
                                    onClick={() => setActiveTab('equipe')}
                                    className={`pb-3 font-headline-sm text-sm px-2 transition-all ${activeTab === 'equipe' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                                >
                                    Equipe Interna
                                </button>
                                <button 
                                    onClick={() => setActiveTab('clientes')}
                                    className={`pb-3 font-headline-sm text-sm px-2 transition-all ${activeTab === 'clientes' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                                >
                                    Clientes / Usuários
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low border-b border-[#E2E8F0]">
                                        <th className="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant">Usuário</th>
                                        <th className="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant">Email</th>
                                        <th className="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant">Papel</th>
                                        <th className="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingMembers && (
                                        <tr>
                                            <td colSpan={4} className="py-4 px-6 text-center text-on-surface-variant">Carregando membros...</td>
                                        </tr>
                                    )}
                                    {!isLoadingMembers && members
                                        .filter((member: any) => activeTab === 'equipe' ? ['Admin', 'Agent'].includes(member.role?.name) : member.role?.name === 'User')
                                        .length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-4 px-6 text-center text-on-surface-variant italic">
                                                Nenhum {activeTab === 'equipe' ? 'membro da equipe' : 'cliente'} encontrado.
                                            </td>
                                        </tr>
                                    )}
                                    {members
                                        .filter((member: any) => activeTab === 'equipe' ? ['Admin', 'Agent'].includes(member.role?.name) : member.role?.name === 'User')
                                        .map((member: any) => (
                                        <tr key={member.id} className="border-b border-[#E2E8F0] hover:bg-surface-container-low/50 transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                                                        {member.user_name ? member.user_name.slice(0, 2).toUpperCase() : 'US'}
                                                    </div>
                                                    <span className="font-metadata text-metadata text-on-surface font-semibold">{member.user_name || 'Usuário Sem Nome'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{member.user_email}</td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full font-label-caps text-label-caps ${
                                                    member.role?.name === 'Admin' ? 'bg-primary/10 text-primary' : 'bg-surface-variant/30 text-on-surface-variant'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${member.role?.name === 'Admin' ? 'bg-primary' : 'bg-on-surface-variant'}`}></span> {member.role?.name || 'Membro'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button onClick={() => setSelectedMember(member)} className="text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100 p-1">
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-[#E2E8F0] flex justify-between items-center text-sm text-on-surface-variant">
                            <span>Mostrando resultados filtrados</span>
                            <div className="flex gap-2">
                                <button className="p-1 hover:bg-surface-container-low rounded text-on-surface-variant disabled:opacity-50" disabled><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                                <button className="p-1 hover:bg-surface-container-low rounded text-on-surface-variant" disabled><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            
            <CreateDepartmentModal 
                isOpen={isDeptModalOpen} 
                onClose={() => setIsDeptModalOpen(false)} 
                organizationId={currentOrganizationId} 
            />
            <GenerateInviteModal
                isOpen={isGeneratingInvite}
                onClose={() => setIsGeneratingInvite(false)}
                organizationId={currentOrganizationId}
            />
            <EditMemberModal
                isOpen={!!selectedMember}
                onClose={() => setSelectedMember(null)}
                organizationId={currentOrganizationId}
                member={selectedMember}
            />
        </MainLayout>
    );
};

export default Settings;
