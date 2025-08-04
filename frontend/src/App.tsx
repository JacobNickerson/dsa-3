import { useState, useRef, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import {
  Stack,
  Fab,
  Select,
  FormControl,
  TextField,
  InputLabel,
  MenuItem,
  IconButton,
  Drawer,
} from "@mui/material";
import NavigationIcon from "@mui/icons-material/Navigation";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import "./App.css";
import MapOpen from "./components/MapOpen";

function StartScreen({
  nodeRef,
  showStartScreen,
  handleClick,
}: {
  nodeRef: any;
  showStartScreen: any;
  handleClick: any;
}) {
  return (
    <CSSTransition
      nodeRef={nodeRef}
      in={showStartScreen}
      timeout={400}
      classNames="fade-transition"
      unmountOnExit
    >
      <div className="start-screen" ref={nodeRef}>
        <h1>Florida Street Pathfinding Visualizer</h1>
        <h2 style={{ marginTop: "10px" }}>find your shortest path...</h2>
        <button onClick={handleClick} style={{ marginTop: "40px" }}>
          start
        </button>
      </div>
    </CSSTransition>
  );
}

function MainScreen() {
  const [algorithm, setAlgorithm] = useState("");
  const [open, setOpen] = useState(false);
  const [pathData, setPathData] = useState(
    // PLACEHOLDER paths...pass an array of arrays/coordinates into the pathAnimation component
  [
    [51, 52],
    [53, 54],
    [59, 50],
    [59.21, 45.61],
    [40, 40]
  ]
  );
  const [playAnim, setPlayAnim] = useState(true)

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
      setPlayAnim(false)
    }
    const startLocation = formData.get("startLocation");
    alert(`${startLocation}`);
    handleDrawerClose();
    setPathData([
      [60, 63],
      [66, 69],
      [49, 51]
    ]); // PLACEHOLDER
    setPlayAnim(true)
  };

  return (
    <div>
      <MapOpen pathData={pathData} playAnim={playAnim} />
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
            <div className="text-inputs-container">
              <TextField
                name="startLocation"
                label="Starting Location"
                variant="outlined"
                fullWidth
                required
              />
              <TextField
                name="endLocation"
                label="Destination"
                variant="outlined"
                margin="normal"
                fullWidth
                required
              />
            </div>
            <FormControl sx={{ m: 1, minWidth: 150 }}>
              <InputLabel id="select-algorithm-label">
                Select Algorithm
              </InputLabel>
              <Select
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
  const [showStartScreen, setStartScreen] = useState(false);
  const [showMainScreen, setMainScreen] = useState(false);
  const nodeRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setStartScreen(true), 800); // executes once to setup start screen (allows enter transition to play)
  }, []);

  const handleClick = () => {
    setStartScreen(false);
    setTimeout(() => {
      setMainScreen(true);
    }, 800); // delays rendering the main screen until after the start screen transitions
  };

  return (
    <>
      <StartScreen
        nodeRef={nodeRef}
        showStartScreen={showStartScreen}
        handleClick={handleClick}
      />
      {showMainScreen && <MainScreen />}
    </>
  );
}

export default App;
