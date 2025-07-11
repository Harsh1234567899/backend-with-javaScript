import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'
import { useEffect } from 'react'

function App() {
  const [jokes,setjokes] = useState([])
  useEffect(()=>{
    axios.get('/api/jokes')
    .then((response)=>{
      setjokes(response.data)
    }).catch((error)=>{
      console.log(error);
      
    })
  })
  return (
    <>
      {/* <div>
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
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
      <h1>chai and js</h1>
      <p>jokes {jokes.length}</p>

      {jokes.map((jokes,index)=>(
        <div key={jokes.id}>
          <h3>{jokes.title}</h3>
          <p>{jokes.content}</p>
        </div>
      ))}
    </>
  )
}

export default App

//1) adding proxy in vite.config file 

// export default defineConfig({
//   server: {
//     proxy: {
//       '/api': {
//       target: 'http://localhost:4000',
//       changeOrigin: true,
//       secure: false,
//     }
//     }
//   },
//   plugins: [react()],
// })

