import { LayoutGrid, Share2, Trash2 } from 'lucide-react';
import type { DiagramCardProps } from '../../../types';

export const DiagramCard = ({
    diagram,
    currentUserId,
    currentUserEmail,
    onOpen,
    onDelete,
    onShare
}: DiagramCardProps) => {
    const isOwner = diagram.ownerId === currentUserId;
    const sharedRole = !isOwner
        ? diagram.sharedWith?.find(s => s.email === currentUserEmail)?.access || 'view'
        : null;

    return (
        <div
            className="diagram-card"
            onClick={() => onOpen(diagram.id)}
        >
            <div className="diagram-preview">
                <LayoutGrid size={32} />
            </div>
            <div className="diagram-info">
                <div className="diagram-header-row">
                    <h4 className="diagram-name">
                        {diagram.name}
                        {!isOwner && <span className="badge-shared">Shared</span>}
                        {sharedRole === 'view' && <span className="badge-shared viewer">Viewer</span>}
                        {sharedRole === 'edit' && <span className="badge-shared editor">Editor</span>}
                    </h4>
                    <div className="card-actions">
                        {isOwner && (
                            <>
                                <button
                                    className="icon-btn-inline share"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onShare(diagram.id, diagram.name);
                                    }}
                                    aria-label="Share diagram"
                                    title="Share diagram"
                                >
                                    <Share2 size={16} />
                                </button>
                                <button
                                    className="icon-btn-inline delete"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(diagram.id, diagram.name);
                                    }}
                                    aria-label="Delete diagram"
                                    title="Delete diagram"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <p className="diagram-meta">
                    {diagram.nodeCount} nodes • Updated {diagram.updatedAt?.toLocaleDateString()}
                    {!isOwner && diagram.ownerEmail && (
                        <span style={{ display: 'block', marginTop: '4px', fontStyle: 'italic' }}>
                            Shared by {diagram.ownerEmail}
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
};
