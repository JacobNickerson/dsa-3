import { PriorityQueue,Queue,Stack } from 'typescript-collections';


type FLNode = {
    id: number,
    lat: number,
    lon: number
};

interface FLEdge {
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
        let start_dist = Infinity;
        let nearest_start = null;
        let end_dist = Infinity;
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
            processing_order.push([parent_node,curr]);

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
            processing_order.push([parent_node,curr]);

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

    pathfindDijkstra(start: [number,number], end: [number,number]): PathfindResult {
        const processing_order: Array<[FLNode,FLNode]> = [];
        const path: Array<[FLNode,FLNode]> = [];

        const visited = new Set<number>();
        const distance_map = new Map<number,[number,FLNode | null]>(); // node_id: [curr_dist,parent]
        for (const [node_id,_] of this.nodes) {
            distance_map.set(node_id,[Infinity,null]);
        } 
        const comp = (a:[[FLNode,number],FLNode] , b:[[FLNode,number],FLNode]): number => {
            return b[0][1] - a[0][1];
        };
        const pq = new PriorityQueue<[[FLNode,number],FLNode]>(comp); // goofy ahhh typing: [[node,weight],parent] (for tracking processing order)

        const start_time = performance.now();

        const [start_node, end_node] = this.findClosestNodes(start,end);

        distance_map.set(start_node.id,[0,null]);
        pq.enqueue([[start_node,0],start_node]); // start node is its own parent. sue me
    
        while (!pq.isEmpty()) {
            const [top,parent_node] = pq.dequeue()!;
            const [curr,_] = top;
            if (visited.has(curr.id)) {
                continue;
            } else {
                visited.add(curr.id);
            }
            if (curr.id === end_node.id) {
                // Reconstruct path by walking parents backward
                let node_id: number = end_node.id;
                while (node_id) {
                    const [_,parent] = distance_map.get(node_id)!;
                    if (!parent) {
                        break;
                    } else {
                        path.push([this.getNode(node_id),parent]);
                        node_id = parent.id;
                    }
                }
                break;
            }
            processing_order.push([parent_node,curr]);

            const neighbors = this.getNeighbors(curr) ?? [];

            for (const [neighbor,neighbor_weight] of neighbors) {
                const new_weight = distance_map.get(curr.id)![0] + neighbor_weight;
                if (new_weight < distance_map.get(neighbor)![0]) {
                    distance_map.set(neighbor,[new_weight,curr]);
                    pq.enqueue([[this.getNode(neighbor),neighbor_weight],curr]);
                }
            }
        }
        // // Reconstruct path by walking parents backward
        // let node_id: number = end_node.id;
        // while (node_id) {
        //     const [_,parent] = distance_map.get(node_id)!;
        //     if (!parent) {
        //         break;
        //     } else {
        //         path.push([this.getNode(node_id),parent]);
        //         node_id = parent.id;
        //     }
        // }

        const end_time = performance.now();
        const run_time = end_time-start_time;
        path.reverse();

        const total_weight = distance_map.get(end_node.id)![0]; 
        return { processing_order, path, run_time, total_weight };
    }

    // Haversine distance equation, apparently it's used for lat long. Thanks google!
    private distance(a: FLNode, b: FLNode): number {
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const R = 6371e3; // Earth's radius in meters

        const phi_1 = toRad(a.lat);
        const phi_2 = toRad(b.lat);
        const d_phi = toRad(b.lat - a.lat);
        const d_lamb = toRad(b.lon - a.lon);

        const a_term =
            Math.sin(d_phi / 2) ** 2 +
            Math.cos(phi_1) * Math.cos(phi_2) * Math.sin(d_lamb / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a_term), Math.sqrt(1 - a_term));

        return R * c; // in meters
    }

    private makeHeuristic(end_id: number): (node_id: number) => number {
        const end_node = this.nodes.get(end_id)!;

        return (node_id: number): number => {
            const max_speed = 150; // arbitrarily picked, and in km/h because the graph data uses km/h
            const node = this.nodes.get(node_id);
            if (!node) return Infinity;
            return this.distance(node, end_node) / max_speed; // because edge weights are based on travel time and not geographic distance, we can
                                                              // ensure our heuristic overestimates weight by dividing by a "maximum speed" 
        };
    }

    pathfindAStar(start: [number,number], end: [number,number]): PathfindResult {
        const processing_order: Array<[FLNode,FLNode]> = [];
        const path: Array<[FLNode,FLNode]> = [];

        type AStarQueueItem = {
            node_id: number;
            f: number;
            g: number
            parent: FLNode;
        };
        const comp = (a:AStarQueueItem , b:AStarQueueItem): number => {
            return b.f - a.f;
        };
        const open_set = new PriorityQueue<AStarQueueItem>(comp); // goofy ahhh typing: [[node,weight],parent] (for tracking processing order)
        const closed_set = new Set<number>();
        const parent = new Map<number,FLNode | null>();
        const g_score = new Map<number,number>();
        const f_score = new Map<number,number>();
        for (const [node_id,_] of this.nodes) {
            g_score.set(node_id,Infinity);
            f_score.set(node_id,Infinity);
            parent.set(node_id,null);
        }

        const start_time = performance.now();

        const [start_node, end_node] = this.findClosestNodes(start,end);

        const heuristic = this.makeHeuristic(end_node.id);
        g_score.set(start_node.id,0);
        f_score.set(start_node.id, heuristic(start_node.id));
        open_set.enqueue({node_id: start_node.id, g: 0, f: f_score.get(start_node.id)!, parent: start_node});

        while (!open_set.isEmpty()) {
            const curr = open_set.dequeue()!;

            if (closed_set.has(curr.node_id)) {
                continue;
            } else {
                closed_set.add(curr.node_id);
            }
            processing_order.push([curr.parent, this.getNode(curr.node_id)]);
            if (curr.node_id === end_node.id) {
                let path_id = end_node.id;
                while (parent.get(path_id)) {
                    const parent_node = parent.get(path_id)!;
                    path.push([parent_node,this.getNode(path_id)]);
                    path_id = parent_node.id;
                }
                break;
            }

            const neighbors = this.getNeighbors(this.getNode(curr.node_id))!;
            for (const [neighbor_id,weight] of neighbors) {
                const new_g = g_score.get(curr.node_id)! + weight;

                if (new_g < g_score.get(neighbor_id)!) {
                    parent.set(neighbor_id, this.getNode(curr.node_id));
                    g_score.set(neighbor_id, new_g);
                    const f = new_g + heuristic(neighbor_id);
                    f_score.set(neighbor_id, f);
                    open_set.enqueue({ node_id: neighbor_id, g: new_g, f, parent: this.getNode(curr.node_id)});
                }
            }
        }

        const total_weight = g_score.get(end_node.id)!;

        const end_time = performance.now();
        const run_time = end_time-start_time;
        path.reverse();

        return { processing_order, path, run_time, total_weight };
    }
};