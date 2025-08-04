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
import { Graph } from "./Graph.tsx";

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
}: {
  buttonClick: boolean;
  setButtonClick: any;
  setAlgorithm: any;
  setStartingCoords: any;
  setEndingCoords: any;
  algorithm: any;
}) {
  const [open, setOpen] = useState(false);
  const [pathData, setPathData] = useState(
    // PLACEHOLDER paths...pass an array of arrays/coordinates into the pathAnimation component
    [
      [28.64, -81.78],
      [27.4, -80.39],
      [27.32, -81.35],
    ]
  );
  const [playAnim, setPlayAnim] = useState(false);
  const [pathFinalData, setPathFinalData] = useState(
    // PLACEHOLDER paths...pass an array of arrays/coordinates into the pathAnimation component
    [
      [28.64, -81.78],
      [27.4, -80.39],
      [27.32, -81.35],
    ]
  );
  const [playFinalAnim, setPlayFinalAnim] = useState(true);

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
    }
    if (formData.get) {
      const selectAlgo = formData.get("select-algorithm"); // clearing previous paths will NOT work without this line!!
      setAlgorithm(selectAlgo);
      setPlayAnim(true);
      setButtonClick(!buttonClick);
    }
  };

  return (
    <div>
      <MapOpen
        pathData={pathData}
        playAnim={playAnim}
        finalPathData={pathFinalData}
        playFinalAnim={playFinalAnim}
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
  const [startingCoords, setStartingCoords] = useState<[number, number]>([
    999, 0,
  ]);
  const [endingCoords, setEndingCoords] = useState<[number, number]>([999, 0]);
  const [buttonClick, setButtonClick] = useState(false);
  const nodeRef = useRef(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  let graphData: Graph;
  const [processOrder, setProcessOrder] = useState();
  const [path, setPath] = useState();
  const [runtime, setRuntime] = useState();
  const [weight, setWeight] = useState();
  const graphRef = useRef<Graph | null>(null);

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
      console.log("Still waiting...");
    } else {
      graphRef.current = new Graph(data);
      if (graphRef) {
        console.log(graphRef.current); //testing
        console.log(
          graphRef.current.pathfindAStar([29.59, -82.8], [28.31, -81.53])
        ); //testing
        setLoadingScreen(false);
        setTimeout(() => {
          setMainScreen(true);
        }, 800); // delays rendering the main screen until after the loading screen transitions
      }
    }
  }, [data]);

  useEffect(() => {
    console.log(graphRef.current);
    if (graphRef.current) {
      if (algorithm == "A*-Search") {
        console.log("ready!");
      }
    } else {
      console.log("why wont this load..??");
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
        />
      )}
    </>
  );
}

export default App;
