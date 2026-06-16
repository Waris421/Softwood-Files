import { Handle, NodeProps, Position } from "@xyflow/react";
import { CustomNode } from "./Constants";
import { Layers, Scissors } from "lucide-react";
import { SingleDropdownAsync } from "@/_components/Dropdown/Dropdown";

export type OperationNodeProps = NodeProps<CustomNode>;
export type CutPieceNodeProps = NodeProps<CustomNode>;

export const CutPieceNode = ({ data }: CutPieceNodeProps) => {
    return (
        <div className="card w-64 bg-base-100 shadow-lg border-2 border-primary/30 rounded-lg p-4">
            <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-base-content">
                    {data.label}
                </span>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary" />
        </div>
    )
}

export const OperationNode = ({ id, data }: OperationNodeProps) => {
    return (
        <div className="card w-72 bg-base-100 shadow-xl border border-base-300 rounded-lg p-4">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary" />

            <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-secondary" />
                <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                {data.label}
                </span>
            </div>

            <div className="w-full">
                <SingleDropdownAsync 
                    inputName="Operation" 
                    apiUrl="/api/options/operations?limit=15"
                    widthClass="w-full" 
                    onSelect={(val: any) => data.onOperationChange?.(id, val?.value)}
                    showValue
                />
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary" />
        </div>
    );
}