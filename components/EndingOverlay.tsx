import React from 'react';

interface EndingOverlayProps {
    title: string;
    text: string;
    isTrue: boolean;
    onRestart: () => void;
}

export const EndingOverlay: React.FC<EndingOverlayProps> = ({ title, text, isTrue, onRestart }) => {
    return (
        <div className={`absolute inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 transition-colors duration-1000 overflow-y-auto ${isTrue ? 'bg-primary/20 backdrop-blur-2xl' : 'bg-black/98 backdrop-blur-md'}`}>
            <div className="w-full max-w-3xl py-12 space-y-8 sm:space-y-12 text-center animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="space-y-4">
                    <span className={`text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] block ${isTrue ? 'text-primary' : 'text-zinc-500'}`}>
                        {isTrue ? 'System Breakthrough' : 'The Path Ends'}
                    </span>
                    <h1 className={`text-4xl sm:text-7xl font-black tracking-tighter uppercase ${isTrue ? 'text-white' : 'text-zinc-400'}`}>
                        {title}
                    </h1>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-[3rem] p-6 sm:p-16 space-y-6 sm:space-y-8 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 ${isTrue ? 'bg-primary' : 'bg-zinc-800'}`} />

                    <p className={`text-lg sm:text-2xl leading-relaxed italic ${isTrue ? 'text-white' : 'text-zinc-500'}`}>
                        "{text}"
                    </p>
                </div>

                <button
                    onClick={onRestart}
                    className={`
                        px-10 sm:px-16 py-4 sm:py-6 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl uppercase tracking-widest transition-all active:scale-95
                        ${isTrue ? 'bg-white text-primary shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:bg-zinc-100' : 'bg-zinc-800 text-white hover:bg-zinc-700'}
                    `}
                >
                    Return to Void (轮回)
                </button>
            </div>
        </div>
    );
};
