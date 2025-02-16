import { type ComponentProps } from "react";
import { cn } from "../utils/cn";

export function AnimatedPayButton({
    className,
    ...props
}: ComponentProps<"button">) {
    return (
        <button
            className={cn(
                "group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-lg font-medium text-white transition-all duration-300",
                "hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-[1.02]",
                "active:scale-[0.98]",
                "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
                className
            )}
            {...props}
        />
    );
}
