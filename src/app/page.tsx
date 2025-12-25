"use client";

import { LandingPage } from "@/components/web/LandingPage"; // Importe a Landing Page
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RootPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Verifica se estamos rodando dentro do Electron
    const checkEnvironment = async () => {
      // @ts-ignore
      const isElectron =
        typeof window !== "undefined" && window.electron?.isDesktop;

      if (isElectron) {
        setIsDesktop(true);
        // Se for Desktop, manda pro Editor
        router.push("/editor");
      } else {
        // Se for Web, fica aqui mesmo (Landing Page)
        setIsDesktop(false);
        setIsChecking(false);
      }
    };

    checkEnvironment();
  }, [router]);

  // Enquanto verifica, mostra loading
  if (isChecking && !isDesktop) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  // Se NÃO for Desktop, mostra a Landing Page de Download
  return <LandingPage />;
}
