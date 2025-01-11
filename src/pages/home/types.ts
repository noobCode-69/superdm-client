export type LabelType = 'bug' | 'feature' | 'doc'

export enum StatusEnum {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    CLOSED = 'CLOSED'
}

export const TaskStatus: Record<StatusEnum, { label: string; value: StatusEnum }> = {
    [StatusEnum.OPEN]: {
        label: 'Open',
        value: StatusEnum.OPEN
    },
    [StatusEnum.IN_PROGRESS]: {
        label: 'In Progress',
        value: StatusEnum.IN_PROGRESS
    },
    [StatusEnum.CLOSED]: {
        label: 'Closed',
        value: StatusEnum.CLOSED
    }
};

export const taskTabs: {
    label: string;
    value: StatusEnum;
}[] = [
        {
            label: TaskStatus[StatusEnum.OPEN].label,
            value: TaskStatus[StatusEnum.OPEN].value,
        },
        {
            label: TaskStatus[StatusEnum.IN_PROGRESS].label,
            value: TaskStatus[StatusEnum.IN_PROGRESS].value,
        },
        {
            label: TaskStatus[StatusEnum.CLOSED].label,
            value: TaskStatus[StatusEnum.CLOSED].value,
        },
    ];

export interface Task {
    id: number;
    name: string;
    status: StatusEnum;
    priority: string;
    assignee: string;
    createdAt: string;
    labels: LabelType[];
    description: string;
    comment: string;
}

export interface TaskResponse {
    success: boolean;
    data: {
        tasks: Task[];
        pagination: {
            total: string;
            hasMore: boolean;
            nextPage: number;
        };
    };
}

export interface TaskCountResponse {
    success: boolean;
    data: {
        OPEN: number;
        CLOSED: number;
        IN_PROGRESS: number;
    };
}

export interface AssigneeResponse {
    success: boolean;
    data: {
        assignee: string;
    }[];
}

export const labelColorMap: { [key in LabelType]: string } = {
    bug: '#e54939',
    doc: '#FFA500',
    feature: '#63BA3B',
}