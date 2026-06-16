import { DropdownOption } from '@/_components/Dropdown/types';
import { Node } from '@xyflow/react';

export type NodeData = {
    label?: string;
    onOperationChange?: (nodeId: string, selectedOption: DropdownOption) => void;
    selectedValue?: any;
}

export type CustomNode = Node<NodeData, 'cutPieceNode' | 'operationNode'>;