import { useState, useEffect } from 'react';
import { shopService, ShopItem } from '../services/shop';
import { useAuthStore } from '../stores/authStore';
import ShopItemCard from '../components/shop/ShopItemCard';
import InventoryModal from '../components/shop/InventoryModal';
import SystemEmptyState from '../components/shared/SystemEmptyState';

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

    const themeItems = items.filter(i => i.type === 'Theme');
    const specialItems = items.filter(i => i.type !== 'Theme');

    return (
        <div className="p-6 h-full overflow-y-auto custom-scrollbar relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 md:gap-0">
                <div>
                    <h1 className="text-3xl font-bold font-rajdhani text-transparent bg-clip-text bg-gradient-to-r from-system-blue to-teal-500 filter drop-shadow-[0_0_5px_rgba(var(--color-system-blue-rgb),0.5)]">
                        SYSTEM SHOP
                    </h1>
                    <p className="text-gray-400 font-exo text-sm mt-1">
                        Purchase themes and items to customize your system, Hunter.
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    {/* Gold Display */}
                    <div className="px-4 py-2 bg-black/40 border border-system-gold/30 rounded flex items-center gap-2 shadow-[0_0_10px_rgba(255,215,0,0.1)]">
                        <span className="h-2.5 w-2.5 rounded-full bg-system-gold shadow-[0_0_12px_rgba(255,215,0,0.45)]" />
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
                        <span className="h-2 w-2 rotate-45 bg-system-blue shadow-[0_0_10px_rgb(var(--color-system-blue-rgb)/0.4)]" /> THEME CRYSTALS
                        <span className="text-xs text-gray-600 font-mono ml-2">Unlock new system themes</span>
                    </h2>
                    {themeItems.length === 0 ? (
                        <SystemEmptyState
                            eyebrow="Vault unavailable"
                            title="No theme crystals stocked."
                            description="The default Shadow Blue system remains active. New cosmetic rewards can be stocked from the backend shop catalog."
                            tone="gold"
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                            {themeItems.map(item => (
                                <ShopItemCard
                                    key={item.id}
                                    item={item}
                                    userGold={user?.gold ?? 0}
                                    onPurchase={loadData}
                                    isOwned={isThemeOwned(item)}
                                />
                            ))}
                        </div>
                    )}

                    <h2 className="text-lg font-bold font-rajdhani text-gray-300 mb-4 flex items-center gap-2">
                        <span className="h-2 w-2 rotate-45 bg-system-blue shadow-[0_0_10px_rgb(var(--color-system-blue-rgb)/0.4)]" /> SPECIAL ITEMS
                        <span className="text-xs text-gray-600 font-mono ml-2">Rare goods & utilities</span>
                    </h2>
                    {specialItems.length === 0 ? (
                        <SystemEmptyState
                            eyebrow="Loot table empty"
                            title="No special items today."
                            description="Theme skins are still the main gold sink. Add rare utilities here when the progression economy grows."
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {specialItems.map(item => (
                                <ShopItemCard
                                    key={item.id}
                                    item={item}
                                    userGold={user?.gold ?? 0}
                                    onPurchase={loadData}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {isLoading && (
                <div className="system-card flex justify-center items-center h-64 rounded-2xl text-system-blue animate-pulse">
                    Accessing System Store...
                </div>
            )}

            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-system-blue/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-600/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

            {/* Modals */}
            <InventoryModal
                isOpen={isInventoryOpen}
                onClose={() => setIsInventoryOpen(false)}
            />
        </div>
    );
}

// aria-label
