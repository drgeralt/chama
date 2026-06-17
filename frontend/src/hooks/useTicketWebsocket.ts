import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authStorage } from '../lib/api';

export function useTicketWebsocket() {
    const queryClient = useQueryClient();
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef(0);

    useEffect(() => {
        let isMounted = true;

        const connect = async () => {
            const token = await authStorage.getAccessToken();
            if (!token) return; // Wait for authentication

            const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/tickets/';
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('WebSocket Connected');
                retryCountRef.current = 0; // reset
                // Send authentication payload immediately
                ws.send(JSON.stringify({
                    type: 'authenticate',
                    token: token
                }));
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === 'ticket_updated') {
                        // Sincronizar Cache React Query
                        queryClient.invalidateQueries({ queryKey: ['tickets'] });
                        // Optimistic update could also be done via queryClient.setQueryData if full ticket is sent
                    }
                } catch (error) {
                    console.error('Failed to parse WS message', error);
                }
            };

            ws.onclose = (event) => {
                console.log('WebSocket Disconnected', event.code);
                wsRef.current = null;
                // Avoid reconnecting if component unmounted or auth failed (4000)
                if (isMounted && event.code !== 4000) {
                    const timeout = Math.min(1000 * (2 ** retryCountRef.current), 30000);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        retryCountRef.current += 1;
                        connect();
                    }, timeout);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket Error', error);
                // Handled mostly by onclose
            };

            wsRef.current = ws;
        };

        connect();

        return () => {
            isMounted = false;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [queryClient]);

    return wsRef;
}
