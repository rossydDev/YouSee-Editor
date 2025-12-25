import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean; // Se for deletar, o botão fica vermelho
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDestructive = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden"
        role="dialog"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            {isDestructive && (
              <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                <AlertTriangle size={20} />
              </div>
            )}
            <h3 className="font-bold text-zinc-200 text-sm">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6">
          <p className="text-zinc-400 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Rodapé / Ações */}
        <div className="flex justify-end gap-3 p-4 bg-zinc-950/50 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            {cancelText}
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`
                px-4 py-2 text-xs font-bold text-white rounded-lg transition-all shadow-lg
                ${
                  isDestructive
                    ? "bg-red-600 hover:bg-red-700 hover:shadow-red-900/20"
                    : "bg-orange-600 hover:bg-orange-700 hover:shadow-orange-900/20"
                }
            `}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
