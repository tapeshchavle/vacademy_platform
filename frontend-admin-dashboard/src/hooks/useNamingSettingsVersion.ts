import { useEffect, useState } from 'react';

export const NAMING_SETTINGS_UPDATED_EVENT = 'naming-settings-updated';

// Components call this hook to re-render when naming settings change.
// The returned version is bumped whenever NamingSettings page saves or when
// localStorage is updated from another tab.
export const useNamingSettingsVersion = (): number => {
    const [version, setVersion] = useState(0);

    useEffect(() => {
        const bump = () => setVersion((v) => v + 1);
        window.addEventListener(NAMING_SETTINGS_UPDATED_EVENT, bump);
        window.addEventListener('storage', bump);
        return () => {
            window.removeEventListener(NAMING_SETTINGS_UPDATED_EVENT, bump);
            window.removeEventListener('storage', bump);
        };
    }, []);

    return version;
};

export const notifyNamingSettingsUpdated = (): void => {
    window.dispatchEvent(new Event(NAMING_SETTINGS_UPDATED_EVENT));
};
