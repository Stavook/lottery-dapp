import './App.css'
import LoginPage from './components/LoginPage.jsx'
import MainPage from './components/MainPage.jsx'
import { BrowserRouter, Route, Routes} from 'react-router-dom'
import { useState } from 'react';


function App() {

  const [userAddress, setUserAddress] = useState({});

  return (
    <BrowserRouter>
     <header>
        <div className="header-content">
          <div className="title-container">
            <h1 className="title">NFT Lottery</h1>
          </div>
          <p className="description">Nyan Cat's favourite place to lose ether</p>
        </div>
      </header>
      <hr />
      <Routes>
        <Route path="/" element={<LoginPage setUserAddress={setUserAddress} />} />
        <Route path="/main" element={<MainPage userAddress={userAddress} />} />
      </Routes>
    </BrowserRouter>
    
  )
}

export default App
