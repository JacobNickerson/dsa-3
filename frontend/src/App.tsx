import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [showStartScreen, setStartScreen] = useState(true);
  const [count, setCount] = useState(0)

  const hideStartScreen = () => {
    setStartScreen(false);
  }

  return (
    <>
      {showStartScreen ? (
        <div className="start screen">
          <h1>Street Pathfinding Visualizer</h1>
          <h2>find your shortest path...</h2>
          <button onClick={hideStartScreen}>start</button>
        </div>
      ) : (
        <div className="main screen">
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
            <button onClick={() => setCount((count) => count + 1)}>
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
      )}
    </>
  )
}

export default App
