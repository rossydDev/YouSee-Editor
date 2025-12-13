import { TipTapEditor } from "@/components/editor/TiptapEditor";

// ATENÇÃO: Adicione 'async' na função e tipagem de Promise
export default async function EditorPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  // 1. Precisamos aguardar (await) os parâmetros serem carregados
  const resolvedParams = await params;

  // 2. Agora pegamos o slug do objeto resolvido
  const slug = resolvedParams.slug;

  // 3. Reconstrói o ID/Caminho (juntando as barras e decodificando espaços/%20)
  const scriptId = slug ? decodeURIComponent(slug.join("/")) : undefined;

  return <TipTapEditor scriptId={scriptId || ""} />;
}
