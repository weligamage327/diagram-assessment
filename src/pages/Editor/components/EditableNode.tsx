import { useCallback, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import type { AppNode } from '../../../types';
import './EditableNode.css';

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
        <div className={`editable-node-container ${selected ? 'selected' : ''}`}>
            {/* Label Area */}
            <div
                className="editable-node-label"
                onDoubleClick={() => setIsEditing(true)}
            >
                {isEditing ? (
                    <input
                        ref={inputRef}
                        value={label}
                        onChange={(evt) => setLabel(evt.target.value)}
                        onKeyDown={onKeyDown}
                        onBlur={onLabelSave}
                        className="nodrag editable-node-input"
                    />
                ) : (
                    <span className="editable-node-text">{label || 'Node'}</span>
                )}
            </div>

            {/* Handles */}
            {!isInput && (
                <Handle
                    type="target"
                    position={Position.Top}
                    className="editable-node-handle top"
                    isConnectable={isConnectable}
                />
            )}
            {!isOutput && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="editable-node-handle bottom"
                    isConnectable={isConnectable}
                />
            )}
        </div>
    );
}
