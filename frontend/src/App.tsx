import { useState, useRef, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import {
  Stack,
  Fab,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  IconButton,
  Drawer,
} from "@mui/material";
import NavigationIcon from "@mui/icons-material/Navigation";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import "./App.css";
import MapOpen from "./components/MapOpen";
import type { FLNode } from "./Graph"
import { Graph } from "./Graph";

function LoadingScreen({
  nodeRef,
  showLoadingScreen,
}: {
  nodeRef: any;
  showLoadingScreen: boolean;
}) {
  return (
    <CSSTransition
      nodeRef={nodeRef}
      in={showLoadingScreen}
      timeout={400}
      classNames="fade-transition"
      unmountOnExit
    >
      <div className="start-screen" ref={nodeRef}>
        <h1>Florida Street Pathfinding Visualizer</h1>
        <h2 style={{ marginTop: "10px" }}>loading...</h2>
      </div>
    </CSSTransition>
  );
}

function MainScreen({
  buttonClick,
  setButtonClick,
  setAlgorithm,
  setStartingCoords,
  setEndingCoords,
  algorithm,
  pathData,
  playAnim,
  setPlayAnim,
  searchOrder,
  playSearchAnim,
  setPlaySearchAnim
}: {
  buttonClick: boolean;
  setButtonClick: any;
  setAlgorithm: any;
  setStartingCoords: any;
  setEndingCoords: any;
  algorithm: any;
  pathData: Array<[FLNode,FLNode]> | null;
  playAnim: boolean;
  setPlayAnim: any;
  searchOrder: Array<[FLNode,FLNode]> | null;
  playSearchAnim: boolean;
  setPlaySearchAnim: any;
}) {
  const [open, setOpen] = useState(false);

  const handleChange = (event: any) => {
    setAlgorithm(event.target.value);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const submit = (formData: any) => {
    if (playAnim) {
      setPlayAnim(false);
      setPlaySearchAnim(false);
    }
    if (formData.get) {
      const selectAlgo = formData.get("select-algorithm"); // clearing previous paths will NOT work without this line!!
      setAlgorithm(selectAlgo);
      setPlayAnim(true);
      setPlaySearchAnim(true);
      setButtonClick(!buttonClick);
    }
  };

  return (
    <div>
      <MapOpen
        pathData={pathData}
        playAnim={playAnim}
        searchOrder={searchOrder}
        playSearchAnim={playSearchAnim}
        setStartCoords={setStartingCoords}
        setEndCoords={setEndingCoords}
      />
      <Fab
        onClick={handleDrawerOpen}
        variant="extended"
        sx={{ position: "absolute", top: 16, left: 64 }}
      >
        <NavigationIcon sx={{ mr: 1 }} />
        Search Path
      </Fab>
      <Drawer
        sx={{
          width: "20%",
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeftIcon />
        </IconButton>
        <form action={submit}>
          <Stack spacing={"5vh"} sx={{ margin: "40px", maxWidth: "300px" }}>
            <FormControl sx={{ m: 1, minWidth: 220 }}>
              <InputLabel id="select-algorithm-label">
                Select Algorithm
              </InputLabel>
              <Select
                name="select-algorithm"
                labelId="select-algorithm-label"
                id="select-algorithm"
                value={algorithm}
                label="Select Algorithm"
                onChange={handleChange}
                required
              >
                <MenuItem value={"A*-Search"}>A* Search</MenuItem>
                <MenuItem value={"Breadth-First"}>
                  Breadth-First Search
                </MenuItem>
                <MenuItem value={"Depth-First"}>Depth-First Search</MenuItem>
                <MenuItem value={"Dijkstra"}>Dijkstra's Algorithm</MenuItem>
              </Select>
            </FormControl>
            <Fab type="submit" onClick={submit} variant="extended">
              <NavigationIcon sx={{ mr: 1 }} />
              Navigate
            </Fab>
          </Stack>
        </form>
      </Drawer>
    </div>
  );
}

function App() {
  const [algorithm, setAlgorithm] = useState("");
  const [showLoadingScreen, setLoadingScreen] = useState(false);
  const [showMainScreen, setMainScreen] = useState(false);
  const [startingCoords, setStartingCoords] = useState<[number, number]>();
  const [endingCoords, setEndingCoords] = useState<[number, number]>();
  const [buttonClick, setButtonClick] = useState(false);
  const nodeRef = useRef(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [runtime, setRuntime] = useState();
  const [weight, setWeight] = useState();
  const graphRef = useRef<Graph | null>(null);
  const [pathData, setPathData] = useState(null);
  const [playAnim, setPlayAnim] = useState(false);
  const [searchOrder, setSearchOrder] = useState(null);
  const [playSearchAnim, setPlaySearchAnim] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoadingScreen(true), 800); // executes once to setup loading screen (allows enter transition to play)
  }, []);

  // handling the stupid giant json

  // Code to run the worker and parse JSON on a non-blocking thread
  // FIXME: This needs to be reworked into a flow, I left it here for now but this should update state so it only runs once
  //        and path finding can only be performed after it's done parsing
  useEffect(() => {
    const worker = new Worker(new URL("./bffWorker.tsx", import.meta.url));
    worker.onmessage = (e) => {
      const { ok, data, error } = e.data;
      if (ok) setData(data);
      else setError(error);
    };

    fetch("/FL-roads.json")
      .then((res) => res.text())
      .then((text) => worker.postMessage(text))
      .catch((err) => setError(err.message));

    return () => worker.terminate();
  }, []);

  useEffect(() => {
    if (!data) {
      console.log("Still loading the big fat file...");
    } else {
      graphRef.current = new Graph(data);
      if (graphRef) {
        setLoadingScreen(false);
        setTimeout(() => {
          setMainScreen(true);
        }, 800); // delays rendering the main screen until after the loading screen transitions
      }
    }
  }, [data]);

  useEffect(() => {
    if (graphRef.current) {
      if (!startingCoords || !endingCoords) {
        return;
      }
      let result = null;
      switch (algorithm) {
        case "A*-Search": {
          result = graphRef.current.pathfindAStar(startingCoords, endingCoords);
          break;
        }
        case "Dijkstra": {
          result = graphRef.current.pathfindDijkstra(startingCoords, endingCoords);
          break;
        }
        case "Depth-First": {
          result = graphRef.current.pathfindDFS(startingCoords, endingCoords);
          break;
        }
        case "Breadth-First": {
          result = graphRef.current.pathfindBFS(startingCoords, endingCoords);
          break;
        }
      }
      if (!result) { return; }
      setPathData(result.path);
      setSearchOrder(result.processing_order);
    }
  }, [buttonClick]);

  return (
    <>
      <LoadingScreen nodeRef={nodeRef} showLoadingScreen={showLoadingScreen} />
      {showMainScreen && (
        <MainScreen
          buttonClick={buttonClick}
          setButtonClick={setButtonClick}
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          setStartingCoords={setStartingCoords}
          setEndingCoords={setEndingCoords}
          pathData={pathData}
          playAnim={playAnim}
          setPlayAnim={setPlayAnim}
          searchOrder={searchOrder}
          playSearchAnim={playSearchAnim}
          setPlaySearchAnim={setPlaySearchAnim}
        />
      )}
    </>
  );
}

export default App;
