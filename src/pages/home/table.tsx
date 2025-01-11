
import TimeAgo from "react-timeago";
import useNavigateTo from "@/hooks/useNavigateTo";
import { labelColorMap, LabelType, Task, taskTabs } from "./types";
import { LoadingWrapper, TableSkeleton } from "./loaders";
import { useEffect, useState } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { AssigneeDropdown, LabelDropdown, SortingDropdown } from "./filters";
import TaskModal from "./task-modal";

function highlightSearch(name: string, query: string | null) {
    if (!query) return name;
    const regex = new RegExp(`(${query})`, "i");
    const match = name.match(regex);
    if (!match || match.index === undefined) return name;
    const beforeMatch = name.slice(0, match.index);
    const matchText = match[0];
    const afterMatch = name.slice(match.index + matchText.length);
    return (
        <>
            {beforeMatch}
            <span style={{ background: "yellow" }}>{matchText}</span>
            {afterMatch}
        </>
    );
}

const filterAndSortTasks = (
    tasks: Task[],
    filters: {
        assignee?: string;
        searchQuery?: string;
        label?: LabelType;
    },
    sortOrder?: string
): Task[] => {
    const filteredTasks = tasks.filter((task) => {
        if (!filters.searchQuery && !filters.label && !filters.assignee) {
            return true;
        }

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const searchableFields = [task.name];

            const matchesSearch = searchableFields.some((field) =>
                field?.toLowerCase().includes(query)
            );

            if (!matchesSearch) return false;
        }

        if (filters.label) {
            const hasLabel = task.labels.includes(filters.label);
            if (!hasLabel) return false;
        }

        if (filters.assignee) {
            const hasAssignee = task.assignee === filters.assignee;
            if (!hasAssignee) return false;
        }

        return true;
    });

    if (!sortOrder) return filteredTasks;

    return [...filteredTasks].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();

        return sortOrder === "ASC" ? dateA - dateB : dateB - dateA;
    });

};

function Table({
    activeTab,
    tasks,
    loading,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
}: {
    activeTab: string;
    tasks: Task[];
    loading: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    isFetching: boolean;
    fetchNextPage: () => void;
}) {
    const secondLastLIRef = useInfiniteScroll({
        loading: loading,
        hasNextPage: !!hasNextPage,
        isFetchingNextPage,
        onIntersect: fetchNextPage,
    });

    const [focusedTaskIndex, setFocusedTaskIndex] = useState(0);
    const [taskModalOpen, setTaskModalOpen] = useState(false);

    const { currentValue: searchQuery } = useNavigateTo("search_query");
    const { currentValue: label } = useNavigateTo("label");
    const { currentValue: sortBy } = useNavigateTo("sort_by");
    const { currentValue: assignee } = useNavigateTo("assignee");
    const activeTabLabel = taskTabs.find((tab) => tab.value === activeTab)?.label;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (tasks.length === 0) {
                return;
            }
            if (event.key === "ArrowUp" && !taskModalOpen) {
                setFocusedTaskIndex((prev) => Math.max(0, prev - 1));
            } else if (event.key === "ArrowDown" && !taskModalOpen) {
                setFocusedTaskIndex((prev) => Math.min(filteredAndSortedTasks.length - 1, prev + 1));
            } else if (event.key === "Enter" && !taskModalOpen) {
                console.log('opening')
                setTaskModalOpen(true);
            } else if (event.key === 'ArrowLeft' && taskModalOpen) {
                setFocusedTaskIndex((prev) => Math.max(0, prev - 1));
            } else if (event.key === 'ArrowRight' && taskModalOpen) {
                setFocusedTaskIndex((prev) => Math.min(filteredAndSortedTasks.length - 1, prev + 1));
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [taskModalOpen, tasks.length, focusedTaskIndex]);


    useEffect(() => {
        setFocusedTaskIndex(0);
    }, [activeTab, searchQuery, label, sortBy, assignee]);

    const filteredAndSortedTasks = filterAndSortTasks(
        tasks,
        {
            searchQuery: searchQuery as string,
            label: label as LabelType,
            assignee: assignee as string,
        },
        sortBy as string
    );


    return (
        <div className="p-1 overflow-hidden">
            <div className="rounded-lg border">
                <div className="rounded-t-lg flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="w-full flex items-center justify-between gap-4 text-gray-500 text-sm">
                        <p>
                            Showing "{filteredAndSortedTasks.length} {activeTabLabel}" Tasks
                        </p>
                        <div className="grow flex gap-6 items-center justify-end">
                            <AssigneeDropdown />
                            <LabelDropdown />
                            <SortingDropdown />
                        </div>
                    </div>
                </div>
                <div className="divide-y divide-gray-200">
                    <LoadingWrapper
                        loading={loading}
                        empty={filteredAndSortedTasks.length === 0}
                        skeleton={<TableSkeleton />}
                    >
                        {filteredAndSortedTasks.map((data, index) => (
                            <div
                                style={{
                                    outline:
                                        focusedTaskIndex === index ? "2px solid blue" : "none",
                                }}
                                key={data.id}
                                ref={
                                    filteredAndSortedTasks.length - 2 ===
                                        filteredAndSortedTasks.indexOf(data)
                                        ? secondLastLIRef
                                        : null
                                }
                                className={`px-4 py-4 group hover:bg-gray-50 hover:cursor-pointer`}
                                onClick={() => {
                                    setFocusedTaskIndex(index);
                                    setTaskModalOpen(true);
                                }}
                            >
                                <div className="flex items-center gap-2 ">
                                    <p className={`text-sm text-black group-hover:text-blue-600`}>
                                        {highlightSearch(data.name, searchQuery)}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {data.labels.map((label) => (
                                            <span
                                                key={label}
                                                style={{
                                                    backgroundColor: labelColorMap[label],
                                                }}
                                                className="px-2 py-0.5 text-xs rounded-full text-white"
                                            >
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex mt-[2px] items-center gap-1 text-xs text-muted-foreground">
                                    <span>#{data.id}</span>
                                    <span>
                                        opened <TimeAgo date={data.createdAt} />
                                    </span>
                                    <span>by {data.assignee}</span>
                                </div>
                            </div>
                        ))}
                        {isFetching && isFetchingNextPage ? (
                            <TableSkeleton length={1} />
                        ) : null}
                    </LoadingWrapper>
                </div>
            </div>

            {taskModalOpen && filteredAndSortedTasks.length > 0 && <TaskModal
                open={taskModalOpen}
                tasks={filteredAndSortedTasks}
                activeTaskIndex={focusedTaskIndex}
                setActiveTaskIndex={(index) => setFocusedTaskIndex(index)}
                onOpenChange={(taskModalOpen) => setTaskModalOpen(taskModalOpen)}
            />}
        </div>
    );
}

export default Table;

