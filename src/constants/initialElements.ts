import type { AppNode, AppEdge } from '../types';

export const initialNodes: AppNode[] = [
    {
        id: '1',
        position: { x: 250, y: 100 },
        data: { label: 'Start' },
        type: 'input',
    },
    {
        id: '2',
        position: { x: 250, y: 250 },
        data: { label: 'Process' },
        type: 'default',
    },
    {
        id: '3',
        position: { x: 250, y: 400 },
        data: { label: 'End' },
        type: 'output',
    },
];

export const initialEdges: AppEdge[] = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
];
