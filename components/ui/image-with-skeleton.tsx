"use client";

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

export interface ImageWithSkeletonProps extends ImageProps {
    /**
     * Optional class applied to the outer div wrapper functioning as the skeleton container.
     * Useful for setting physical boundaries (w, h, rounded) when using layout="fill" or the fill prop on the image.
     */
    wrapperClassName?: string;
}

export function ImageWithSkeleton({
    wrapperClassName,
    className,
    onLoad,
    ...props
}: ImageWithSkeletonProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div
            className={cn(
                "overflow-hidden transition-colors duration-700 ease-in-out",
                props.fill ? "absolute inset-0 flex" : "relative inline-flex",
                !isLoaded ? "bg-gray-200 animate-pulse" : "bg-gray-200/0",
                wrapperClassName
            )}
        >
            <Image
                {...props}
                className={cn(
                    "transition-all duration-700 ease-in-out",
                    isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-md",
                    className
                )}
                onLoad={(e) => {
                    setIsLoaded(true);
                    if (onLoad) {
                        onLoad(e);
                    }
                }}
            />
        </div>
    );
}

export default ImageWithSkeleton;
