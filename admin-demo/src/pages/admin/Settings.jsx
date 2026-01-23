
import React, { useState, useEffect } from 'react';
import * as AdminService from '../../services/AdminService';
import SettingsPortal from '../../components/admin/SettingsPortal';

const Settings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const data = await AdminService.getSettings();
            if (data.status === "success") setSettings(data.settings);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleUpdateSettings = async (currentSettings) => {
        try {
            await AdminService.updateSettings(currentSettings || settings);
            alert("Settings updated successfully!");
        } catch (err) { console.error(err); }
    };

    if (loading) return (
        <div className="h-96 w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );

    return (
        <SettingsPortal
            settings={settings}
            setSettings={setSettings}
            onUpdateSettings={() => handleUpdateSettings(settings)}
        />
    );
};

export default Settings;
