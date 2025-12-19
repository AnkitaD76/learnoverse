import { useState } from 'react';

/**
 * CONFIRMATION MODAL
 *
 * Generic confirmation dialog for financial operations.
 *
 * DESIGN PRINCIPLES:
 * - Clear action description
 * - Show transaction details
 * - Explicit confirmation (not just "OK")
 * - Warning for irreversible actions
 * - Disabled confirm during pending
 * - Cancel always available
 */
const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    details = [],
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
    isLoading = false,
    requiresExplicitConfirm = false,
}) => {
    const [confirmationText, setConfirmationText] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (requiresExplicitConfirm && confirmationText !== 'CONFIRM') {
            return;
        }
        onConfirm();
    };

    const handleClose = () => {
        if (isLoading) return; // Prevent closing during operation
        setConfirmationText('');
        onClose();
    };

    const isConfirmDisabled =
        isLoading ||
        (requiresExplicitConfirm && confirmationText !== 'CONFIRM');

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div
                className={`modal-content confirmation-modal ${isDestructive ? 'destructive' : ''}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>{title}</h2>
                    {!isLoading && (
                        <button className="close-btn" onClick={handleClose}>
                            ×
                        </button>
                    )}
                </div>

                <div className="modal-body">
                    <p className="confirmation-message">{message}</p>

                    {details.length > 0 && (
                        <div className="confirmation-details">
                            {details.map((detail, index) => (
                                <div key={index} className="detail-row">
                                    <span className="detail-label">
                                        {detail.label}:
                                    </span>
                                    <span className="detail-value">
                                        {detail.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {requiresExplicitConfirm && (
                        <div className="explicit-confirm">
                            <p className="warning-text">
                                ⚠️ This action cannot be undone. Type{' '}
                                <strong>CONFIRM</strong> to proceed.
                            </p>
                            <input
                                type="text"
                                value={confirmationText}
                                onChange={e =>
                                    setConfirmationText(e.target.value)
                                }
                                placeholder="Type CONFIRM"
                                className="confirm-input"
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                    )}

                    {isLoading && (
                        <div className="loading-indicator">
                            <span className="spinner">⟳</span>
                            <span>Processing...</span>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        className="btn btn-secondary"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}`}
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
