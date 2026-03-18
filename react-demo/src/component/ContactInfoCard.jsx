import React from 'react'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'
import EmailIcon from '@mui/icons-material/Email'
import PlaceIcon from '@mui/icons-material/Place'
import { useSettings } from '../context/SettingsContext'

export const ContactInfoCard = ({ type = 'support' }) => {
    const { settings } = useSettings();
    return (
        <div className="space-y-12 py-4">
            <div className="space-y-8">
                <div className="flex items-center gap-6">
                    <div className="bg-indigo-100 p-4 rounded-2xl">
                        <LocalPhoneIcon className="text-indigo-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">Phone Support</h4>
                        <p className="text-gray-600">{settings?.contact_phone || '+1 (555) 000-0000'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="bg-indigo-100 p-4 rounded-2xl">
                        <EmailIcon className="text-indigo-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">Email Us</h4>
                        <p className="text-gray-600">{settings?.contact_email || (type === 'support' ? 'support@grocerystore.com' : 'support@bacola.com')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="bg-indigo-100 p-4 rounded-2xl">
                        <PlaceIcon className="text-indigo-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">Visit Us</h4>
                        <p className="text-gray-600">{settings?.address || (type === 'support' ? '123 Main Street, City, Country 12345' : '123 E-Commerce Way, Digital City, 90210')}</p>
                    </div>
                </div>
            </div>

            {type === 'contact' && (
                <div className="bg-gray-900 p-10 rounded-3xl text-white">
                    <h4 className="text-2xl font-bold mb-4">Customer Support Hours</h4>
                    <div className="space-y-2 opacity-80">
                        <div className="flex justify-between border-b border-white/10 pb-2">
                            <span>Mon - Fri</span>
                            <span>9:00 AM - 8:00 PM</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-2">
                            <span>Saturday</span>
                            <span>10:00 AM - 4:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Sunday</span>
                            <span>Closed</span>
                        </div>
                    </div>
                </div>
            )}

            {type === 'support' && (
                <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100">
                    <h4 className="font-bold text-gray-900 mb-3">Response Time</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li><strong>Normal:</strong> 24-48 hours</li>
                        <li><strong>High:</strong> 12-24 hours</li>
                        <li><strong>Urgent:</strong> 2-4 hours</li>
                    </ul>
                </div>
            )}
        </div>
    )
}
