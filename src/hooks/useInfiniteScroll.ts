import { useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
    loading: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    onIntersect: () => void;
}

export const useInfiniteScroll = ({
    loading,
    hasNextPage,
    isFetchingNextPage,
    onIntersect
}: UseInfiniteScrollOptions) => {
    const intObserver = useRef<IntersectionObserver | null>(null);

    const lastElementRef = useCallback(
        (element: HTMLElement | null) => {
            if (loading) return;

            if (intObserver.current) intObserver.current.disconnect();

            intObserver.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    !isFetchingNextPage && onIntersect();
                }
            });

            if (element) intObserver.current.observe(element);
        },
        [loading, hasNextPage, isFetchingNextPage, onIntersect]
    );

    return lastElementRef;
};