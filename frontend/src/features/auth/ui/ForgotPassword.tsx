import React from 'react';
import { IonPage } from '@ionic/react';

const ForgotPassword: React.FC = () => {
  return (
    <IonPage>
      <main className="flex min-h-screen flex-col md:flex-row bg-surface">
        <section className="hidden md:flex md:w-5/12 bg-[#0F172A] relative overflow-hidden flex-col justify-between p-12 lg:p-20 text-white">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_0%_0%,rgba(255,69,0,0.15),transparent),radial-gradient(circle_at_100%_100%,rgba(253,139,0,0.1),transparent)]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg shadow-lg">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              </div>
              <span className="font-headline-md text-headline-md tracking-tight">Chama</span>
            </div>
            <h1 className="font-display-lg text-display-lg leading-tight mb-6">Recupere seu acesso</h1>
            <p className="font-body-lg text-body-lg text-surface-variant/80 max-w-md">
              Mantenha o fluxo de suas tarefas protegido. Nossa autenticação garante que sua produtividade nunca seja interrompida.
            </p>
          </div>
        </section>

        <main className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 bg-surface-container-lowest">
          <div className="w-full max-w-md">
            <div className="mb-10 text-center md:text-left">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Esqueceu a senha?</h2>
              <p className="font-body-md text-on-surface-variant">Insira o e-mail associado à sua conta e enviaremos um link.</p>
            </div>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">E-mail corporativo</label>
                <input className="w-full pl-4 py-4 bg-white border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20" type="email" placeholder="nome@empresa.com" required />
              </div>
              <button className="w-full bg-primary text-white font-headline-sm py-4 rounded-lg hover:bg-[#FF8C00] transition-all">
                Enviar link de recuperação
              </button>
            </form>
            <div className="mt-8 text-center">
              <a href="/login" className="inline-flex items-center gap-2 font-semibold text-primary hover:underline">
                <span className="material-symbols-outlined">keyboard_backspace</span>
                Voltar para o login
              </a>
            </div>
          </div>
        </main>
      </main>
    </IonPage>
  );
};
export default ForgotPassword;