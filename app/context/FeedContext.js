import React, {createContext, useState, useRef} from 'react';

export const FeedContext = createContext();

export const FeedProvider = ({children}) => {
  const [feeds, setFeeds] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const scrollPosition = useRef(0);

  const value = {
    feeds,
    setFeeds,
    feedLoading,
    setFeedLoading,
    pageNumber,
    setPageNumber,
    hasMore,
    setHasMore,
    scrollPosition,
  };

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
};
