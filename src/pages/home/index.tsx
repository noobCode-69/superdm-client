import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Container from "@/components/container";
import useNavigateTo from "@/hooks/useNavigateTo";
import Search from "./search";
import { TaskCountResponse, TaskResponse, TaskStatus, taskTabs } from "./types";
import Table from "./table";
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { SocialButtons } from "./social";


const HomePage = () => {
    const { navigateTo, currentValue: activeTab } = useNavigateTo(
        "active_tab",
        TaskStatus.OPEN.value
    );

    const { data: taskCountData } = useQuery<TaskCountResponse>({
        queryKey: ["count"],
        queryFn: async () => {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/tasks/status-count`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
            const data = await response.json();
            return data
        }
    })

    const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading, isError } = useInfiniteQuery<TaskResponse>({
        queryKey: ["tasks", activeTab],
        initialPageParam: 1,
        queryFn: async ({ pageParam }) => {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/tasks/get`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status: activeTab,
                        page: pageParam,
                    }),
                }
            )
            const data = await response.json();
            return data
        },
        getNextPageParam: (lastPage) => {
            return lastPage.data.pagination.nextPage
        },

    })


    if (isError) {
        return (
            <Container>
                <div className="py-10">
                    <h1 className="text-2xl font-bold text-red-500">Error</h1>
                    <p className="text-gray-500">An error occurred while fetching data</p>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="space-y-4">
                <Tabs value={activeTab || TaskStatus.OPEN.value}>
                    <div className="pt-10 pb-5 px-1 sticky top-0 z-10 bg-white flex justify-between items-center space-x-3">
                        <TabsList>
                            {taskTabs.map(({ label, value }) => (
                                <TabsTrigger
                                    onClick={() => {
                                        navigateTo(value);
                                    }}
                                    key={value}
                                    value={value}
                                >
                                    {label} {taskCountData?.data[value]}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <Search />
                    </div>
                    <Table
                        tasks={data?.pages.flatMap(page => page.data.tasks) || []}
                        loading={isLoading}
                        activeTab={activeTab as string}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        isFetching={isFetching}
                        fetchNextPage={fetchNextPage}
                    />
                </Tabs>
            </div>
            <SocialButtons />
        </Container>
    );
};

export default HomePage;
