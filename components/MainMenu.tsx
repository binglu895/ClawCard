import React from 'react';

interface MainMenuProps {
    hasSave: boolean;
    onNewGame: () => void;
    onContinue: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ hasSave, onNewGame, onContinue }) => {
    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden font-display">
            {/* Ethereal Smoky Background Effects */}
            <div className="absolute inset-0 opacity-40">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-zinc-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-zinc-800 rounded-full mix-blend-screen filter blur-[120px] animate-pulse delay-75" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary/10 rounded-full mix-blend-screen filter blur-[150px] animate-pulse delay-150" />
            </div>

            <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-1000">
                <h1 className="text-sm font-black text-zinc-500 tracking-[1em] uppercase mb-4 opacity-80">Path of Immortality</h1>
                <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 tracking-widest mb-16 drop-shadow-2xl">
                    飞升 <span className="text-4xl">ASCENSION</span>
                </h2>

                <div className="flex flex-col gap-6 w-64">
                    {hasSave && (
                        <button
                            onClick={onContinue}
                            className="px-8 py-4 bg-white/10 border border-white/20 text-white font-black tracking-widest hover:bg-white hover:text-black transition-all duration-500 rounded-sm"
                        >
                            CONTINUE (继续)
                        </button>
                    )}
                    <button
                        onClick={onNewGame}
                        className="px-8 py-4 bg-transparent border border-zinc-700 text-zinc-400 font-bold tracking-widest hover:border-white hover:text-white transition-all duration-500 rounded-sm"
                    >
                        NEW JOURNEY (新开)
                    </button>
                </div>
            </div>
        </div>
    );
};
