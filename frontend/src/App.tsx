import { useState, useRef, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function StartScreen({ nodeRef, showStartScreen, handleClick } : { nodeRef:any, showStartScreen:any, handleClick:any }) {
  return (
    <CSSTransition nodeRef={nodeRef} in={showStartScreen} timeout={400} classNames="fade-transition" unmountOnExit>
      <div ref={nodeRef}>
        <h1>Street Pathfinding Visualizer</h1>
        <h2>find your shortest path...</h2>
        <button onClick={handleClick} style={{marginTop: '40px'}}>start</button>
      </div>
    </CSSTransition>
  )
}

function MainScreen({ nodeRef, count, setCount } : { nodeRef:any, count:number, setCount:any }) {
  return (
    <div ref={nodeRef}>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount(count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

function App() {
  const [showStartScreen, setStartScreen] = useState(false)
  const [showMainScreen, setMainScreen] = useState(false)
  const nodeRef = useRef(null)
  const [count, setCount] = useState(0) // delete this later? it's for the placeholder counter on the main screen

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
        <MainScreen
          nodeRef = {nodeRef}
          count = {count}
          setCount = {setCount}
        />
      }
    </>
  )
}

export default App
