import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { contractAddress, contractABI } from '../constant';
import ItemList from './ItemList';
import {ToastContainer,  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useInterval from '../components/useInterval';


const MainPage = () => {
  const [userAddress, setUserAddress] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [items, setItems] = useState([]);
  const [ownerAddress, setOwnerAddress] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [ticketsSold, setTicketsSold] = useState(0);
  const [contractBalance, setContractBalance] = useState('');
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
    

  useEffect(() => {
    initializeWeb3();
    const storedUserAddress = localStorage.getItem('walletAddress');
    setUserAddress(storedUserAddress);

    const storedIsOwner = localStorage.getItem('isOwner');
    const parsedIsOwner = storedIsOwner ? JSON.parse(storedIsOwner) : false;
    setIsOwner(parsedIsOwner);
  }, []);

  const setupEventListeners = (contract) => {
    const ticketPurchasedEvent = contract.events.TicketPurchased();
  
    const handleDataEvent = (event) => {
      toast.success('Ticket purchased successfully!');
    };
  
    const handleErrorEvent = (error) => {
      console.error('Error listening to TicketPurchased event:', error);
    };
  
    ticketPurchasedEvent.on('data', handleDataEvent);
    ticketPurchasedEvent.on('error', handleErrorEvent);
  
    return {
      ticketPurchasedEvent,
      handleDataEvent,
      handleErrorEvent,
    };
  };
  
  const cleanupEventListeners = (eventListeners) => {
    const { ticketPurchasedEvent, handleDataEvent, handleErrorEvent } = eventListeners;
  
    ticketPurchasedEvent.removeListener('data', handleDataEvent);
    ticketPurchasedEvent.removeListener('error', handleErrorEvent);
  };
  
  useEffect(() => {
    let eventListeners = null;
    if (contract) {
      eventListeners = setupEventListeners(contract);
    }
  
    return () => {
      if (contract && eventListeners) {
        cleanupEventListeners(eventListeners);
      }
    };
  }, [contract]);
  
  const initializeWeb3 = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const contractInstance = new web3Instance.eth.Contract(
          contractABI,
          contractAddress
        );
        setContract(contractInstance);
        loadItems(contractInstance);
        loadContractDetails(contractInstance);
      } catch (error) {
        console.error('Error initializing Web3:', error);
        toast.error('Failed to initialize Web3. Please try again.');
      }
    } else {
      console.error('Web3 provider not found. Please install MetaMask.');
      toast.error('Web3 provider not found. Please install MetaMask.');
    }
  };

  const loadItems = async (contractInstance) => {
    try {
      const itemIds = await contractInstance.methods.nextItemId().call();
      // console.log('Item IDs:', itemIds); // Log the itemIds variable

      const loadedItems = [];
      let totalTicketsSold = 0;

      for (let itemId = 1; itemId < itemIds; itemId++) {
        // console.log('Current Item ID:', itemId); // Log the itemId variable

        const item = await contractInstance.methods.items(itemId).call();
        // console.log('Item:', item); // Log the item object  
        totalTicketsSold += Number(item.ticketsPurchased);
      
        const imageName = `${item.itemName.toLowerCase()}.png`;
        const imageUrl = `/images/${imageName}`;
        const updatedItem = {
          ...item,
          image: imageUrl
        };

        loadedItems.push(updatedItem);
        
        
      }

      // console.log('Loaded Items:', loadedItems); // Log the loadedItems array

      setItems(loadedItems);
      setTicketsSold(totalTicketsSold);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const loadContractDetails = async (contractInstance) => {
    try {
      const owner = await contractInstance.methods.owner().call();
      setOwnerAddress(owner);
  
      if (web3) {
        const contractBalance = await web3.eth.getBalance(contractAddress);
        setContractBalance(contractBalance.toString()); // Convert to string or BN object
  
        const accounts = await web3.eth.getAccounts();
        const userAccount = accounts[0];
        const isUserOwner = owner.toLowerCase() === userAccount.toLowerCase();
  
        setIsOwner(isUserOwner);
        localStorage.setItem('isOwner', JSON.stringify(isUserOwner)); // Save isOwner to localStorage
      }
    } catch (error) {
      console.error('Error loading contract details:', error);
    }
  };

  const updatePage = () => {
    loadItems(contract);
    loadContractDetails(contract);
  };
  useInterval(updatePage, 2000);

  const handleBid = async (itemId) => {
    try {
      if (!web3 || !contract) {
        throw new Error('Web3 or contract instance not found.');
      }
  
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
  
      if (isOwner) {
        throw new Error('The owner cannot buy a lottery ticket.');
      }

      const item = await contract.methods.items(itemId).call();
      if (item.isOver) {
        throw new Error('Item is already over.');
      }

      const ticketCount = 1; // Number of tickets to purchase

      // Calculate the total cost
      const ticketPrice = web3.utils.toWei('0.01', 'ether');
      const totalCost = web3.utils.toBN(ticketPrice).mul(web3.utils.toBN(ticketCount));

      // Check if the user has enough balance to purchase the tickets
      const userBalanceWei = await web3.eth.getBalance(account);
      if (web3.utils.toBN(userBalanceWei).lt(totalCost)) {
        console.error('Insufficient balance to purchase the tickets.');
        return;
      }

      // Place the bid by calling the contract method
      const result = await contract.methods.purchaseTickets(itemId, ticketCount).send({
        from: account,
        value: totalCost,
      });

      console.log(`Placed bid for item with ID: ${itemId}`);
      console.log('Transaction hash:', result.transactionHash);
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error('Failed to place bid. Please try again.');
    }
  };

  
  
  const handleAmIWinner = async () => {
    try {
      if (!web3) {
        throw new Error('Web3 instance not found.');
      }
  
      if (!contract) {
        throw new Error('Contract instance not found.');
      }
  
      const accounts = await web3.eth.getAccounts();
      const currentAddress = accounts[0];
  
      let winners = await contract.methods.getWinners().call({ from: ownerAddress });
      console.log("Winners inside", winners);
  
      if (winners.length === 0) {
        toast.info("No winners yet");
        return false;
      }
  
      const winningDraws = [];
  
      for (let i = 0; i < winners.length; i++) {
        const winnerAddress = web3.utils.toChecksumAddress(winners[i]);
        if (winnerAddress === currentAddress) {
          winningDraws.push(i + 1);
        }
      }
  
      if (winningDraws.length > 0) {
        toast.success("Congrats you are a winner of draw number(s): " + winningDraws.join(", "));
        console.log(currentAddress);
        return true;
      }
  
      toast.error("Sorry you are not a winner");
      console.log(currentAddress);
      return false;
    } catch (error) {
      console.error('Error checking if you are a winner:', error);
      toast.error('Failed to check if you are a winner. Please try again.');
    }
  };
  
  const handleWithdraw = async () => {
    try {
      if (!isOwner) {
        throw new Error('Only the contract owner can withdraw the funds.');
      }
  
      // Call the WithdrawEther function
      const result = await contract.methods.WithdrawEther().send({ from: ownerAddress });
  
      // Handle the result
      console.log('Withdrawal successful:', result);
      toast.success("Withdrawal successful");
    } catch (error) {
      console.error('Error withdrawing:', error);
      toast.error('Failed to withdraw funds. Please try again.');
    }
  };
  
  const handleDeclareWinner = async () => {
    try {
      await contract.methods.conductDraw().send({from: ownerAddress});
      toast.success("Lottery draw started");
    } catch (error) {
      toast.error("Draw Error: ");
      console.log(error);
    }
  };
  
  const handleReset = async () => {
    try{
      await contract.methods.resetLottery().send({ from: ownerAddress });
      toast.success("Lottery Reset");
    }catch(error){
      toast.error("Reset Error");
    }
  }
  
  const handleTransferOwnership = async () => {
    try {
      if (!contract) {
        throw new Error('Contract instance not found.');
      }
  
      if (!isOwner) {
        throw new Error('Only the contract owner can transfer ownership.');
      }
  
      // Call the contract method to transfer ownership
      await contract.methods.transferOwnership(newOwnerAddress).send({
        from: ownerAddress,
      });
      toast.success(`Ownership transferred to ${newOwnerAddress}.`);
      console.log(`Ownership transferred to ${newOwnerAddress}.`);
    } catch (error) {
      console.error('Error transferring ownership:', error);
      toast.error('Failed to transfer ownership. Please try again.');
    }
  };
  
  const handleDestroyContract = async () => {
  try {
    if (!contract) {
      throw new Error('Contract instance not found.');
    }

    if (!isOwner) {
      throw new Error('Only the contract owner can destroy the contract.');
    }

    // Call the contract method to renounce ownership (destroy the contract)
    await contract.methods.renounceOwnership().send({
      from: ownerAddress,
    });
    toast.success(`Contract destroyed`);
    console.log('Contract destroyed.');
  } catch (error) {
    console.error('Error destroying contract:', error);
    toast.error('Failed to destroy the contract. Please try again.');
  }
};
  
  
  return (
  <div >
    {/* <h1>Main Page</h1> */}
    <section className="nes-container with-title showcase">
      <h2 className='title'> Available Bids</h2>
      {items.length > 0 ? (
        <ItemList items={items} handleBid={handleBid} isOwner={isOwner} />
      ) : (
        <p>No items to display.</p>
      )}
      
      {/* <section className='nes-container'> */}
      
      <ToastContainer />
      <br/>
      <div className='lists'>
        <ul className='nes-list is-disc'>
          <li >User Address: {userAddress}</li>
          <li>Owner Address: {ownerAddress}</li>
          <li>Tickets Sold: {ticketsSold}</li>
          <li>Contract Balance: {web3 && web3.utils.fromWei(contractBalance)}</li>
      </ul>
      </div>
  <div className="button-container">
    {isOwner ? (
      <>
        <div className="centered-buttons">
          <button className="nes-btn is-primary" onClick={handleWithdraw}>
            Withdraw
          </button>
          <button className="nes-btn is-warning" onClick={handleDeclareWinner}>
            Declare Winner
          </button>
          <button className="nes-btn is-error" onClick={handleReset}>
            Reset
          </button>
          <button className="nes-btn is-error" onClick={handleDestroyContract}>
            Destroy Contract
          </button>
        </div>
        <div className='centered-buttons'>
        <button className="nes-btn is-success" onClick={handleTransferOwnership}>
          Transfer Ownership
        </button>
       
          <div className='nes-field'>
            <input
              type="text"
              className="nes-input"
              value={newOwnerAddress}
              onChange={(e) => setNewOwnerAddress(e.target.value)}
            />
          </div>
        </div>
        
      </>
    ) : (
      <div className='centered-buttons'>
        <button className="nes-btn is-primary" onClick={handleAmIWinner}>
          Am I Winner
        </button>
      </div>
    )}
  
</div>
      </section>
  </div>
);
};

export default MainPage;
