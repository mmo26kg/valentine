import { useState, useEffect, useCallback } from "react";

export function useBrowserNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>("default");

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (typeof window !== "undefined" && "Notification" in window) {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result;
        }
        return "denied";
    }, []);

    const sendBrowserNotification = useCallback((title: string, options?: NotificationOptions) => {
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            // Optional: Add icons or other defaults
            const defaultOptions = {
                icon: "/favicon.ico", // Replace with your app icon
                ...options
            };
            return new Notification(title, defaultOptions);
        }
        return null;
    }, []);

    return { permission, requestPermission, sendBrowserNotification };
}
