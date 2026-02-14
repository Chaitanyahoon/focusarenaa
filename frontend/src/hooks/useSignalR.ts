import { useState, useEffect } from 'react';
import { HubConnection } from '@microsoft/signalr';
import { signalRService } from '../services/signalr';

export const useSignalR = () => {
    const [connection, setConnection] = useState<HubConnection | null>(null);

    useEffect(() => {
        const checkConnection = () => {
            const conn = signalRService.getConnection();
            if (conn) {
                setConnection(conn);
            } else {
                // Retry closely if connection isn't ready yet (race condition on initial load)
                setTimeout(checkConnection, 500);
            }
        };

        checkConnection();
    }, []);

    return { connection };
};
