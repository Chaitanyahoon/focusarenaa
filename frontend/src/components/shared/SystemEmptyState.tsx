import type { ReactNode } from 'react';

interface SystemEmptyStateProps {
    eyebrow?: string;
    title: string;
    description: string;
    action?: ReactNode;
    tone?: 'blue' | 'red' | 'gold';
}

const toneClass = {
    blue: 'border-blue-500/20 bg-blue-500/5 text-blue-300',
    red: 'border-red-500/20 bg-red-500/5 text-red-300',
    gold: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-300',
};

export default function SystemEmptyState({
    eyebrow = 'System standby',
    title,
    description,
    action,
    tone = 'blue',
}: SystemEmptyStateProps) {
    return (
        <div className={`system-card rounded-2xl border-dashed p-8 text-center ${toneClass[tone]}`}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-current/20 bg-black/25 shadow-[0_0_26px_rgba(0,0,0,0.25)]">
                <span className="h-3 w-3 rotate-45 border border-current/50 bg-current/10" />
            </div>
            <div className="text-[10px] font-mono uppercase tracking-[0.26em] opacity-60">{eyebrow}</div>
            <h3 className="mt-3 text-2xl font-black tracking-[0.14em] text-white">{title}</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400">{description}</p>
            {action && <div className="mt-6 flex justify-center">{action}</div>}
        </div>
    );
}
