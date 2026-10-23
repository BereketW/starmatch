'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  className?: string;
  variant?: 'minimal' | 'badge' | 'studio';
}

export function ThemeToggle({ className = '', variant = 'studio' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isObsidian = theme === 'obsidian';

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme polarity between Alabaster and Obsidian"
        aria-pressed={isObsidian}
        className={`inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wider transition-colors duration-200 cursor-pointer ${
          isObsidian
            ? 'text-zinc-400 hover:text-white'
            : 'text-zinc-600 hover:text-zinc-950'
        } ${className}`}
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
        <span>{isObsidian ? 'ALABASTER' : 'OBSIDIAN'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme polarity between Alabaster and Obsidian"
      aria-pressed={isObsidian}
      className={`group relative inline-flex items-center gap-2 px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase transition-all duration-200 cursor-pointer select-none rounded-none border ${
        isObsidian
          ? 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-600 hover:text-white'
          : 'border-zinc-300 bg-zinc-100/90 text-zinc-800 hover:border-zinc-400 hover:text-zinc-950 shadow-xs'
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full transition-colors ${
          isObsidian ? 'bg-amber-400/90 shadow-[0_0_6px_rgba(251,191,36,0.6)]' : 'bg-zinc-900 shadow-[0_0_4px_rgba(0,0,0,0.3)]'
        }`}
      />
      <span className="font-semibold">{isObsidian ? 'OBSIDIAN' : 'ALABASTER'}</span>
      <span className="text-zinc-500 font-mono text-[9px] group-hover:text-zinc-400">
        [ {isObsidian ? 'SWITCH → LIGHT' : 'SWITCH → DARK'} ]
      </span>
    </button>
  );
}
