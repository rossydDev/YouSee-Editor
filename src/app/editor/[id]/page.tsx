"use client";

import { TipTapEditor } from "@/components/editor/TiptapEditor";
import { useParams } from "next/navigation";

export default function EditorPage() {
  // Pega o ID da URL (ex: /editor/123-abc -> id = "123-abc")
  const params = useParams();
  const id = params.id as string;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      {/* Passa o ID para o editor saber onde salvar */}
      <TipTapEditor scriptID={id} />
    </main>
  );
}