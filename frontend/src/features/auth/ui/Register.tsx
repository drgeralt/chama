import React, { useState } from 'react';
import { IonPage, useIonRouter } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { api } from '../../../lib/api';

const Register: React.FC = () => {
    const router = useIonRouter();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const redirectParam = queryParams.get('redirect');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const passwordStrength = () => {
        const length = formData.password.length;

        if (length >= 10) return 4;
        if (length >= 8) return 3;
        if (length >= 5) return 2;
        if (length >= 3) return 1;
        return 0;
    };

    const handleGoogleSignup = () => {
        window.location.href = '/api/auth/google/';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!acceptedTerms) {
            alert('Você precisa aceitar os termos.');
            return;
        }

        setIsLoading(true);

        try {
            console.log('Cadastro enviado:', formData);

            await api.post('/accounts/register/', {
                nome: formData.fullName,
                email: formData.email,
                password: formData.password
            });
            
            alert('Conta criada com sucesso! Faça login para continuar.');
            if (redirectParam) {
                router.push(`/login?redirect=${encodeURIComponent(redirectParam)}`);
            } else {
                router.push('/login');
            }

        } catch (error) {
            console.error(error);
            alert('Ocorreu um erro ao criar a conta.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <IonPage>
            <main className="flex min-h-screen flex-col md:flex-row">
                {/* LEFT SIDE */}
                <section className="relative hidden w-full flex-col justify-between overflow-hidden bg-[#0F172A] p-8 md:flex md:w-1/2 lg:w-2/5 text-white">

                    {/* Background */}
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(at_0%_0%,rgba(255,69,0,0.15),transparent),radial-gradient(at_100%_100%,rgba(253,139,0,0.1),transparent)]" />

                    {/* Branding */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-lg">
                                <span
                                    className="material-symbols-outlined text-white"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                    bolt
                                </span>
                            </div>

                            <span className="font-headline-md text-headline-md">
                                Chama
                            </span>
                        </div>
                    </div>

                    {/* Hero */}
                    <div className="relative z-10 mb-20 max-w-lg">
                        <h1 className="mb-6 font-display-lg text-display-lg leading-tight">
                            Comece sua jornada
                        </h1>

                        <p className="font-body-lg text-white/70">
                            Centralize suas tarefas e equipes em um único lugar.
                            O Chama transforma caos em progresso com controle
                            absoluto sobre seu fluxo de trabalho.
                        </p>

                        {/* Stats */}
                        <div className="mt-12 grid grid-cols-2 gap-8">
                            <div className="flex flex-col gap-2">
                                <span className="font-bold text-primary text-headline-md">
                                    98%
                                </span>
                                <span className="text-white/60">
                                    Eficiência operacional
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="font-bold text-primary text-headline-md">
                                    +15k
                                </span>
                                <span className="text-white/60">
                                    Times ativos
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="relative z-10">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                            <p className="mb-4 italic text-white/80">
                                "O Chama mudou completamente a forma como
                                gerenciamos nossos projetos corporativos de
                                alta escala."
                            </p>

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 overflow-hidden rounded-full border border-primary/30">
                                    <img
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOo8nt7jYopL2vDcxL_YrvZzotfVS4LD8m3wlZ-mBR8jX1ywrzuJpXHdAg8V76QCBc0drLr4ktDsBauqdYFQymbQ0SAcvshPujcO1iG68jPQGXYDQp2rzBJStA3tXe3JbE5boBtbUHXMOuU7UdhGhCooRqitv5ugN9XzE8m3OJ8ly4R7a_UHy6Nnh2QlT_IYB--Qjs4Q4ioOmOcoECYRmudKppgzrjkpOWzjSwC9VkNf89VEpUMPV1_hw1TzdkS9G7VMIHoTrUTEZI"
                                        alt="Mariana Silva"
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <div>
                                    <p className="font-bold">
                                        Mariana Silva
                                    </p>
                                    <p className="text-sm text-white/40">
                                        Diretora de Operações @ TechCorp
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* RIGHT SIDE */}
                <section className="flex w-full flex-col items-center justify-center bg-surface p-6 md:w-1/2 md:p-8 lg:w-3/5">

                    <div className="w-full max-w-[480px]">

                        {/* Mobile Brand */}
                        <div className="mb-12 flex justify-center md:hidden">
                            <div className="flex items-center gap-2">
                                <span
                                    className="material-symbols-outlined text-3xl text-primary"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                    bolt
                                </span>

                                <span className="font-headline-md text-headline-md text-on-background">
                                    Chama
                                </span>
                            </div>
                        </div>

                        {/* Header */}
                        <div className="mb-10 text-center md:text-left">
                            <h2 className="mb-2 font-headline-lg text-headline-lg text-on-background">
                                Crie sua conta
                            </h2>

                            <p className="font-body-md text-on-surface-variant">
                                Pronto para acelerar sua produtividade?
                                Leva menos de 2 minutos.
                            </p>
                        </div>

                        {/* Google Login */}
                        <button
                            onClick={handleGoogleSignup}
                            className="flex w-full items-center justify-center gap-3 rounded-lg border border-outline-variant bg-white py-3.5 transition-all hover:bg-surface-container-low active:scale-[0.98] shadow-md"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                            </svg>

                            <span>
                                Inscrever-se com Google
                            </span>
                        </button>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-outline-variant" />
                            </div>

                            <div className="relative flex justify-center uppercase">
                                <span className="bg-surface px-4 text-sm text-on-surface-variant/60">
                                    Ou use seu e-mail
                                </span>
                            </div>
                        </div>

                        {/* FORM */}
                        <form
                            className="space-y-6"
                            onSubmit={handleSubmit}
                        >
                            {/* Nome */}
                            <div className="space-y-2">
                                <label>Nome Completo</label>

                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                                        person
                                    </span>

                                    <input
                                        className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-4"
                                        placeholder="Ex: João Silva"
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                fullName: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label>E-mail Corporativo</label>

                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                                        mail
                                    </span>

                                    <input
                                        type="email"
                                        className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-4"
                                        placeholder="nome@empresa.com"
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Senha */}
                            <div className="space-y-2">
                                <label>Senha</label>

                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                                        lock
                                    </span>

                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-12"
                                        placeholder="Mínimo 8 caracteres"
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                password: e.target.value,
                                            })
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword
                                                ? 'visibility_off'
                                                : 'visibility'}
                                        </span>
                                    </button>
                                </div>

                                {/* Password strength */}
                                <div className="mt-2 flex gap-1">
                                    {[1, 2, 3, 4].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1.5 w-1/4 rounded-full ${
                                                passwordStrength() >= level
                                                    ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                                                    : 'bg-outline-variant'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-3 py-2">
                                <input
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) =>
                                        setAcceptedTerms(e.target.checked)
                                    }
                                    className="mt-1 h-4 w-4"
                                />

                                <label className="leading-snug text-on-surface-variant">
                                    Eu concordo com os{' '}
                                    <span className="text-primary hover:underline cursor-pointer">
                                        Termos de Serviço
                                    </span>{' '}
                                    e a{' '}
                                    <span className="text-primary hover:underline cursor-pointer">
                                        Política de Privacidade
                                    </span>.
                                </label>
                            </div>

                            <button 
                                disabled={isLoading}
                                className="w-full rounded-lg bg-primary py-4 text-white transition-all hover:brightness-110 active:scale-[0.98] shadow-md disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                        Processando...
                                    </>
                                ) : (
                                    'Criar conta gratuitamente'
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-10 text-center">
                            <p className="text-on-surface-variant">
                                Já tem uma conta?{' '}
                                <button
                                    type="button"
                                    onClick={() => router.push(redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login')}
                                    className="font-bold text-primary hover:underline"
                                >
                                    Faça login
                                </button>
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </IonPage>
    );
};

export default Register;