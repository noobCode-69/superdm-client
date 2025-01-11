
import useNavigateTo from "@/hooks/useNavigateTo";
import { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command } from "lucide-react";

function Search() {
    const inputRef = useRef<HTMLInputElement>(null)
    const { navigateTo, currentValue: searchQuery } = useNavigateTo('search_query');

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault()
                inputRef.current?.focus()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    return (
        <div className="relative">
            <Input
                ref={inputRef}
                type="text"
                placeholder="Search tasks&hellip;"
                className="pr-10 shadow-none"
                value={searchQuery || ''}
                onChange={(e) => {
                    const value = e.target.value
                    if (!value) {
                        navigateTo(null)
                        return
                    }
                    navigateTo(value)
                }}
            />
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 pointer-events-none"
            >
                <Command className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Command K</span>
            </Button>
        </div>
    )
}

export default Search