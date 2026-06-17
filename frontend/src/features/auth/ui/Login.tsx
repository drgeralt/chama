import React, { useState } from 'react';
import { IonPage, useIonRouter } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { api, authStorage } from '../../../lib/api';

const Login: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const redirectParam = queryParams.get('redirect');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useIonRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { data } = await api.post('/auth/token/', { email, password });
            await authStorage.setTokens(data.access, data.refresh);
            if (redirectParam) {
                router.push(redirectParam, 'forward', 'replace');
            } else {
                router.push('/organizations', 'forward', 'replace');
            }
        } catch {
            setError('Credenciais inválidas ou erro no servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <IonPage>
            <main className="flex flex-1 flex-col md:flex-row w-full h-screen overflow-hidden bg-background text-on-surface">
                
                {/* Left Side */}
                <div 
                    className="hidden md:flex md:w-1/2 relative overflow-hidden items-center justify-center"
                    style={{
                        backgroundColor: '#0F172A',
                        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(173, 44, 0, 0.15) 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0F172A] via-[#0F172A]/80 to-primary/20"></div>
                    
                    <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-secondary/10 rounded-full blur-[100px]"></div>
                    
                    <div className="relative z-10 max-w-lg px-margin-desktop space-y-stack-lg">
                        <div className="space-y-4">
                            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/90 font-label-caps text-label-caps backdrop-blur-sm border border-white/20">
                                O futuro da produtividade
                            </span>
                            <h1 className="font-display-lg text-display-lg text-white leading-tight">
                                Transforme sua rotina com gestão inteligente.
                            </h1>
                        </div>
                        
                        <div className="h-1 w-20 bg-primary rounded-full"></div>
                        
                        <p className="font-body-lg text-body-lg text-white/70 max-w-md">
                            Centralize tarefas, colabore em tempo real e alcance resultados extraordinários com o Chama. A plataforma projetada para o seu fluxo de trabalho.
                        </p>
                        
                        <div className="pt-8 grid grid-cols-2 gap-8 border-t border-white/10">
                            <div>
                                <div className="text-white font-headline-md text-headline-md">10k+</div>
                                <div className="text-white/50 font-metadata text-metadata">Usuários Ativos</div>
                            </div>
                            <div>
                                <div className="text-white font-headline-md text-headline-md">99%</div>
                                <div className="text-white/50 font-metadata text-metadata">Satisfação</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface overflow-y-auto">
                    <div className="w-full max-w-md space-y-10 py-8">
                        
                        <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
                            <div className="bg-white p-2 rounded-xl shadow-sm border border-surface-container-high mb-stack-lg">
                                <img alt="Chama Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPl5fKCCkXs-YUpkPJS0Z0Wd2GQA3aA_kVTjBuLMcoqHvAPlPiT3zflz2diadx23Adg7NOc3DEm_9LqWZQgsk1kkgkS1KUXuoqIa5k05vJu6FahKTazSuYvylkkZ1apDokzTGxrOh-VHG5Jjcjyb5zlfLFePVyKSkgN1BLUsQi5alhifoEfTiFaKH3xMHYDtPiuRzjRyCm4DiLhyoh1CJ4Vewfyq_1JDcRp7Vt233kOWxt7kRSOhjyhH1xmBisWtEZtIiHgdd44pak" />
                            </div>
                            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tight">
                                Acesse sua conta
                            </h2>
                            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                                Use suas credenciais para continuar sua jornada.
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <div className="bg-error-container text-on-error-container p-3 rounded-lg text-metadata text-center">
                                    {error}
                                </div>
                            )}
                            
                            <div className="space-y-stack-md">
                                <div>
                                    <label className="block font-metadata text-metadata text-on-surface mb-stack-sm" htmlFor="email">
                                        Endereço de Email
                                    </label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[20px]">mail</span>
                                        <input 
                                            id="email" 
                                            name="email" 
                                            type="email" 
                                            placeholder="nome@empresa.com" 
                                            required 
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="appearance-none block w-full pl-11 pr-4 py-3 border border-[#E2E8F0] rounded-lg shadow-sm placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-md text-body-md bg-white transition-all duration-200" 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-metadata text-metadata text-on-surface mb-stack-sm" htmlFor="password">
                                        Senha
                                    </label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[20px]">lock</span>
                                        <input 
                                            id="password" 
                                            name="password" 
                                            type="password" 
                                            placeholder="••••••••" 
                                            required 
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="appearance-none block w-full pl-11 pr-12 py-3 border border-[#E2E8F0] rounded-lg shadow-sm placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-md text-body-md bg-white transition-all duration-200" 
                                        />
                                        <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-primary transition-colors focus:outline-none">
                                            <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input 
                                        id="remember-me" 
                                        name="remember-me" 
                                        type="checkbox" 
                                        className="h-4 w-4 text-primary focus:ring-primary/30 border border-[#E2E8F0] rounded cursor-pointer transition-colors" 
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block font-metadata text-metadata text-on-surface-variant cursor-pointer">
                                        Manter conectado
                                    </label>
                                </div>
                                <a href="/forgot-password" className="font-metadata text-metadata text-primary hover:text-primary-container font-semibold transition-colors">
                                    Esqueceu a senha?
                                </a>
                            </div>

                            <div>
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-3.5 px-4 border border-transparent font-headline-sm text-headline-sm rounded-lg text-white bg-primary hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isLoading ? 'Entrando...' : 'Entrar na plataforma'}
                                </button>
                            </div>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-outline-variant"></div>
                            </div>
                            <div className="relative flex justify-center text-metadata uppercase tracking-widest">
                                <span className="bg-surface px-4 text-on-surface-variant/50">Ou continue com</span>
                            </div>
                        </div>

                        <button onClick={() => window.location.href = '/api/auth/google/'} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-[#E2E8F0] bg-white rounded-lg font-metadata text-on-surface hover:bg-surface-container-low transition-colors shadow-sm">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                            </svg>
                            Google
                        </button>

                        <div className="text-center font-body-md text-body-md text-on-surface-variant">
                            <p>
                                Ainda não tem conta? 
                                <a href={redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : '/register'} className="font-semibold text-primary hover:underline transition-all ml-1">
                                    Crie agora mesmo
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </IonPage>
    );
};

export default Login;