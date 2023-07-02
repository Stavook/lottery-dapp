import React, { useEffect, useState } from 'react';

const MainPage = () => {
  const [userAddress, setUserAddress] = useState('');

  useEffect(() => {
    // Retrieve the user address from localStorage
    const storedUserAddress = localStorage.getItem('walletAddress');
    setUserAddress(storedUserAddress);
  }, []);

  return (
    <div>
      <h1>Main Page</h1>
      <p>User Address: {userAddress}</p>
      {/* Display the three item names and buttons here */}
    </div>
  );
};

export default MainPage;
