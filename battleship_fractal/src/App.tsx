import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { emptyOcean, type Ocean} from './logic'

function App() {
  const [count, setCount] = useState(0)

  const [ocean1, setOcean1] = useState<Ocean>(emptyOcean);
  const [ocean2, setOcean2] = useState<Ocean>(emptyOcean);

  



  return (
    <>
      <h1 className='text-6xl'>BattleShip 🚢</h1>


      {ocean1.map((row, ri) => (
        <div>
        {row.map((cell, ci) => (
        <button key={ci}>.</button>
      ))}
      </div>
      ))}



    </>
  )
}

export default App
