"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona imediatamente para o "Ambiente de Trabalho"
    router.push("/editor");
  }, [router]);

  return (
    <div className="h-screen w-full bg-zinc-950 flex items-center justify-center draggable">
      <Loader2 className="animate-spin text-orange-500" size={32} />
    </div>
  );
}
