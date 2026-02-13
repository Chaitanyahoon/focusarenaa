import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { shopService, InventoryItem } from '../../services/shop'

interface Props {
    isOpen: boolean
    onClose: () => void
}

export default function InventoryModal({ isOpen, onClose }: Props) {
    const [inventory, setInventory] = useState<InventoryItem[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const loadInventory = async () => {
        setIsLoading(true)
        try {
            const data = await shopService.getInventory()
            setInventory(data)
        } catch (error) {
            console.error('Failed to load inventory:', error)
            toast.error('Failed to load inventory')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            loadInventory()
        }
    }, [isOpen])

    const handleUseItem = async (itemId: number) => {
        try {
            const response = await shopService.useItem(itemId)
            toast.success(response.message || 'Item used successfully')
            loadInventory() // Refresh after use
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to use item')
        }
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-[#0a1120] border border-system-blue/30 p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-6 border-b border-system-blue/20 pb-4">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-2xl font-bold font-rajdhani text-transparent bg-clip-text bg-gradient-to-r from-system-blue to-purple-500"
                                    >
                                        INVENTORY
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                {isLoading ? (
                                    <div className="flex justify-center items-center py-12 text-system-blue animate-pulse">
                                        Loading inventory data...
                                    </div>
                                ) : inventory.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <p>Your inventory is empty.</p>
                                        <p className="text-sm mt-2">Purchase items from the shop to see them here.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {inventory.map((item) => (
                                            <div
                                                key={item.id}
                                                className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex items-center gap-4 hover:border-system-blue/30 transition-all group"
                                            >
                                                <div className="w-12 h-12 bg-black/40 rounded flex items-center justify-center border border-gray-700 shrink-0">
                                                    <img
                                                        src={item.shopItem.imageUrl}
                                                        alt={item.shopItem.name}
                                                        className="w-8 h-8 object-contain"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-white truncate group-hover:text-system-blue transition-colors">
                                                        {item.shopItem.name}
                                                    </h4>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-xs text-gray-400">
                                                            Qty: <span className="text-white font-mono">{item.quantity}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleUseItem(item.shopItemId)}
                                                    className="shrink-0 px-3 py-1.5 bg-system-blue hover:bg-system-blue/80 text-black text-xs font-bold rounded uppercase tracking-wider transition-colors shadow-lg shadow-blue-900/20"
                                                >
                                                    USE
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
