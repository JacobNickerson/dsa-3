import { useState, useRef, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import { Stack, Fab, Select, FormControl, TextField, InputLabel, MenuItem, IconButton, Drawer } from '@mui/material'
import NavigationIcon from '@mui/icons-material/Navigation'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Map from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import './App.css'
import { Graph } from './Graph.tsx'

function StartScreen({ nodeRef, showStartScreen, handleClick } : { nodeRef:any, showStartScreen:any, handleClick:any }) {
  return (
    <CSSTransition nodeRef={nodeRef} in={showStartScreen} timeout={400} classNames="fade-transition" unmountOnExit>
      <div className="start-screen" ref={nodeRef}>
        <h1>Street Pathfinding Visualizer</h1>
        <h2 style={{marginTop: '10px'}}>find your shortest path...</h2>
        <button onClick={handleClick} style={{marginTop: '40px'}}>start</button>
      </div>
    </CSSTransition>
  )
}

function MainScreen() {
  const [algorithm, setAlgorithm] = useState('');
  const [open, setOpen] = useState(false);

  const handleChange = (event:any) => {
    setAlgorithm(event.target.value);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  }
  const handleDrawerClose = () => {
    setOpen(false);
  }

  const submit = (formData:any) => {
    const startLocation = formData.get("startLocation")
    alert(`${startLocation}`)
    handleDrawerClose()
  }

  return (
    <div style={{width: '100vw', height: '100vh'}}>
      <Map
        initialViewState={{
        longitude: -122.4,
        latitude: 37.8,
        zoom: 14
      }}
        style={{width: '100%', height: '100%'}}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
      />
      <Fab onClick={handleDrawerOpen} variant="extended" sx={{position: 'absolute', top: 16, left: 16}}>
        <NavigationIcon sx={{ mr: 1 }}/>
        Search Path
      </Fab>
      <Drawer
        sx={{
          width: '20%'
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeftIcon />
        </IconButton>
        <form action={submit}>
          <Stack spacing={'5vh'} sx={{margin: '40px', maxWidth: '300px'}}>
            <div className="text-inputs-container">
              <TextField name="startLocation" label="Starting Location" variant="outlined" fullWidth />
              <TextField name="endLocation" label="Destination" variant="outlined" margin="normal" fullWidth />
            </div>
            <FormControl sx={{ m: 1, minWidth: 150 }}>
              <InputLabel id="select-algorithm-label">Select Algorithm</InputLabel>
              <Select
                labelId="select-algorithm-label"
                id="select-algorithm"
                value={algorithm}
                label="Select Algorithm"
                onChange={handleChange}
              >
                <MenuItem value={'A*-Search'}>A* Search</MenuItem>
                <MenuItem value={'Breadth-First'}>Breadth-First Search</MenuItem>
                <MenuItem value={'Depth-First'}>Depth-First Search</MenuItem>
                <MenuItem value={'Dijkstra'}>Dijkstra's Algorithm</MenuItem>
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
  )
}

function App() {
  // handling the stupid giant json
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const worker = new Worker(new URL('./bffWorker.tsx', import.meta.url));
    worker.onmessage = (e) => {
      const { ok, data, error } = e.data;
      if (ok) setData(data);
      else setError(error);
    };

    fetch('/FL-roads.json')
      .then(res => res.text())
      .then(text => worker.postMessage(text))
      .catch(err => setError(err.message));

    return () => worker.terminate();
  }, []);

  const [showStartScreen, setStartScreen] = useState(false)
  const [showMainScreen, setMainScreen] = useState(false)
  const nodeRef = useRef(null)

  useEffect(() => {
    setTimeout(() => setStartScreen(true), 800); // executes once to setup start screen (allows enter transition to play)
  }, [])

  const handleClick = () => {
    setStartScreen(false)
    setTimeout(() => {setMainScreen(true)}, 800) // delays rendering the main screen until after the start screen transitions
  }

  return (
    <>
      <StartScreen
        nodeRef = {nodeRef}
        showStartScreen = {showStartScreen}
        handleClick = {handleClick}
      />
      {showMainScreen &&
        <MainScreen />
      }
    </>
  )
}

export default App
