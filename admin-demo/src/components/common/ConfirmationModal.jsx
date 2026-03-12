import React from 'react';
import Modal from './Modal';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ConfirmationModal = ({ 
  isOpen, 
  message = 'Are you sure?', 
  onConfirm, 
  onCancel, 
  title = 'Confirm Action',
  confirmText = 'Yes, Confirm',
  cancelText = 'Cancel',
  confirmSeverity = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onCancel} 
      className="max-w-md rounded-[40px]" 
      title={title}
    >
      <div className="p-0!">
        <div className="text-left">
          <p className="text-lg font-semibold text-gray-900 leading-relaxed">
            {message}
          </p>
          <p className="text-sm text-gray-500 m-0">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3 pt-3">
          <button
            onClick={onConfirm}
            className={`flex-1 p-2 rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 ${
              confirmSeverity === 'danger'
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 '
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'
            }`}
          >
            <CheckIcon className="w-4 h-4" />
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 p-2 rounded-2xl bg-gray-200 font-black text-sm uppercase flex items-center justify-center gap-2"
          >
            <XMarkIcon className="w-4 h-4" />
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;

