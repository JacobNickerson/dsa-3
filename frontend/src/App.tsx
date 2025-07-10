import { useState, useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [showStartScreen, setStartScreen] = useState(true)
  const [showMainScreen, setMainScreen] = useState(false)
  const nodeRef = useRef(null)
  const [count, setCount] = useState(0) // delete this later? it's for the placeholder counter on the main screen

  const handleClick = () => {
    setStartScreen(false)
    setTimeout(() => {setMainScreen(true)}, 1000) // delays rendering the main screen
  }

  return (
    <>
      <CSSTransition nodeRef={nodeRef} in={showStartScreen} timeout={400} classNames="fade-transition" unmountOnExit>
        <div ref={nodeRef}>
          <h1>Street Pathfinding Visualizer</h1>
          <h2>find your shortest path...</h2>
          <button onClick={handleClick} style={{marginTop: '40px'}}>start</button>
        </div>
      </CSSTransition>
      {showMainScreen &&
        <CSSTransition nodeRef={nodeRef} in={showMainScreen} timeout={400} classNames="fade-transition">
          <div>
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
        </CSSTransition>
      }
    </>
  )
}

export default App
