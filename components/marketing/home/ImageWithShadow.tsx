import { cn } from '@/lib/utils'
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton'
import React from 'react'

type TImageWithShadowProps = {
    src: string | import('next/image').StaticImageData,
    alt: string,
    position?: string,
    size?: string,
    shadowPosition: "top-right" | "top-left" | "bottom-right" | "bottom-left"
}

const shadowPositionClasses = {
    "top-right": "-top-4 -right-4",
    "top-left": "-top-4 -left-4",
    "bottom-right": "-bottom-4 -right-4",
    "bottom-left": "-bottom-4 -left-4"
}

const ImageWithShadow = ({ src, alt, position = 'top-0 right-0', size = 'w-[480px] h-[250px]', shadowPosition = 'top-right' }: TImageWithShadowProps) => {

    return (<>
        <div className={cn("absolute bg-shadow-bg rounded-xl z-10 ", size, shadowPositionClasses[shadowPosition])}></div>
        <div className={cn("absolute z-10 rounded-3xl overflow-hidden", size, position)}>
            <ImageWithSkeleton
                src={src}
                alt={alt}
                fill
                className="object-cover"
            />
        </div>
    </>
    )
}

export default ImageWithShadow