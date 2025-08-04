import { PriorityQueue,Queue,Stack } from 'typescript-collections';


type FLNode = {
    id: number,
    lat: number,
    lon: number
};

type FLEdge = {
    distance: number,
    source: number,
    target: number,
    travel_time: number
};

export interface BigFatFile {
    nodes: Array<FLNode>,
    edges: Array<FLEdge>
};

type PathfindResult = {
    processing_order: Array<[FLNode,FLNode]>, 
    path: Array<[FLNode,FLNode]>,
    run_time: number,
    total_weight: number
};

function squaredDistance(source: [number,number], target: [number,number]) {
   const dx = target[0] - source[0]; 
   const dy = target[1] - source[1];
   return dx*dx+dy*dy;
}

export class Graph {
    private adjacencyList: Map<number, Set<[number,number]>>;
    private nodes: Map<number,FLNode>;

    constructor(input: BigFatFile) {
        this.adjacencyList = new Map();
        this.nodes = new Map();
        for (const vertex of input.nodes) {
            this.addVertex(vertex);
        }
        for (const edge of input.edges) {
            this.addEdge(edge);
        }
    }

    private addVertex(vertex: FLNode): void {
        if (!this.adjacencyList.has(vertex.id)) {
            this.adjacencyList.set(vertex.id, new Set());
        }
        if (!this.nodes.has(vertex.id)) {
            this.nodes.set(vertex.id,vertex);
        }
    }

    private addEdge(edge: FLEdge): void {
        this.adjacencyList.get(edge.source)!.add([edge.target,edge.travel_time]);
    }

    private getNeighbors(vertex: FLNode): Set<[number,number]> | undefined {
        return this.adjacencyList.get(vertex.id);
    }

    private findClosestNodes(start: [number,number], end: [number,number]): [FLNode,FLNode] {
        let start_dist = Number.MAX_VALUE;
        let nearest_start = null;
        let end_dist = Number.MAX_VALUE;
        let nearest_end = null;
        for (const [_,node] of this.nodes) {
            const dstart = squaredDistance(start,[node.lat,node.lon]);
            if (dstart < start_dist) {
                start_dist = dstart;
                nearest_start = node;
            } 
            const dend = squaredDistance(end,[node.lat,node.lon]);
            if (dend < end_dist) {
                end_dist = dend;
                nearest_end = node;
            } 
        }
        return [nearest_start!,nearest_end!]; // hopefully its not null ;)
    }

    private getNode(id: number): FLNode {
        return this.nodes.get(id)!;
    }

    pathfindBFS(start: [number,number], end: [number,number]): PathfindResult {
        const processing_order: Array<[FLNode,FLNode]> = [];
        const path: Array<[FLNode,FLNode]> = [];
        let total_weight = 0;

        const visited = new Set<number>();
        const parent = new Map<number,[FLNode,number]>();
        const q = new Queue<[FLNode,FLNode]>(); // (node, parent), for tracking processing order 

        const start_time = performance.now();

        const [start_node, end_node] = this.findClosestNodes(start,end);
        q.enqueue([start_node,start_node]); // start node is its own parent to prevent my LSP from blowing up
        visited.add(start_node.id);

        while (!q.isEmpty()) {
            const [curr,parent_node] = q.dequeue()!;
            processing_order.push([curr,parent_node]);

            const neighbors = this.getNeighbors(curr) ?? [];

            for (const [neighbor,weight] of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    parent.set(neighbor, [curr,weight]);

                    if (neighbor === end_node.id) {
                        // Reconstruct path by walking parents backward
                        let node_id: number = end_node.id;
                        while (node_id) {
                            const temp = parent.get(node_id)!;
                            if (!temp) {
                                break;
                            } else {
                                const [next,weight] = temp;
                                path.push([next,this.getNode(node_id)]);
                                node_id = next.id;
                                total_weight += weight;
                            }
                        }
                        break;
                    }

                    q.enqueue([this.getNode(neighbor),curr]);
                }
            }
        }

        const end_time = performance.now();
        const run_time = end_time-start_time;
        path.reverse();

        return { processing_order, path, run_time, total_weight };
    }

    pathfindDFS(start: [number,number], end: [number,number]): PathfindResult {
        const processing_order: Array<[FLNode,FLNode]> = [];
        const path: Array<[FLNode,FLNode]> = [];
        let total_weight = 0;

        const visited = new Set<number>();
        const parent = new Map<number,[FLNode,number]>();
        const st = new Stack<[FLNode,FLNode]>(); // (node, parent), for tracking processing order 

        const start_time = performance.now();

        const [start_node, end_node] = this.findClosestNodes(start,end);
        st.push([start_node,start_node]); // start node is its own parent to prevent my LSP from blowing up
        visited.add(start_node.id);

        while (!st.isEmpty()) {
            const [curr,parent_node] = st.pop()!;
            processing_order.push([curr,parent_node]);

            const neighbors = this.getNeighbors(curr) ?? [];

            for (const [neighbor,weight] of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    parent.set(neighbor, [curr,weight]);

                    if (neighbor === end_node.id) {
                        // Reconstruct path by walking parents backward
                        let node_id: number = end_node.id;
                        while (node_id) {
                            const temp = parent.get(node_id)!;
                            if (!temp) {
                                break;
                            } else {
                                const [next,weight] = temp;
                                path.push([next,this.getNode(node_id)]);
                                node_id = next.id;
                                total_weight += weight;
                            }
                        }
                        break;
                    }

                    st.push([this.getNode(neighbor),curr]);
                }
            }
        }

        const end_time = performance.now();
        const run_time = end_time-start_time;
        path.reverse();

        return { processing_order, path, run_time, total_weight };
    }
};