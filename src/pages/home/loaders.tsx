import { Skeleton } from "@/components/ui/skeleton"
import { ReactNode } from "react";

export function TableSkeleton({
    length = 20
}: {
    length?: number
}) {
    return (
        <div className="w-full">
            {[...Array(length)].map((_, i) => (
                <div
                    key={i}
                    className="border-b p-4 space-y-2"
                >
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-2/4" />
                        <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export const LoadingWrapper = ({
    children,
    loading,
    skeleton,
    empty,
}: {
    children: ReactNode;
    loading: boolean;
    skeleton: ReactNode;
    empty: boolean;
}) => {
    if (loading) return skeleton;
    if (empty)
        return (
            <div className="flex items-center justify-center text-sm text-center text-muted-foreground min-h-[150px] py-4">
                No tasks found <br /> Try removing some filters
            </div>
        );

    return <>{children}</>;
};