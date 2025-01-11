import { Button } from "@/components/ui/button"
import { Twitter, UserRound } from 'lucide-react'
import { Link } from "react-router-dom"

export function SocialButtons() {
    return (
        <div className="fixed bottom-4 right-4 flex flex-col gap-2">
            <Button asChild size="icon" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="https://www.sohell.dev/" target="_blank" rel="noopener noreferrer">
                    <UserRound className="h-5 w-5" />
                    <span className="sr-only">Portfolio</span>
                </Link>
            </Button>
            <Button asChild size="icon" className="rounded-full bg-primary text-white hover:bg-primary/90">
                <Link to="https://x.com/so_helllll" target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-5 w-5" />
                    <span className="sr-only">Twitter</span>
                </Link>
            </Button>
        </div>
    )
}

