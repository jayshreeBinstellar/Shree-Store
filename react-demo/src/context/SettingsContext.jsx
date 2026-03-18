import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { getStoreSettings } from '../services/ShopService';

const SettingsContext = createContext();

export const useSettings = () => {
    return useContext(SettingsContext);
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        store_name: 'Shree Store',
        currency: 'USD',
        currency_symbol: '$',
        tax_percent: 0,
        contact_email: 'support@example.com',
        contact_phone: '+1 234 567 8900',
        address: '123 Main St, City, Country'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await getStoreSettings();
                if (response.status === 'success' && response.settings) {
                    setSettings(response.settings);
                }
            } catch (error) {
                console.error("Failed to fetch store settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const value = useMemo(() => ({
        settings,
        loading
    }), [settings, loading]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
