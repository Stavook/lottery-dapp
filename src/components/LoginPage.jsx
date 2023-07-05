import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      // If the user is already logged in, redirect to the main page or another route
      navigate('/main');
    }
  }, [isLoggedIn, navigate]);

  const handleLogin = async () => {
    // Check if MetaMask is available
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request access to the user's MetaMask accounts
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Get the current wallet address
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const currentAddress = accounts[0];

        // Save the user address in localStorage
        localStorage.setItem('walletAddress', currentAddress);

        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error logging in:', error);
      }
    } else {
      console.error('MetaMask extension not detected.');
    }
  };

  return (
    <div className="centered">
        <button type="button" className="nes-btn is-primary" onClick={handleLogin}>
          Login with MetaMask
        </button>
      
    </div>
  );
};

export default LoginPage;
