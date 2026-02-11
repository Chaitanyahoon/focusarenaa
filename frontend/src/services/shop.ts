import { api } from './api';

export interface ShopItem {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    type: string;
    effectData: string;
}

export interface InventoryItem {
    id: number;
    userId: number;
    shopItemId: number;
    quantity: number;
    shopItem: ShopItem;
}

export const shopService = {
    getShopItems: async (): Promise<ShopItem[]> => {
        const response = await api.get<ShopItem[]>('/shop/items');
        return response.data;
    },

    getInventory: async (): Promise<InventoryItem[]> => {
        const response = await api.get<InventoryItem[]>('/shop/inventory');
        return response.data;
    },

    buyItem: async (itemId: number): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>(`/shop/buy/${itemId}`);
        return response.data;
    },

    useItem: async (itemId: number): Promise<{ message: string }> => {
        // itemId here is ShopItemId as per backend logic for now? Or InventoryId?
        // Backend logic uses ShopItemId to find in inventory.
        const response = await api.post<{ message: string }>(`/shop/use/${itemId}`);
        return response.data;
    }
};
