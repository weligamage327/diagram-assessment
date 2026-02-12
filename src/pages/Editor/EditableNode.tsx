import { useCallback, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import type { AppNode } from '../../types';

export function EditableNode({ id, data, isConnectable, type, selected }: NodeProps<AppNode>) {
    const { updateNodeData } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync local state
    useEffect(() => {
        setLabel(data.label);
    }, [data.label]);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const onLabelSave = useCallback(() => {
        updateNodeData(id, { label });
        setIsEditing(false);
    }, [id, label, updateNodeData]);

    const onCancel = useCallback(() => {
        setLabel(data.label);
        setIsEditing(false);
    }, [data.label]);

    const onKeyDown = (evt: React.KeyboardEvent) => {
        if (evt.key === 'Enter') {
            onLabelSave();
        } else if (evt.key === 'Escape') {
            onCancel();
        }
    };

    const isInput = type === 'input';
    const isOutput = type === 'output';

    return (
        <div style={{
            ...styles.nodeContainer,
            border: selected ? '2px solid var(--accent-primary, #3b82f6)' : '1px solid #e2e8f0',
            boxShadow: selected ? '0 0 0 1px var(--accent-primary, #3b82f6), 0 4px 6px -1px rgba(0,0,0,0.1)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
        }}>
            {/* Label Area */}
            <div
                style={styles.labelContainer}
                onDoubleClick={() => setIsEditing(true)}
            >
                {isEditing ? (
                    <input
                        ref={inputRef}
                        value={label}
                        onChange={(evt) => setLabel(evt.target.value)}
                        onKeyDown={onKeyDown}
                        onBlur={onLabelSave}
                        className="nodrag"
                        style={{
                            width: '100%',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: 500,
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: '4px',
                            color: '#334155',
                            backgroundColor: '#fff',
                        }}
                    />
                ) : (
                    <span style={styles.labelText}>{label || 'Node'}</span>
                )}
            </div>

            {/* Handles */}
            {!isInput && (
                <Handle
                    type="target"
                    position={Position.Top}
                    style={{ ...styles.handle, top: '-5px', left: '50%', transform: 'translateX(-50%)' }}
                    isConnectable={isConnectable}
                />
            )}
            {!isOutput && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    style={{ ...styles.handle, bottom: '-5px', left: '50%', transform: 'translateX(-50%)' }}
                    isConnectable={isConnectable}
                />
            )}
        </div>
    );
}

const styles = {
    nodeContainer: {
        width: '150px',
        minHeight: '60px',
        borderRadius: '8px',
        backgroundColor: '#fff',
        // Border set dynamically in component
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        fontFamily: 'sans-serif',
        overflow: 'hidden',
        position: 'relative' as const,
        transition: 'all 0.15s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    labelContainer: {
        width: '100%',
        padding: '10px',
        cursor: 'text',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center' as const,
    },
    labelText: {
        fontSize: '14px',
        fontWeight: 500,
        color: '#334155',
        wordBreak: 'break-word' as const,
        lineHeight: '1.4',
    },
    handle: {
        width: '10px',
        height: '10px',
        backgroundColor: '#94a3b8',
    }
};
