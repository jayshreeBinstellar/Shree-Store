
import React, { useState, useEffect } from 'react';
import * as AdminService from '../../services/AdminService';
import SettingsPortal from '../../components/admin/SettingsPortal';
import { toast } from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { useSettings } from '../../context/settingContext';



const Settings = () => {
    const [updating, setUpdating] = useState(false);
    const { settings, loading: isContextLoading, setSettings: setGlobalSettings } = useSettings();
    const [localSettings, setLocalSettings] = useState(null);

    useEffect(() => {
        if (!isContextLoading && settings && !localSettings) {
            setLocalSettings(settings);
        }
    }, [isContextLoading, settings, localSettings]);

    const handleUpdateSettings = async (currentSettings) => {
        try {
            setUpdating(true);
            await AdminService.updateSettings(currentSettings || localSettings);
            if (setGlobalSettings) setGlobalSettings(currentSettings || localSettings);
            toast.success("Settings updated successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update settings");
        } finally {
            setUpdating(false);
        }
    };

    if (isContextLoading || !localSettings) return <Loader />;

    return (
        <SettingsPortal
            settings={localSettings}
            setSettings={setLocalSettings}
            onUpdateSettings={() => handleUpdateSettings(localSettings)}
            updating={updating}
        />
    );
};

export default Settings;
