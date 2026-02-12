import { useCallback, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import type { AppNode } from '../../types';

export function EditableNode({ id, data, isConnectable, type, selected }: NodeProps<AppNode>) {
    const { updateNodeData } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const [color, setColor] = useState(data.color || '#ffffff');
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync local state
    useEffect(() => {
        setLabel(data.label);
        setColor(data.color || '#ffffff');
    }, [data.label, data.color]);

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

    const onColorChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = evt.target.value;
        setColor(newColor);
        updateNodeData(id, { color: newColor });
    }, [id, updateNodeData]);

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
            {/* Header (Label) */}
            <div
                style={styles.header}
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
                            fontSize: '12px',
                            fontWeight: 'bold',
                            border: '1px solid #ccc',
                            borderRadius: '2px',
                            padding: '1px 4px',
                            color: '#334155',
                        }}
                    />
                ) : (
                    <span style={styles.headerLabel}>{label || 'Node'}</span>
                )}
            </div>

            {/* Body (Color Picker) */}
            <div style={styles.body}>
                <div style={styles.pickerWrapper}>
                    <input
                        type="color"
                        value={color}
                        onChange={onColorChange}
                        style={styles.colorInput}
                    />
                    <div style={{ ...styles.colorPreview, backgroundColor: color }} />
                </div>

                <span style={styles.hexLabel}>{color}</span>
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
        borderRadius: '8px',
        backgroundColor: '#fff',
        // Border set dynamically in component
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        fontFamily: 'sans-serif',
        overflow: 'hidden',
        position: 'relative' as const,
        transition: 'all 0.15s ease-in-out',
    },
    header: {
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        padding: '8px 12px',
        cursor: 'text',
        minHeight: '32px',
        display: 'flex',
        alignItems: 'center',
    },
    headerLabel: {
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase' as const,
        color: '#334155',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    body: {
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    pickerWrapper: {
        position: 'relative' as const,
        width: '30px',
        height: '30px',
        cursor: 'pointer',
    },
    colorInput: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
        cursor: 'pointer',
    },
    colorPreview: {
        width: '100%',
        height: '100%',
        borderRadius: '6px',
        border: '1px solid #cbd5e1',
        pointerEvents: 'none' as const,
    },
    hexLabel: {
        fontSize: '14px',
        color: '#475569',
        fontWeight: 500,
        fontFamily: 'monospace',
    },
    handle: {
        width: '10px',
        height: '10px',
        backgroundColor: '#94a3b8',
    }
};
