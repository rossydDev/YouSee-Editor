import {
  FileText,
  Layers,
  MoveRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-gray-200 flex flex-col selection:bg-orange-500/30 overflow-x-hidden">
      {/* --- HEADER --- */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full z-10 relative">
        <div className="flex items-center gap-3 group cursor-default">
          {/* Logo da Coruja */}
          <div className="relative w-10 h-10 shrink-0 transition-transform group-hover:scale-110 duration-300">
            <Image
              src="/logo.png"
              alt="YouSee Logo"
              fill
              className="object-contain drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]"
            />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent tracking-tight">
            YouSee
          </span>
        </div>

        <Link
          href="https://github.com/rossydDev/YouSee-Editor"
          target="_blank"
          className="px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
        >
          Star on GitHub
        </Link>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="flex-1 flex flex-col items-center pt-10 px-6 relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/30 border border-orange-500/30 text-xs text-orange-400 mb-8 animate-fade-in backdrop-blur-sm">
          <Sparkles size={12} />
          <span className="font-medium tracking-wide">
            VERSÃO 1.0 (MVP) DISPONÍVEL
          </span>
        </div>

        {/* Título Principal */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 max-w-5xl text-center leading-[1.1]">
          Roteiros de HQ profissionais <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600">
            sem a complexidade.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 text-center leading-relaxed">
          O primeiro editor Open Source com{" "}
          <span className="text-zinc-200 font-medium">
            paginação visual automática
          </span>
          . Escreva, visualize e exporte para PDF no padrão da indústria.
          Totalmente gratuito.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 items-center flex-col sm:flex-row mb-16 z-20">
          <Link
            href="/dashboard"
            className="group bg-gradient-to-br from-orange-600 to-orange-700 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2 shadow-[0_0_40px_-10px_rgba(234,88,12,0.5)] hover:shadow-[0_0_60px_-10px_rgba(234,88,12,0.6)] hover:-translate-y-1"
          >
            Começar Agora
            <MoveRight className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <span className="text-sm text-zinc-500 font-medium">
            🔒 Local-First (Seus dados ficam no PC)
          </span>
        </div>

        {/* --- APP PREVIEW (MOCKUP) --- */}
        <div className="relative w-full max-w-5xl mx-auto mb-20 group">
          {/* Glow Effect atrás da imagem */}
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>

          {/* Container da Imagem */}
          <div className="relative rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden aspect-video">
            {/* Substitua '/app-preview.png' pelo print real do seu editor */}
            <Image
              src="/app-preview.png"
              alt="Interface do YouSee Editor"
              fill
              className="object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
            />

            {/* Overlay Gradient para suavizar o fundo se a imagem não carregar */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-40 pointer-events-none" />
          </div>
        </div>

        {/* --- FEATURES GRID --- */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl w-full mb-24">
          <FeatureCard
            icon={<Layers className="text-orange-500" />}
            title="Paginação Automática"
            desc="Escreva livremente. O YouSee detecta o fim da folha A4 e cria novas páginas visualmente, igual ao PDF final."
          />
          <FeatureCard
            icon={<FileText className="text-orange-500" />}
            title="PDF Padrão Indústria"
            desc="Exporte com um clique. Formatação Courier Prime, margens corretas e numeração de painéis automática."
          />
          <FeatureCard
            icon={<ShieldCheck className="text-orange-500" />}
            title="Privacidade Total"
            desc="Arquitetura Local-First. Seus roteiros são salvos no navegador e nunca passam por servidores externos."
          />
        </div>
      </main>

      <footer className="py-8 border-t border-zinc-900 text-center text-zinc-600 text-sm bg-zinc-950/50">
        <p>
          © 2025 YouSee Editor. Desenvolvido com 🧡 por{" "}
          <a
            href="https://github.com/rossydDev"
            className="hover:text-orange-500 transition-colors"
          >
            @rossydDev
          </a>
          .
        </p>
      </footer>
    </div>
  );
}

// Pequeno componente auxiliar para os cards
function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-orange-500/30 transition-colors group">
      <div className="w-12 h-12 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-200 mb-2">{title}</h3>
      <p className="text-zinc-400 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}
