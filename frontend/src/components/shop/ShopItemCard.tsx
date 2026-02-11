import { ShopItem, shopService } from '../../services/shop';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

interface Props {
    item: ShopItem;
    userGold: number;
    onPurchase: () => void;
}

export default function ShopItemCard({ item, userGold, onPurchase }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    // Parse effect data to show nicer description if needed, or just use description field.
    // item.effectData is JSON string.

    const canAfford = userGold >= item.price;

    const handleBuy = async () => {
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
        <div className="relative group border border-blue-500/30 bg-gray-900/80 p-4 rounded-lg hover:border-blue-400 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] flex flex-col items-center text-center">
            {/* Holographic corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blue-500 opacity-50"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-blue-500 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-blue-500 opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-blue-500 opacity-50"></div>

            <div className="w-24 h-24 mb-4 bg-black/40 rounded-full flex items-center justify-center overflow-hidden border border-blue-500/20 group-hover:border-blue-400/50 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all">
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-contain filter drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
            </div>

            <h3 className="text-lg font-bold font-rajdhani text-white mb-1 group-hover:text-blue-300">{item.name}</h3>
            <p className="text-xs text-gray-400 font-exo mb-3 h-10 overflow-hidden">{item.description}</p>

            <div className="mt-auto w-full">
                <div className="text-yellow-400 font-bold mb-2 flex items-center justify-center gap-1 font-mono">
                    <span>💰</span> {item.price} G
                </div>

                <button
                    onClick={handleBuy}
                    disabled={!canAfford || isLoading}
                    className={`w-full py-2 px-4 rounded font-bold uppercase text-xs tracking-wider transition-all
                        ${canAfford
                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600"
                        }
                    `}
                >
                    {isLoading ? 'Processing...' : canAfford ? 'Purchase' : 'Need Gold'}
                </button>
            </div>
        </div>
    );
}
