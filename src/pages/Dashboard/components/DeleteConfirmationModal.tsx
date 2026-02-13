import { X, Loader2 } from 'lucide-react';
import '../Dashboard.css';
import type { DeleteConfirmationModalProps } from '../../../types';

export const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    isDeleting = false
}: DeleteConfirmationModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Delete Diagram</h3>
                    <button className="modal-close" onClick={onClose} disabled={isDeleting}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    <p>
                        Are you sure you want to delete <span className="highlight-text">"{itemName}"</span>?
                    </p>
                    <p className="modal-warning">This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                    <button
                        className="modal-btn secondary"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        className="modal-btn danger"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="animate-spin" size={16} style={{ marginRight: '8px' }} />
                                Deleting...
                            </>
                        ) : (
                            'Delete'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
