import { Toaster, toast, ToastBar } from 'react-hot-toast';

export const SystemToaster = () => {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: 'rgba(5, 9, 20, 0.95)',
                    color: '#E0F2FE',
                    border: '1px solid #00EAFF',
                    padding: '16px',
                    borderRadius: '0px',
                    fontFamily: '"Exo 2", sans-serif',
                    boxShadow: '0 0 15px rgba(0, 234, 255, 0.2)',
                },
            }}
        >
            {(t) => (
                <ToastBar toast={t}>
                    {({ icon, message }) => (
                        <div className="flex items-start gap-3 w-full animate-in slide-in-from-right duration-300">
                            <div className="mt-1">{icon}</div>
                            <div className="flex-1">
                                <div className="text-[10px] text-blue-400 font-display tracking-widest mb-1 uppercase">
                                    System Notification
                                </div>
                                <div className="font-bold text-sm tracking-wide">
                                    {message}
                                </div>
                            </div>
                        </div>
                    )}
                </ToastBar>
            )}
        </Toaster>
    );
};

// Custom toast wrappers that play sound
import { sfx } from '../../utils/sounds';

export const systemToast = {
    success: (msg: string) => {
        sfx.play('notification');
        toast.success(msg, {
            style: { borderLeft: '4px solid #22c55e' },
            iconTheme: { primary: '#22c55e', secondary: '#050914' }
        });
    },
    error: (msg: string) => {
        sfx.play('error');
        toast.error(msg, {
            style: { borderLeft: '4px solid #ef4444' },
            iconTheme: { primary: '#ef4444', secondary: '#050914' }
        });
    },
    info: (msg: string) => {
        sfx.play('notification');
        toast(msg, {
            icon: 'ℹ️',
            style: { borderLeft: '4px solid #3b82f6' }
        });
    },
    levelUp: (level: number) => {
        sfx.play('success');
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#050914] border-2 border-blue-500 shadow-[0_0_30px_#3b82f6] pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <span className="text-3xl">🆙</span>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-display font-bold text-blue-400 tracking-widest">
                                SYSTEM ALERT
                            </p>
                            <p className="mt-1 text-lg font-bold text-white uppercase">
                                Level Up!
                            </p>
                            <p className="mt-1 text-sm text-gray-400">
                                You have reached Level {level}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-blue-500/30">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-blue-400 hover:text-blue-300 focus:outline-none"
                    >
                        DISMISS
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    }
}
