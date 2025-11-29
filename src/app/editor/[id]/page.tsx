"use client";

import { TipTapEditor } from "@/components/editor/TiptapEditor";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EditorPage() {
  const params = useParams();
  
  // Vamos ver o que o Next.js está nos entregando
  useEffect(() => {
    console.log("🌍 URL Params recebidos:", params);
  }, [params]);

  // Segurança: Garante que id é uma string (pode vir como array em casos raros)
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  // Se o ID ainda não chegou, mostramos um loading em vez de quebrar o editor
  if (!id) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-orange-500">
        Carregando identificador...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      <TipTapEditor scriptId={decodeURIComponent(id)} />
    </main>
  );
}