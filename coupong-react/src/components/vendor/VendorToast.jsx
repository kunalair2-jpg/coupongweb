const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
const COLORS = {
    success: 'bg-green-900/90 border-green-500/40 text-green-300',
    error: 'bg-red-900/90 border-red-500/40 text-red-300',
    warning: 'bg-yellow-900/90 border-yellow-500/40 text-yellow-300',
    info: 'bg-blue-900/90 border-blue-500/40 text-blue-300',
};

export default function VendorToast({ toasts, dismiss }) {
    return (
        <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-sm text-sm font-medium pointer-events-auto animate-slide-up min-w-[260px] max-w-xs ${COLORS[t.type]}`}
                >
                    <span className="text-base flex-shrink-0">{ICONS[t.type]}</span>
                    <span className="flex-1">{t.message}</span>
                    <button
                        onClick={() => dismiss(t.id)}
                        className="opacity-60 hover:opacity-100 text-xs ml-1"
                    >✕</button>
                </div>
            ))}
        </div>
    );
}
