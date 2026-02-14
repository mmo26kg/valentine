import { useCallback, useRef, useState } from "react";

interface LongPressOptions {
    threshold?: number;
    onStart?: () => void;
    onFinish?: () => void;
    onCancel?: () => void;
}

export function useLongPress(
    callback: (e: React.MouseEvent | React.TouchEvent) => void,
    options: LongPressOptions = {}
) {
    const { threshold = 500, onStart, onFinish, onCancel } = options;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const targetRef = useRef<EventTarget | null>(null);

    const start = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            if (e.target !== e.currentTarget && (e.target as HTMLElement).closest("button")) {
                // Prevent long press if touching a button inside
                return;
            }

            if (onStart) onStart();
            targetRef.current = e.target;
            timeoutRef.current = setTimeout(() => {
                callback(e);
                if (onFinish) onFinish();
            }, threshold);
        },
        [callback, threshold, onStart, onFinish]
    );

    const clear = useCallback(
        (e: React.MouseEvent | React.TouchEvent, shouldTriggerClick = true) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
                if (onCancel) onCancel();
            }
        },
        [onCancel]
    );

    return {
        onMouseDown: (e: React.MouseEvent) => start(e),
        onTouchStart: (e: React.TouchEvent) => start(e),
        onMouseUp: (e: React.MouseEvent) => clear(e),
        onMouseLeave: (e: React.MouseEvent) => clear(e, false),
        onTouchEnd: (e: React.TouchEvent) => clear(e),
    };
}
