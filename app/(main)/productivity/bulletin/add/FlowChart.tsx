'use client';

// @ts-expect-error
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useRef, useState } from "react";
import { CustomNode } from "../Constants";
import { addEdge, Background, Connection, Controls, Edge, Position, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import dagre from '@dagrejs/dagre';
import { CutPieceNode, OperationNode } from "../Nodes";
import { THEME } from '@/_components/constants/ui';
import { PlusCircle, Workflow } from 'lucide-react';

const nodeTypes = {
    cutPieceNode: CutPieceNode,
    operationNode: OperationNode,
};

const NODE_WIDTH = 250;
const NODE_HEIGHT = 80;

const getLayoutedElements = (nodes: CustomNode[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: 'TB', nodesep: 70, ranksep: 100 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    let unConnectedCutPieceCount = 0;

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        const isConnected = edges.some(edge => edge.source === node.id || edge.target === node.id);

        let x = nodeWithPosition.x - NODE_WIDTH / 2;
        let y = nodeWithPosition.y - NODE_HEIGHT / 2;

        if (node.type === 'cutPieceNode' && !isConnected) {
            x = unConnectedCutPieceCount * (NODE_WIDTH + 50); 
            y = 0; 
            unConnectedCutPieceCount++;
        }

        return {
            ...node,
            targetPosition: Position.Top,
            sourcePosition: Position.Bottom,
            position: { x, y },
        };
    });

    return { nodes: layoutedNodes, edges };
}

function ProcessFlowContent() {
    const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');
    const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const connectingNodeId = useRef<string | null>(null);
    const { screenToFlowPosition } = useReactFlow();

    //Set dark/light mode based on user's selected
    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setColorMode(isDark ? 'dark' : 'light');

        const observer = new MutationObserver(() => {
            const isDark = document.documentElement.classList.contains('dark');
            setColorMode(isDark ? 'dark' : 'light');
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    const handleOperationChange = useCallback((nodeId: string, selectedOpId: string) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === nodeId) {
                return {
                    ...node,
                    data: { ...node.data, selectedOperationId: selectedOpId },
                };
            }
            return node;
        }));
    }, [setNodes]);

    //Default starting cut pieces
    useEffect(() => {
        const startingPieces = ['Back Panel L', 'Front Panel L', 'Back Panel R', 'Front Panel R', 'Belt', 'Back Pocket L', 'Back Pocket R'];

        const initialNodes: CustomNode[] = startingPieces.map((label, index) => ({
            id: `start-${index}`,
            type: 'cutPieceNode',
            position: { x: 0, y: 0 },
            data: { label: label },
        }));

        const { nodes: layoutedNodes } = getLayoutedElements(initialNodes, []);
        setNodes(layoutedNodes);
    }, [setNodes]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => {
            const nextEdges = addEdge({ ...params, animated: true }, eds);
            setNodes((nds) => getLayoutedElements(nds, nextEdges).nodes);
            return nextEdges;
        }),
        [setEdges, setNodes]
    );

    const onConnectStart = useCallback((_: any, { nodeId }: any) => {
        connectingNodeId.current = nodeId;
    }, []);

    const onConnectEnd = useCallback((event: MouseEvent | TouchEvent) => {
        if (!connectingNodeId.current) return;

        const target = event.target as Element;
        const isPane = target.classList.contains('react-flow__pane');

        if (isPane) {
            const id = `op-${Date.now()}`;

            const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX;
            const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY;
            
            const newNode: CustomNode = {
                id,
                type: 'operationNode',
                position: screenToFlowPosition({ x: clientX, y: clientY }),
                data: { 
                    label: 'New Operation',
                    onOperationChange: (selectedOpId: string) => handleOperationChange(id, selectedOpId)
                }
            }

            const newEdge: Edge = {
                id: `edge-${connectingNodeId.current}-${id}`,
                source: connectingNodeId.current,
                target: id,
                animated: true,
            };

            setNodes((nds) => {
                const updatedNodes = [...nds, newNode];
                setEdges((eds) => {
                    const updatedEdges = [...eds, newEdge];
                    const { nodes: layoutedNodes } = getLayoutedElements(updatedNodes, updatedEdges);
                    return updatedEdges;
                });
                return updatedNodes;
            });
        }

        connectingNodeId.current = null;
    }, [screenToFlowPosition, setEdges, setNodes, handleOperationChange]);

    const addCutPieceNode = () => {
        const name = prompt("Enter Cut Piece Name:", "New Cut Piece");
        if (!name) return;

        const id = `cut-${Date.now()}`;

        const newNode: CustomNode = {
            id,
            type: 'cutPieceNode',
            position: { x: 0, y: 0 }, 
            data: { label: name }
        };

        setNodes((nds) => {
            const { nodes: layoutedNodes } = getLayoutedElements([...nds, newNode], edges);
            return layoutedNodes;
        });
    }
    
    return (
        <div className="relative w-full h-[90vh] border border-base-300 rounded-box bg-base-200 overflow-hidden shadow-inner">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                nodeTypes={nodeTypes}
                colorMode={colorMode}
                fitView
            >
                <div className="absolute bottom-4 right-20 z-10 flex gap-2 p-1 bg-base-100 border border-base-300 rounded-md shadow-md">
                    <button 
                        onClick={addCutPieceNode} 
                        className={THEME.ButtonOutLine}
                        title="Add Cut Piece"
                    >
                        <PlusCircle size={16} />
                        <span className="text-xs font-normal">Add Cut Piece</span>
                    </button>
                </div>
                <Controls position="bottom-right" className="bg-base-100 border border-base-300 shadow-md! rounded-md" />
                <Background gap={16} size={1} />            
            </ReactFlow>
        </div>
    )
}

export default function ProcessFlow() {
    return (
        <ReactFlowProvider>
            <ProcessFlowContent />
        </ReactFlowProvider>
    );
}