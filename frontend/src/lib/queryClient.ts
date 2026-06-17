import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false, // Since we use WebSockets, no need to refetch aggressively
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
        },
    },
});
