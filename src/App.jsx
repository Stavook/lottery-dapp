import './App.css'
import LoginPage from './components/LoginPage.jsx'
import MainPage from './components/MainPage.jsx'
import { BrowserRouter, Route, Routes} from 'react-router-dom'
import { useState } from 'react';



function App() {

  const [userAddress, setUserAddress] = useState({});

  return (
    <BrowserRouter>
    <header className='header'> 
      <h1>NFT Lottery</h1>
      </header>
       <section className='nes-container with-title showcase'>
          <h2 className="title"></h2>
          <section className='items'>
          
            <Routes>
              <Route path="/" element={<LoginPage setUserAddress={setUserAddress} />} />
              <Route path="/main" element={<MainPage userAddress={userAddress} />} />
            </Routes>
          </section>
        </section>
      <footer><h2></h2></footer>
    </BrowserRouter>
  )
}

export default App
