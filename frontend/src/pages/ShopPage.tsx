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
    const [ownedThemes, setOwnedThemes] = useState<string[]>(['blue']);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [shopItems, themes] = await Promise.all([
                shopService.getShopItems(),
                shopService.getOwnedThemes()
            ]);
            setItems(shopItems);
            setOwnedThemes(themes);

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

    // Helper to check if a theme item is owned
    const isThemeOwned = (item: ShopItem): boolean => {
        if (item.type !== 'Theme') return false;
        try {
            const data = JSON.parse(item.effectData);
            return ownedThemes.includes(data.theme);
        } catch {
            return false;
        }
    };

    return (
        <div className="p-6 h-full overflow-y-auto custom-scrollbar relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 md:gap-0">
                <div>
                    <h1 className="text-3xl font-bold font-rajdhani text-transparent bg-clip-text bg-gradient-to-r from-system-blue to-purple-500 filter drop-shadow-[0_0_5px_rgba(var(--color-system-blue-rgb),0.5)]">
                        SYSTEM SHOP
                    </h1>
                    <p className="text-gray-400 font-exo text-sm mt-1">
                        Purchase themes and items to customize your system, Hunter.
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    {/* Gold Display */}
                    <div className="px-4 py-2 bg-black/40 border border-system-gold/30 rounded flex items-center gap-2 shadow-[0_0_10px_rgba(255,215,0,0.1)]">
                        <span className="text-xl">💰</span>
                        <span className="font-mono text-xl font-bold text-system-gold">{user?.gold ?? 0}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-widest ml-1">Gold</span>
                    </div>

                    {/* Inventory Button */}
                    <button
                        onClick={() => setIsInventoryOpen(true)}
                        className="px-4 py-2 bg-system-blue/20 text-system-blue font-bold border border-system-blue/50 rounded hover:bg-system-blue/30 hover:shadow-[0_0_15px_rgba(var(--color-system-blue-rgb),0.3)] transition-all font-mono"
                    >
                        INVENTORY
                    </button>
                </div>
            </div>

            {/* Theme Crystals Section */}
            {!isLoading && (
                <>
                    <h2 className="text-lg font-bold font-rajdhani text-gray-300 mb-4 flex items-center gap-2">
                        <span className="text-system-blue">◆</span> THEME CRYSTALS
                        <span className="text-xs text-gray-600 font-mono ml-2">Unlock new system themes</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                        {items.filter(i => i.type === 'Theme').map(item => (
                            <ShopItemCard
                                key={item.id}
                                item={item}
                                userGold={user?.gold ?? 0}
                                onPurchase={loadData}
                                isOwned={isThemeOwned(item)}
                            />
                        ))}
                    </div>

                    <h2 className="text-lg font-bold font-rajdhani text-gray-300 mb-4 flex items-center gap-2">
                        <span className="text-system-blue">◆</span> SPECIAL ITEMS
                        <span className="text-xs text-gray-600 font-mono ml-2">Rare goods & utilities</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.filter(i => i.type !== 'Theme').map(item => (
                            <ShopItemCard
                                key={item.id}
                                item={item}
                                userGold={user?.gold ?? 0}
                                onPurchase={loadData}
                            />
                        ))}
                    </div>
                </>
            )}

            {isLoading && (
                <div className="flex justify-center items-center h-64 text-system-blue animate-pulse">
                    Accessing System Store...
                </div>
            )}

            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-system-blue/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

            {/* Modals */}
            <InventoryModal
                isOpen={isInventoryOpen}
                onClose={() => setIsInventoryOpen(false)}
            />
        </div>
    );
}
