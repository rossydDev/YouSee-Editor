import Link from "next/link";
import { Clapperboard, Sparkles, MoveRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-gray-200 flex flex-col selection:bg-orange-500/30">
      
      {/* Header Simples */}
      <header className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2 text-orange-500 font-bold text-xl tracking-tighter">
          <Clapperboard className="w-6 h-6" />
          <span>YouSee</span>
        </div>
        <Link 
          href="https://github.com/rossydDev/YouSee-Editor" 
          target="_blank"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          GitHub
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 mt-[-4rem]">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 mb-8 animate-fade-in">
          <Sparkles size={12} className="text-orange-500" />
          <span>Versão 1.0 Disponível (MVP)</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 max-w-4xl">
          Escreva seus roteiros <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
            sem distrações.
          </span>
        </h1>

        <p className="text-lg text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          O YouSee é um editor Open Source focado em alta performance para quadrinistas.
          Paginação automática, modo focado e exportação PDF pronta para impressão.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link 
            href="/editor" 
            className="group bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all flex items-center gap-2 shadow-lg shadow-orange-900/20 hover:shadow-orange-900/40 hover:-translate-y-1"
          >
            Começar a Escrever
            <MoveRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <span className="text-sm text-zinc-500">
            Não requer login • Salva no navegador
          </span>
        </div>
      </main>

      <footer className="p-6 text-center text-zinc-600 text-sm">
        © 2025 YouSee Editor. Desenvolvido por @rossydDev.
      </footer>
    </div>
  );
}