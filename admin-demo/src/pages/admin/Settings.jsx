
import React, { useState, useEffect } from 'react';
import * as AdminService from '../../services/AdminService';
import SettingsPortal from '../../components/admin/SettingsPortal';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';

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
            toast.success("Settings updated successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update settings");
        }
    };

    if (loading) return <Loader />;

    return (
        <SettingsPortal
            settings={settings}
            setSettings={setSettings}
            onUpdateSettings={() => handleUpdateSettings(settings)}
        />
    );
};

export default Settings;
