import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import DownCaretIcon from "@/components/ui/caret";
import useNavigateTo from "@/hooks/useNavigateTo";
import { useQuery } from "@tanstack/react-query";
import { AssigneeResponse } from "./types";


export const SortingDropdown = () => {
    const { navigateTo, currentValue: sort } = useNavigateTo("sort_by");

    const isActive = (value: string) => {
        return sort === value;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-[5px]">
                <p>Sort</p>
                <DownCaretIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                    checked={isActive("ASC")}
                    onClick={() => {
                        navigateTo("ASC");
                    }}
                >
                    Latest
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={isActive("DESC")}
                    onClick={() => {
                        navigateTo("DESC");
                    }}
                >
                    Oldest
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                    onClick={() => {
                        navigateTo(null);
                    }}
                >
                    Clear
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const LabelDropdown = () => {
    const { navigateTo, currentValue: label } = useNavigateTo("label");

    const isActive = (value: string) => {
        return label === value;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-[5px]">
                <p>Label</p>
                <DownCaretIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                    checked={isActive("bug")}
                    onClick={() => {
                        navigateTo("bug");
                    }}
                >
                    Bug
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={isActive("feature")}
                    onClick={() => {
                        navigateTo("feature");
                    }}
                >
                    Feature
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={isActive("doc")}
                    onClick={() => {
                        navigateTo("doc");
                    }}
                >
                    Doc
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                    onClick={() => {
                        navigateTo(null);
                    }}
                >
                    Clear
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};


export const AssigneeDropdown = () => {
    const { navigateTo, currentValue: label } = useNavigateTo("assignee");

    const { data, isLoading } = useQuery<AssigneeResponse>({
        queryKey: ["assignee"],
        queryFn: async () => {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/tasks/get-assignee`,
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

    const isActive = (value: string) => {
        return label === value;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-[5px]">
                <p>Assignee</p>
                <DownCaretIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <div className="max-h-[300px] overflow-y-auto">
                    {
                        !isLoading && data?.data.map((item) => (
                            <DropdownMenuCheckboxItem
                                key={item.assignee}
                                checked={isActive(item.assignee)}
                                onClick={() => {
                                    navigateTo(item.assignee);
                                }}
                            >
                                {item.assignee}
                            </DropdownMenuCheckboxItem>
                        ))
                    }
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                    onClick={() => {
                        navigateTo(null);
                    }}
                >
                    Clear
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
