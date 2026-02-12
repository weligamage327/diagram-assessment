import { useCallback } from 'react';
import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import type { AppNode } from '../../types';
import { useAuth } from '../../hooks/useAuth';

export function BaseNode({ id, data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps<AppNode>) {
    const { updateNodeData } = useReactFlow();
    const { userProfile } = useAuth();
    const isViewer = userProfile?.role === 'viewer';

    const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        updateNodeData(id, { label: evt.target.value });
    }, [id, updateNodeData]);

    return (
        <div className={`base-node`}>
            {/* Input Handle */}
            <Handle
                type="target"
                position={targetPosition}
                isConnectable={isConnectable}
                className="base-node-handle"
            />

            {/* Node Content - Always Editable Input */}
            <div className="base-node-content">
                <input
                    id={`text-${id}`}
                    name="text"
                    value={data.label as string}
                    onChange={onChange}
                    disabled={isViewer}
                    className="nodrag"
                    style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        textAlign: 'center',
                        background: 'transparent',
                        color: 'inherit',
                        font: 'inherit',
                        padding: 0,
                        margin: 0,
                        pointerEvents: isViewer ? 'none' : 'all',
                        cursor: isViewer ? 'default' : 'text'
                    }}
                />
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={sourcePosition}
                isConnectable={isConnectable}
                className="base-node-handle"
            />
        </div>
    );
}
