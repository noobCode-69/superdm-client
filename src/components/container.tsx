import { ReactNode } from "react";
const Container = ({ children }: { children: ReactNode }) => {
    return (
        <div className="px-5 pb-10 min-h-screen max-w-[700px] mx-auto">
            {children}
        </div>
    );
};
export default Container;
