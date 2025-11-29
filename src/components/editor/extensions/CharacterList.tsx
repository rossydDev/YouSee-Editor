import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

export const CharacterList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Função para selecionar o item na lista
  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item });
    }
  };

  // Permite que o Tiptap controle este componente (Navegação por teclado)
  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex(
          (selectedIndex + props.items.length - 1) % props.items.length
        );
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  // Reseta o índice quando a lista muda
  useEffect(() => setSelectedIndex(0), [props.items]);

  return (
    // Adicionamos 'z-[9999] relative' para garantir que flutue sobre tudo
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden min-w-[180px] p-1 z-[9999] relative">
      {props.items.length ? (
        props.items.map((item: string, index: number) => (
          <button
            key={index}
            className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
              index === selectedIndex
                ? "bg-orange-600 text-white"
                : "text-zinc-300 hover:bg-zinc-800"
            }`}
            onClick={() => selectItem(index)}
          >
            {item}
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-xs text-zinc-500">Sem resultados</div>
      )}
    </div>
  );
});

CharacterList.displayName = "CharacterList";
