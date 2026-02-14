import { ShopItem, shopService } from '../../services/shop';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

interface Props {
    item: ShopItem;
    userGold: number;
    onPurchase: () => void;
    isOwned?: boolean;
}

const THEME_COLORS: Record<string, string> = {
    red: 'bg-red-600 text-red-600',
    purple: 'bg-purple-600 text-purple-600',
    gold: 'bg-yellow-500 text-yellow-500',
    green: 'bg-emerald-500 text-emerald-500',
    orange: 'bg-orange-500 text-orange-500',
    pink: 'bg-pink-500 text-pink-500',
    monochrome: 'bg-gray-100 text-gray-100', // White/Gray Glow
};

export default function ShopItemCard({ item, userGold, onPurchase, isOwned = false }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    const canAfford = userGold >= item.price;
    const isTheme = item.type === 'Theme';

    // Extract theme color from effectData with case-insensitivity
    let themeColor = '';
    if (isTheme) {
        try {
            const data = JSON.parse(item.effectData);
            // Handle both "theme" and "Theme" keys, and normalize value
            const themeKey = (data.theme || data.Theme || '').toLowerCase();
            themeColor = THEME_COLORS[themeKey] || 'bg-slate-700 text-slate-700'; // Fallback color
        } catch {
            themeColor = 'bg-slate-700 text-slate-700';
        }
    }

    const handleBuy = async () => {
        if (isOwned) {
            toast('You already own this!', { icon: '✅' });
            return;
        }
        if (!canAfford) {
            toast.error("Not enough Gold!");
            return;
        }

        setIsLoading(true);
        try {
            await shopService.buyItem(item.id);
            toast.success(`Purchased ${item.name}!`);
            onPurchase(); // Refresh gold/inventory
        } catch (error) {
            console.error(error);
            toast.error("Purchase failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`relative group border ${isOwned ? 'border-emerald-500/40' : 'border-system-blue/30'} bg-gray-900/80 p-4 rounded-lg hover:border-system-blue transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] flex flex-col items-center text-center`}>
            {/* Holographic corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-system-blue opacity-50"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-system-blue opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-system-blue opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-system-blue opacity-50"></div>

            {/* Owned badge */}
            {isOwned && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/50 rounded text-xs font-mono text-emerald-400 font-bold">
                    OWNED
                </div>
            )}

            <div className="w-24 h-24 mb-4 bg-black/40 rounded-full flex items-center justify-center overflow-hidden border border-system-blue/20 group-hover:border-system-blue/50 group-hover:shadow-[0_0_15px_rgba(var(--color-system-blue-rgb),0.5)] transition-all">
                {isTheme ? (
                    <div className={`w-16 h-16 rounded-full ${themeColor} shadow-[0_0_20px_currentColor] animate-pulse`}></div>
                ) : item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-contain filter drop-shadow-[0_0_5px_rgba(var(--color-system-blue-rgb),0.8)]" />
                ) : (
                    <div className="text-4xl">📦</div> // Fallback for non-theme items with no image
                )}
            </div>

            <h3 className="text-lg font-bold font-rajdhani text-white mb-1 group-hover:text-system-blue">{item.name}</h3>
            <p className="text-xs text-gray-400 font-exo mb-3 h-10 overflow-hidden">{item.description}</p>

            <div className="mt-auto w-full">
                <div className="text-system-gold font-bold mb-2 flex items-center justify-center gap-1 font-mono">
                    <span>💰</span> {item.price} G
                </div>

                <button
                    onClick={handleBuy}
                    disabled={isOwned || (!canAfford) || isLoading}
                    className={`w-full py-2 px-4 rounded font-bold uppercase text-xs tracking-wider transition-all
                        ${isOwned
                            ? "bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 cursor-default"
                            : canAfford
                                ? "bg-system-blue hover:bg-system-blue/80 text-black shadow-[0_0_10px_rgba(var(--color-system-blue-rgb),0.5)] hover:shadow-[0_0_15px_rgba(var(--color-system-blue-rgb),0.8)]"
                                : "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600"
                        }
                    `}
                >
                    {isOwned ? '✓ Owned' : isLoading ? 'Processing...' : canAfford ? 'Purchase' : 'Need Gold'}
                </button>
            </div>
        </div>
    );
}
