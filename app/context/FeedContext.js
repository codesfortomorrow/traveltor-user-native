import React, {createContext, useState, useRef} from 'react';

export const FeedContext = createContext();

export const FeedProvider = ({children}) => {
  const [feeds, setFeeds] = useState([]);
  const scrollPosition = useRef(0);

  return (
    <FeedContext.Provider value={{feeds, setFeeds, scrollPosition}}>
      {children}
    </FeedContext.Provider>
  );
};
