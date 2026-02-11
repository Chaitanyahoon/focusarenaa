import { useState, useEffect } from 'react';
import { shopService, ShopItem } from '../services/shop';
import { useAuthStore } from '../stores/authStore';
import ShopItemCard from '../components/shop/ShopItemCard';
import InventoryModal from '../components/shop/InventoryModal';

export default function ShopPage() {
    const [items, setItems] = useState<ShopItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user, fetchProfile } = useAuthStore();
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Fetch items
            const shopItems = await shopService.getShopItems();
            setItems(shopItems);

            // Refresh User to get latest Gold
            await fetchProfile();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="p-6 h-full overflow-y-auto custom-scrollbar relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-rajdhani text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 filter drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">
                        SYSTEM SHOP
                    </h1>
                    <p className="text-gray-400 font-exo text-sm mt-1">
                        Purchase items to aid in your growth, Hunter.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Gold Display */}
                    <div className="px-4 py-2 bg-black/40 border border-yellow-500/30 rounded flex items-center gap-2 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                        <span className="text-xl">💰</span>
                        <span className="font-mono text-xl font-bold text-yellow-400">{user?.gold ?? 0}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-widest ml-1">Gold</span>
                    </div>

                    {/* Inventory Button */}
                    <button
                        onClick={() => setIsInventoryOpen(true)}
                        className="px-4 py-2 bg-blue-600/20 text-blue-300 font-bold border border-blue-500/50 rounded hover:bg-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all font-mono"
                    >
                        INVENTORY
                    </button>
                </div>
            </div>

            {/* Shop Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64 text-blue-400 animate-pulse">
                    Accessing System Store...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map(item => (
                        <ShopItemCard
                            key={item.id}
                            item={item}
                            userGold={user?.gold ?? 0}
                            onPurchase={loadData}
                        />
                    ))}
                </div>
            )}

            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

            {/* Modals */}
            <InventoryModal
                isOpen={isInventoryOpen}
                onClose={() => setIsInventoryOpen(false)}
                userId={user?.id || 0}
            />
        </div>
    );
}
