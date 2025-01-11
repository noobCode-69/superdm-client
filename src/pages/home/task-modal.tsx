import { Card, CardContent } from "@/components/ui/card";
import { labelColorMap, StatusEnum, Task, taskTabs } from "./types";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/main";
import { Modal } from "@/components/ui/modal";

const TasksPagination = ({
    activeTaskIndex,
    setActiveTaskIndex,
    isBlocked,
}: {
    activeTaskIndex: number;
    setActiveTaskIndex: (index: number) => void;
    isBlocked: (direction: 1 | -1) => boolean;
}) => {
    const increase = () => {
        if (isBlocked(1)) return;
        setActiveTaskIndex(activeTaskIndex + 1);
    };

    const decrease = () => {
        if (isBlocked(-1)) return;
        setActiveTaskIndex(activeTaskIndex - 1);
    };

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        className="text-muted-foreground"
                        onClick={decrease}
                    />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink className="text-muted-foreground">
                        {activeTaskIndex + 1}
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationNext
                        className="text-muted-foreground"
                        onClick={increase}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

function ConfirmDialog({
    open,
    onOpenChange,
    handleStatusChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    handleStatusChange: (comment: string) => void;
}) {
    const [comment, setComment] = useState("");

    return (
        <Modal
            title="Are you sure to change the status ?"
            isOpen={open}
            onClose={() => onOpenChange(false)}
        >
            <Textarea
                placeholder="Add your comment here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full min-h-[150px] resize-none text-sm placeholder:text-sm"
            />
            <div className="mt-5 flex items-center justify-end ">
                <Button variant="link" onClick={() => onOpenChange(false)}>
                    Cancel
                </Button>
                <Button
                    disabled={!comment}
                    variant="destructive"
                    onClick={() => {
                        handleStatusChange(comment);
                    }}
                    className="bg-[#ce2c31]"
                >
                    Confirm
                </Button>
            </div>
        </Modal>
    );
}

const ChangeStatus = ({
    status,
    onStatusChange,
}: {
    status: StatusEnum;
    onStatusChange: (newStatus: StatusEnum) => void;
}) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "1") {
                onStatusChange(StatusEnum.OPEN);
            } else if (event.key === "2") {
                onStatusChange(StatusEnum.IN_PROGRESS);
            } else if (event.key === "3") {
                onStatusChange(StatusEnum.CLOSED);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div className="text-sm border rounded-md">
            {taskTabs.map(({ label, value }) => (
                <button
                    onClick={() => {
                        onStatusChange(value);
                    }}
                    key={value}
                    className={`px-3 py-1 hover:cursor-pointer hover:bg-muted flex flex-col w-full ${value === status ? "bg-muted" : ""
                        }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};

export default function TaskModal({
    onOpenChange,
    tasks,
    activeTaskIndex,
    setActiveTaskIndex,
    open,
}: {
    onOpenChange: (open: boolean) => void;
    tasks: Task[];
    activeTaskIndex: number;
    setActiveTaskIndex: (index: number) => void;
    open: boolean;
}) {
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<StatusEnum | null>(null);

    const updateStatusMutation = useMutation<
        any,
        Error,
        {
            id: number;
            status: StatusEnum;
            comment: string;
        }
    >({
        mutationFn: async (newData) => {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/tasks/update-status`,
                {
                    method: "POST",
                    body: JSON.stringify(newData),
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["count"] });
            setNewStatus(null);
            setConfirmModalOpen(false);
        },
    });

    useEffect(() => {
        setNewStatus(null);
        setConfirmModalOpen(false);
    }, [activeTaskIndex]);

    const isBlocked = (direction: 1 | -1): boolean => {
        console.log(activeTaskIndex, direction)
        if (activeTaskIndex === 0 && direction === -1) return true;
        if (activeTaskIndex === tasks.length - 1 && direction === 1) return true;
        return false;
    };

    const handleStatusChange = (comment: string) => {
        if (!newStatus) return;
        updateStatusMutation.mutate({
            id: tasks[activeTaskIndex].id,
            status: newStatus,
            comment,
        });
    };

    const activeTask = tasks[activeTaskIndex];

    return (
        <>
            <Modal
                title={`#${activeTask.id} ${activeTask.name}`}
                isOpen={open && !confirmModalOpen}
                onClose={() => onOpenChange(false)}
            >
                <div className="mb-5">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                {activeTask.description}
                            </p>
                        </div>

                        <Card className="shadow-none">
                            <CardContent className="grid gap-3 p-[20px]">
                                <div className="grid grid-cols-[100px,1fr] items-center gap-2">
                                    <p className="text-sm text-muted-foreground">Assignee</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{activeTask.assignee}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[100px,1fr] items-center gap-2">
                                    <p className="text-sm text-muted-foreground">Priority</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{activeTask.priority}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[100px,1fr] items-center gap-2">
                                    <p className="text-sm text-muted-foreground">Created</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{activeTask.createdAt}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[100px,1fr] items-center gap-2">
                                    <p className="text-sm text-muted-foreground">Labels</p>
                                    <div className="flex items-center gap-1 flex-wrap">
                                        {activeTask.labels.map((label) => (
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
                                {activeTask.comment && (
                                    <div className="grid grid-cols-[100px,1fr] items-center gap-2">
                                        <p className="text-sm text-muted-foreground">Comment</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">{activeTask.comment}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-[100px,1fr] items-center gap-2">
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <div className="flex items-center gap-2">
                                        <ChangeStatus
                                            status={activeTask.status}
                                            onStatusChange={(newStatus) => {
                                                setConfirmModalOpen(true);
                                                setNewStatus(newStatus);
                                            }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <TasksPagination
                            isBlocked={isBlocked}
                            setActiveTaskIndex={setActiveTaskIndex}
                            activeTaskIndex={activeTaskIndex}
                        />
                    </div>
                </div>
            </Modal>

            {newStatus && confirmModalOpen && (
                <ConfirmDialog
                    handleStatusChange={handleStatusChange}
                    open={confirmModalOpen}
                    onOpenChange={setConfirmModalOpen}
                />
            )}
        </>
    );
}
