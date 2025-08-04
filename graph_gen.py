import json
import osmnx as ox

def generate_bbox(coord_1: tuple[float,float], coord_2: tuple[float,float]):
    """
    Accepts two tuples representing (lat,long) coordinates
    Creates a tuple (long,lat,long,lat) representing a bounding box created by those two coords
    """
    lat = (max(coord_1[0],coord_2[0]),min(coord_1[0],coord_2[0]))  # (NORTH,SOUTH)
    long = (max(coord_1[1],coord_2[1]),min(coord_1[1],coord_2[1]))  # (EAST,WEST)
    return (long[1],lat[1],long[0],lat[0])

def query_bbox(bbox: tuple[float,float,float,float], filename: str="graph.json") -> str:
    """
    Accepts a tuple of four floats representing a bounding box in order: NSEW
    Returns a string denoting the filename of the json that graph is stored to
    """
    graph = ox.graph_from_bbox(bbox,network_type="drive")

    graph = ox.add_edge_speeds(graph)
    graph = ox.add_edge_travel_times(graph)

    nodes = [
        {"id": n, "lat": data["y"], "lon": data["x"]}
        for n, data in graph.nodes(data=True)
    ]

    edges = [
        {
            "source": u,
            "target": v,
            "distance": data["length"],
            "travel_time": data.get("travel_time", None)
        }
        for u, v, data in graph.edges(data=True)
    ]

    # Save to JSON
    with open(filename, "w") as f:
        json.dump({"nodes": nodes, "edges": edges}, f)

    return filename

def main():
    """
    Main entry point
    """
    FL_bbox = (-88,24,-77,31)
    query_bbox(FL_bbox,"THEGRAPH.json")

if __name__ == "__main__":
    main()