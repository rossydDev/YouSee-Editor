"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllScripts, deleteScript, generateId, Script } from "@/lib/storage";
import { Plus, Trash2, FileText, Clock, Clapperboard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const router = useRouter();

  // Carrega os roteiros ao abrir
  useEffect(() => {
    setScripts(getAllScripts());
  }, []);

  // Cria um novo roteiro e redireciona imediatamente
  const handleCreateNew = () => {
    const newId = generateId();
    router.push(`/editor/${newId}`); // Vamos criar essa rota no próximo passo
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Evita abrir o link ao clicar no lixo
    if (confirm("Tem certeza que deseja excluir este roteiro?")) {
      deleteScript(id);
      setScripts(getAllScripts()); // Atualiza a lista visualmente
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-gray-200 p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <Link href="/" className="flex items-center gap-2 text-orange-500 font-bold text-2xl tracking-tighter hover:opacity-80 transition-opacity">
          <Clapperboard className="w-8 h-8" />
          <span>YouSee</span>
        </Link>
        
        <button
          onClick={handleCreateNew}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20"
        >
          <Plus size={20} />
          Novo Roteiro
        </button>
      </header>

      {/* Grid de Projetos */}
      <main className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Meus Projetos</h1>

        {scripts.length === 0 ? (
          // Estado Vazio (Empty State)
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
            <FileText size={48} className="text-zinc-700 mb-4" />
            <p className="text-zinc-500 text-lg mb-6">Você ainda não tem nenhum roteiro.</p>
            <button
              onClick={handleCreateNew}
              className="text-orange-500 hover:text-orange-400 font-bold underline underline-offset-4"
            >
              Criar o primeiro agora
            </button>
          </div>
        ) : (
          // Lista de Cards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scripts.map((script) => (
              <Link
                key={script.id}
                href={`/editor/${script.id}`}
                className="group relative bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 rounded-xl p-6 transition-all hover:shadow-xl hover:shadow-orange-900/10 hover:-translate-y-1 block"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-zinc-950 rounded-lg text-orange-500 group-hover:text-orange-400 transition-colors">
                    <FileText size={24} />
                  </div>
                  <button
                    onClick={(e) => handleDelete(script.id, e)}
                    className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <h2 className="text-xl font-bold text-gray-100 mb-2 truncate pr-4">
                  {script.title || "Sem Título"}
                </h2>

                <div className="flex items-center gap-2 text-xs text-zinc-500 mt-4">
                  <Clock size={12} />
                  <span>
                    Editado em {new Date(script.lastModified).toLocaleDateString()} às {new Date(script.lastModified).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}