import React from 'react';


const Item = ({ item, handleBid, isOwner }) => {
  
  return (
    <div className="nes-container is-rounded item">
      <div className="item" key={item.itemId}>     
        <img
          style={{ imageRendering: 'pixelated' }}
          src={item.image}     
          alt="fancy image"
        />
        <p className='item-name'>{item.itemName}</p>
        <p className='item-bids'>Bids : {item.ticketsPurchased}</p>
        <button
          disabled={item.isOver || isOwner} 
          className={item.isOver || isOwner ? 'nes-btn is-disabled' : 'nes-btn is-primary'} // add different styles for disabled and enabled state //add different style for not disabled
          onClick={() => handleBid(item.itemId)}
        >
          Bid
        </button>
      </div>
    </div>
    );
};

export default Item;
