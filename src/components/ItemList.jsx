import React from 'react';
import Item from './Item';

const ItemList = ({ items, handleBid, isOwner }) => {
  return (
    <div className="item-list">
      {items.map((item) => (
        <Item
          key={item.itemId}
          item={item}
          handleBid={handleBid}
          isOwner={isOwner}
          image={item.image}
        />
      ))}
    </div>
  );
};

export default ItemList;
