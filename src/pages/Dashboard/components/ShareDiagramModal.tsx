import { useState, useEffect } from 'react';
import { X, Share2, Shield, Loader2 } from 'lucide-react';
import '../Dashboard.css';
import type { ShareDiagramModalProps } from '../../../types';

export const ShareDiagramModal = ({
    isOpen,
    onClose,
    diagramName,
    onShare
}: ShareDiagramModalProps) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'view' | 'edit'>('view');
    const [isSharing, setIsSharing] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setEmail('');
            setRole('view');
            setIsSharing(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSharing(true);
        try {
            await onShare(email, role);
            onClose();
        } catch (error) {
            console.error('Failed to share diagram:', error);
            // Error handling is done by parent or we could add local error state here
        } finally {
            setIsSharing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Share Diagram</h3>
                    <button className="modal-close" onClick={onClose} disabled={isSharing}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <p style={{ marginBottom: '16px' }}>
                            Share <span className="highlight-text">"{diagramName}"</span> with others.
                        </p>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                Email Address
                            </label>
                            <div className="input-without-icon">
                                <input
                                    type="email"
                                    className="modal-input"
                                    placeholder="user@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                    style={{ paddingLeft: '12px' }}
                                    disabled={isSharing}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                Access Level
                            </label>
                            <div className="role-options">
                                <label className={`role-option ${role === 'view' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="view"
                                        checked={role === 'view'}
                                        onChange={() => setRole('view')}
                                        style={{ display: 'none' }}
                                        disabled={isSharing}
                                    />
                                    <span className="role-icon"><Shield size={16} /></span>
                                    <div className="role-details">
                                        <span className="role-name">Viewer</span>
                                        <span className="role-desc">Can view the diagram</span>
                                    </div>
                                </label>
                                <label className={`role-option ${role === 'edit' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="edit"
                                        checked={role === 'edit'}
                                        onChange={() => setRole('edit')}
                                        style={{ display: 'none' }}
                                        disabled={isSharing}
                                    />
                                    <span className="role-icon"><Share2 size={16} /></span>
                                    <div className="role-details">
                                        <span className="role-name">Editor</span>
                                        <span className="role-desc">Can edit the diagram</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="modal-btn secondary"
                            onClick={onClose}
                            disabled={isSharing}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="modal-btn primary"
                            disabled={isSharing}
                        >
                            {isSharing ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <Share2 size={16} style={{ marginRight: '8px' }} />
                            )}
                            Share
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
