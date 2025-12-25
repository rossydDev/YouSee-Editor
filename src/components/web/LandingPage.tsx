import {
  AlignLeft,
  BookOpen,
  Download,
  Github,
  Moon,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-orange-500/30 overflow-x-hidden font-sans">
      {/* --- NAVBAR SIMPLES --- */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Se quiser usar um logo pequeno aqui: */}
          {/* <Image src="/logo.png" width={32} height={32} alt="Logo" /> */}
          <span className="font-bold text-xl tracking-tight">
            YouSee <span className="text-orange-500">Studio</span>
          </span>
        </div>
        <a
          href="https://github.com/rossydDev/YouSee-Editor"
          target="_blank"
          className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <Github size={18} />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </nav>

      {/* --- HERO SECTION (O Impacto Inicial) --- */}
      <main className="max-w-7xl mx-auto px-6 pt-10 pb-24 text-center relative">
        {/* Luz de fundo dramática */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-600/20 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Escreva Roteiros de HQ <br className="hidden md:block" />
          com <span className="text-orange-500">Foco Total</span>.
        </h1>

        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          O editor open-source definitivo para quadrinistas. Formatação
          automática, modo escuro imersivo e organização de séries. Feito para
          quem leva a escrita a sério.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto mb-20">
          {/* LINK DO RELEASE (ATUALIZE QUANDO TIVER) */}
          <a
            href="https://github.com/rossydDev/YouSee-Editor/releases"
            target="_blank"
            className="flex items-center justify-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-orange-900/20 hover:-translate-y-1"
          >
            <Download size={24} />
            Baixar para Windows (x64)
          </a>
        </div>

        {/* --- SCREENSHOT HERO (O Money Shot) --- */}
        <div className="relative w-full max-w-5xl mx-auto aspect-video bg-zinc-900/80 rounded-2xl border border-zinc-800/50 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-1000">
          {/* IMPORTANTE: Substitua o src abaixo pela sua imagem de Screenshot real.
                Coloque a imagem na pasta /public do projeto.
             */}
          <Image
            src="/screenshot.png"
            alt="YouSee Editor Preview"
            fill
            className="object-cover"
            priority
          />
          {/* Gradiente para integrar a imagem ao fundo */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-40"></div>
        </div>
      </main>

      {/* --- FEATURES SECTION (Os Detalhes) --- */}
      <section className="bg-zinc-900/50 py-24 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Tudo o que você precisa para produzir.
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Deixe o Word de lado. O YouSee foi desenhado do zero para entender
              a estrutura de um roteiro de quadrinhos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Moon size={24} className="text-orange-500" />}
              title="Imersão Dark Mode"
              description="Interface escura de alto contraste, pensada para longas sessões de escrita noturna sem cansar a vista."
            />
            <FeatureCard
              icon={<BookOpen size={24} className="text-blue-500" />}
              title="Organização de Séries"
              description="Gerencie múltiplos capítulos e arcos de história em um painel visual estilo estúdio. Adeus arquivos perdidos."
            />
            <FeatureCard
              icon={<AlignLeft size={24} className="text-green-500" />}
              title="Formatação Automática"
              description="Foque na história. O editor cuida da numeração de páginas, painéis e estrutura do roteiro para você."
            />
            <FeatureCard
              icon={<ShieldCheck size={24} className="text-purple-500" />}
              title="Privacidade Local-First"
              description="Seus roteiros são seus. Tudo é salvo diretamente no seu computador. Nada sobe para a nuvem."
            />
          </div>
        </div>
      </section>

      {/* --- SECONDARY CALL TO ACTION --- */}
      <section className="py-24 text-center px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/10 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
        <h2 className="text-4xl font-bold mb-8">
          Comece a escrever sua próxima obra.
        </h2>
        <a
          href="https://github.com/rossydDev/YouSee-Editor"
          target="_blank"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-all border border-zinc-700"
        >
          <Github size={20} />
          Ver Código Fonte no GitHub
        </a>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-8 text-center text-zinc-600 text-sm border-t border-zinc-900 bg-zinc-950">
        <p>Desenvolvido com 🧡 e café. Open Source (MIT License).</p>
        <p className="mt-2">© 2025 YouSee Studio.</p>
      </footer>
    </div>
  );
}

// Componente auxiliar para os cards de feature
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-zinc-950/80 border border-zinc-800/80 p-6 rounded-xl hover:border-orange-500/30 transition-colors group">
      <div className="mb-4 bg-zinc-900/50 w-12 h-12 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
