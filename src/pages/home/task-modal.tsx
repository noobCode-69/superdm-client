import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
} from "@/components/ui/dialog";
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

const TasksPagination = ({
    activeTaskIndex,
    setActiveTaskIndex,
    isBlocked,
}: {
    activeTaskIndex: number;
    setActiveTaskIndex: (index: number) => void;
    isBlocked: () => boolean;
}) => {
    const increase = () => {
        if (isBlocked()) return;
        setActiveTaskIndex(activeTaskIndex + 1);
    };

    const decrease = () => {
        if (isBlocked()) return;
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

function ConfirmDialog({ open, onOpenChange, handleStatusChange }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    handleStatusChange: (comment: string) => void;
}) {
    const [comment, setComment] = useState("")

    return < Dialog open={open} onOpenChange={onOpenChange} >
        <DialogContent className="w-[450px] [&>button]:hidden">
            <DialogHeader className="flex flex-row justify-between items-center">
                <DialogTitle className="text-md font-medium">
                    Are you sure to change the status ?
                </DialogTitle>
            </DialogHeader>
            <Textarea
                placeholder="Add your comment here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full min-h-[150px] resize-none text-sm placeholder:text-sm"
            />

            <DialogFooter>
                <Button variant="link" onClick={() => onOpenChange(false)}>
                    Cancel
                </Button>
                <Button
                    disabled={!comment}
                    variant="destructive"
                    onClick={() => {
                        handleStatusChange(comment)
                    }}
                    className="bg-[#ce2c31]"
                >
                    Confirm
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog >
}





const ChangeStatus = ({
    status,
    onStatusChange
}: {
    status: StatusEnum;
    onStatusChange: (newStatus: StatusEnum) => void;
}) => {


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "1") {
                handleStatusChange(StatusEnum.OPEN);
            } else if (event.key === "2") {
                handleStatusChange(StatusEnum.IN_PROGRESS);
            } else if (event.key === "3") {
                handleStatusChange(StatusEnum.CLOSED);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);


    const handleStatusChange = (newStatus: StatusEnum) => {
        onStatusChange(newStatus);
    }


    return (
        <div className="text-sm border rounded-md">
            {taskTabs.map(({ label, value }) => (
                <button
                    onClick={() => {
                        handleStatusChange(value);
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
}: {
    onOpenChange: (open: boolean) => void;
    tasks: Task[];
    activeTaskIndex: number;
    setActiveTaskIndex: (index: number) => void;
}) {

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<StatusEnum | null>(null);

    const updateStatusMutation = useMutation<any, Error, {
        id: number,
        status: StatusEnum,
        comment: string
    }>({
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
            )
            await response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            queryClient.invalidateQueries({ queryKey: ['count'] })
            setNewStatus(null);
            setConfirmModalOpen(false);
        }
    })

    useEffect(() => {
        setNewStatus(null);
        setConfirmModalOpen(false);
    }, [activeTaskIndex]);


    const isBlocked = (): boolean => {
        return (
            tasks.length === 0 ||
            activeTaskIndex >= tasks.length ||
            activeTaskIndex === 0
        );
    };


    const handleStatusChange = (comment: string) => {
        if (!newStatus) return;
        updateStatusMutation.mutate({
            id: tasks[activeTaskIndex].id,
            status: newStatus,
            comment
        })
    }

    const activeTask = tasks[activeTaskIndex];

    return (
        <>

            <Dialog open={true}>
                <DialogOverlay onClick={() => onOpenChange(false)} />
                <DialogContent style={{
                    display: confirmModalOpen ? "none" : "block"
                }} className="w-[450px] [&>button]:hidden">
                    <DialogHeader className="flex flex-row justify-between items-center">
                        <DialogTitle className="text-md font-medium">
                            #{activeTask.id} {activeTask.name}
                        </DialogTitle>
                    </DialogHeader>
                    <div>
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
                                            <p className="text-sm text-muted-foreground">
                                                Comment
                                            </p>
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
                        </div>
                    </div>

                    <TasksPagination
                        isBlocked={isBlocked}
                        setActiveTaskIndex={setActiveTaskIndex}
                        activeTaskIndex={activeTaskIndex}
                    />
                </DialogContent>
            </Dialog>
            {
                newStatus && confirmModalOpen && <ConfirmDialog handleStatusChange={handleStatusChange} open={confirmModalOpen} onOpenChange={setConfirmModalOpen} />
            }

        </>
    );
}
