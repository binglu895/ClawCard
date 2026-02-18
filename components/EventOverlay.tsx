import React from 'react';
import { GameEvent, Choice, GameState } from '../types';

interface EventOverlayProps {
    event: GameEvent;
    state: GameState;
    onChoice: (choice: Choice) => void;
}

export const EventOverlay: React.FC<EventOverlayProps> = ({ event, state, onChoice }) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background-dark/95 backdrop-blur-3xl animate-in fade-in zoom-in duration-500 p-8">
            <div className="w-full max-w-2xl bg-zinc-900/80 border border-white/10 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

                <div className="relative text-center space-y-8">
                    <div className="space-y-2">
                        <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em] block">Random Encounter (奇遇)</span>
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{event.title}</h2>
                    </div>

                    <p className="text-lg text-zinc-400 leading-relaxed italic px-4">
                        "{event.description}"
                    </p>

                    <div className="space-y-4 pt-4">
                        {event.choices.map((choice, idx) => (
                            <button
                                key={idx}
                                onClick={() => onChoice(choice)}
                                className="w-full group relative p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-primary/50 transition-all text-left flex items-start gap-6"
                            >
                                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm font-black text-zinc-500 group-hover:bg-primary group-hover:text-white transition-colors">
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <div className="space-y-1">
                                    <div className="text-white font-bold text-lg group-hover:text-primary transition-colors">{choice.label}</div>
                                    <div className="text-xs text-zinc-500">{choice.description}</div>
                                </div>

                                <div className="ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-primary">arrow_forward</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
