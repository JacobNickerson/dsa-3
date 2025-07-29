import { useState, useRef, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import { Stack, Fab, Select, FormControl, TextField, InputLabel, MenuItem, IconButton, Drawer } from '@mui/material'
import {DeckGL} from '@deck.gl/react'
import {TripsLayer} from '@deck.gl/geo-layers'
import NavigationIcon from '@mui/icons-material/Navigation'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Map from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import './App.css'

type Path = {
  waypoints: {
    coordinates: [longitude: number, latitude: number];
    timestamp: number;
  }[]
};

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
  const [time, setTime] = useState(0);
  const [pathDataJSON, setPathDataJSON] = useState('https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.trips.json') // data for the pathfinding animations, can be a javascript object/json file/etc.
  const [pathLoaded, setPathLoaded] = useState(false);
  const [prevPathLoaded, setPrevPathLoaded] = useState(false); // for clearing the previous animated path but not needed with a working submit (see next comment)

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
    if (prevPathLoaded) {
      setPathLoaded(false) // clears the previous animated path (not necessary and can be delete with working form inputs, because the layer/path will rerender when new data is passed to it)
      setPrevPathLoaded(false)
    }
    const startLocation = formData.get("startLocation")
    handleDrawerClose()
    setPathLoaded(true) // plays the animation on submit--should instead play the animation when data is ready
    setPrevPathLoaded(true)
  }

  useEffect(() => {
    if (pathLoaded) {
      setTime(0)
      const id = setInterval(() => setTime(t => (t + 1)), 5) // changing either the incrementing amount or the second argument of setTime() will change the speed of the animation
      return () => clearInterval(id)
    }
  }, [pathLoaded])

  const layer = pathLoaded ? new TripsLayer<Path>({ // tripsLayer only renders if pathLoaded's value is true
    id: 'TripsLayer',
    data: pathDataJSON, // public data from the Deck.gl documentation page, replace with our data later...can be a javascript object, json file, etc...
    
    getPath: (d: Path) => d.waypoints.map(p => p.coordinates),
    getTimestamps: (d: Path) => d.waypoints.map(p => p.timestamp - 1554772579000), // a large number is subtracted from each timestamp because timestamps must be small numbers close to 0 and the placeholder public dataset has LARGE values
    getColor: [253, 128, 93],
    currentTime: time,
    trailLength: 600,
    capRounded: true,
    jointRounded: true,
    widthMinPixels: 8,
    fadeTrail: false
  }) :
  null

  return (
    <div style={{width: '100vw', height: '100vh'}}>
      <DeckGL 
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14
        }} 
        controller
        layers={[layer]}>
        <Map
          style={{width: '100%', height: '100%'}}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
        />
      </DeckGL>
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
              <TextField name="startLocation" label="Starting Location" variant="outlined" fullWidth required />
              <TextField name="endLocation" label="Destination" variant="outlined" margin="normal" fullWidth required />
            </div>
            <FormControl sx={{ m: 1, minWidth: 150 }}>
              <InputLabel id="select-algorithm-label">Select Algorithm</InputLabel>
              <Select
                labelId="select-algorithm-label"
                id="select-algorithm"
                value={algorithm}
                label="Select Algorithm"
                onChange={handleChange}
                required
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
