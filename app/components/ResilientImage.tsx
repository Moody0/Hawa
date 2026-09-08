"use client";

import React, { useMemo, useState } from "react";
import Image, { ImageProps } from "next/image";
import { getImageSourceCandidates, IMAGE_PLACEHOLDER_SRC, isValidImageSrc } from "@/lib/image-utils";

interface ResilientImageProps extends Omit<ImageProps, "src" | "alt"> {
    src: string | null | undefined;
    fallbackSrc?: string;
    skeletonClassName?: string;
    showSkeleton?: boolean;
    alt?: string;
}

const ResilientImage = ({
    src,
    fallbackSrc = IMAGE_PLACEHOLDER_SRC,
    alt,
    onError,
    onLoad,
    className,
    skeletonClassName,
    showSkeleton = true,
    ...imgProps
}: ResilientImageProps) => {
    const candidates = useMemo(
        () => getImageSourceCandidates(src, fallbackSrc),
        [fallbackSrc, src]
    );
    const sourceKey = candidates.join("|");
    return (
        <ResilientImageInner
            key={sourceKey}
            candidates={candidates}
            fallbackSrc={fallbackSrc}
            alt={alt}
            onError={onError}
            onLoad={onLoad}
            className={className}
            skeletonClassName={skeletonClassName}
            showSkeleton={showSkeleton}
            imgProps={imgProps}
        />
    );
};

interface ResilientImageInnerProps {
    candidates: string[];
    fallbackSrc: string;
    alt?: string;
    onError?: ImageProps["onError"];
    onLoad?: ImageProps["onLoad"];
    className?: string;
    skeletonClassName?: string;
    showSkeleton?: boolean;
    imgProps: Omit<ImageProps, "src" | "alt">;
}

const ResilientImageInner = ({
    candidates,
    fallbackSrc,
    alt,
    onError,
    onLoad,
    className,
    skeletonClassName,
    showSkeleton = true,
    imgProps,
}: ResilientImageInnerProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const currentSrc = candidates[currentIndex] || fallbackSrc;
    const safeSrc = isValidImageSrc(currentSrc) 
        ? currentSrc 
        : (isValidImageSrc(fallbackSrc) ? fallbackSrc : IMAGE_PLACEHOLDER_SRC);

    const isPriority = Boolean(imgProps.priority);
    const {
        loading,
        priority: _priority,
        preload: requestedPreload,
        fetchPriority,
        ...restImgProps
    } = imgProps;
    const shouldPreload = requestedPreload ?? isPriority;

    return (
        <span className="relative block h-full w-full overflow-hidden">
            {/* Background Skeleton Shimmer */}
            {showSkeleton && (
                <span
                    aria-hidden="true"
                    className={`absolute inset-0 overflow-hidden bg-gray-100 dark:bg-zinc-800 transition-opacity duration-300 ${
                        isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
                    } ${skeletonClassName || ""}`}
                >
                    <span className="image-shimmer absolute inset-0" />
                </span>
            )}

            <Image
                {...restImgProps}
                preload={shouldPreload}
                fetchPriority={shouldPreload ? undefined : fetchPriority}
                {...(isPriority ? {} : { loading: loading || "lazy" })}
                alt={alt || ""}
                src={safeSrc}
                fill
                decoding={imgProps.decoding || "async"}
                // Keep Next.js image optimization enabled for proxy and remote
                // sources. The previous forced opt-out downloaded full-size
                // originals (often hundreds of KB) even for small product cards.
                unoptimized={imgProps.unoptimized}
                sizes={imgProps.sizes || "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"}
                className={`${className || ""} block relative z-10`}
                onLoad={(event) => {
                    setIsLoaded(true);
                    onLoad?.(event);
                }}
                onError={(event) => {
                    setIsLoaded(false);
                    setCurrentIndex((previousIndex) => {
                        if (previousIndex < candidates.length - 1) {
                            return previousIndex + 1;
                        }

                        return previousIndex;
                    });

                    onError?.(event);
                }}
            />
        </span>
    );
};

export default ResilientImage;
