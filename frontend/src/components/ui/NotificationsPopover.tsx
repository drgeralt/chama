import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useHistory } from 'react-router-dom';

const NotificationsPopover: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    const history = useHistory();

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await api.get('/notifications/');
            return Array.isArray(data) ? data : (data.results || []);
        },
    });

    const markAsReadMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.post(`/notifications/${id}/read/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const unreadCount = notifications.filter((n: any) => !n.is_read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        // Global WebSocket listener
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
        const wsProtocol = apiUrl.startsWith('https') ? 'wss:' : 'ws:';
        const wsHost = import.meta.env.VITE_API_URL ? new URL(import.meta.env.VITE_API_URL).host : window.location.host;
        const client = new WebSocket(`${wsProtocol}//${wsHost}/ws/tickets/`);

        client.onopen = () => {
            client.send(JSON.stringify({ type: 'authenticate', token }));
        };

        client.onmessage = (message: MessageEvent) => {
            const data = JSON.parse(message.data as string);
            if (data.type === 'new_notification') {
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            }
        };

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            client.close();
        };
    }, [queryClient]);

    const handleNotificationClick = (n: any) => {
        if (!n.is_read) {
            markAsReadMutation.mutate(n.id);
        }
        setIsOpen(false);
        if (n.link) {
            history.push(n.link);
        }
    };

    return (
        <div className="relative" ref={popoverRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors focus:outline-none"
            >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface border border-outline-variant rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] z-50 overflow-hidden flex flex-col max-h-96">
                    <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-lowest">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">Notificações</h3>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {notifications.length > 0 ? (
                            notifications.map((n: any) => (
                                <div 
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`px-4 py-3 border-b border-outline-variant/50 cursor-pointer hover:bg-surface-container-low transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        {!n.is_read && <div className="w-2 h-2 mt-2 bg-primary rounded-full shrink-0"></div>}
                                        <div>
                                            <p className={`text-body-md ${!n.is_read ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}>{n.title}</p>
                                            <p className="text-body-sm text-on-surface-variant mt-1">{n.message}</p>
                                            <p className="text-xs text-on-surface-variant/70 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center">
                                <span className="material-symbols-outlined text-outline text-4xl mb-2">notifications_off</span>
                                <p className="text-body-md text-on-surface-variant">Nenhuma notificação</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPopover;
