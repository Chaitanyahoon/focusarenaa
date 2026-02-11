import { HTMLAttributes } from 'react';

// Simple class merger if utility is missing
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> { }

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-gray-700/50", className)}
            {...props}
        />
    );
}
