import React, {useCallback, useEffect, useRef, useState} from 'react';
import useAuth from '../../hooks/useAuth';
import debounce from 'lodash/debounce';
import {getAuthReq, getReq} from '../../utils/apiHandlers';
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import moment from 'moment';
import {useSelector} from 'react-redux';
import {useNavigation, useRoute} from '@react-navigation/native';

const Trekscapes = () => {
  const {navigate} = useNavigation();
  const {search: paramSearch} = useRoute().params;
  const [categoryId, setCategoryId] = useState(
    sessionStorage.getItem('categoryId') || '1',
  );
  const [isLoading, setIsLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(paramSearch || '');
  const {getTrekscape} = useAuth();
  const [treckScapeList, setTreckScapeList] = useState([]);
  const [category, setCategory] = useState([]);
  const [noData, setNoData] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);
  const scrollContainerRef = useRef(null);
  const [categorySlug, setCategorySlug] = useState('cities');
  const [eventLoading, setEventLoading] = useState(true);
  const [reviewsMap, setReviewsMap] = useState({});
  const [liveEvents, setLiveEvents] = useState([]);
  const location = useSelector(state => state?.location);
  const [hasCategory, setHasCategory] = useState(false);
  const [haslive, setHasLive] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('categoryId', categoryId);
  }, [categoryId]);

  const fetchCategory = async () => {
    setHasCategory(false);
    const res = await getReq('/categories');
    if (res?.status) {
      setCategory(res?.data?.data);
      setHasCategory(true);
    } else {
      console.log('fetch category error', res?.error);
    }
  };

  const fetchLiveEvents = async ({latitude, longitude}) => {
    // setHasLive(false);
    setEventLoading(true);
    if (latitude && longitude) {
      const resLive = await getReq(
        `/trekscapes/live-events?latitude=${latitude}&longitude=${longitude}`,
      );

      if (resLive?.status && resLive?.data?.data.length > 0) {
        setLiveEvents(resLive?.data?.data);
        setHasLive(true);
      }
    }
  };

  useEffect(() => {
    fetchLiveEvents(location);
  }, [location]);

  useEffect(() => {
    fetchCategory();
  }, []);

  useEffect(() => {
    if (categorySlug == 'live') {
      fetchLiveEvents(location);
    }
  }, [categorySlug]);

  useEffect(() => {
    if (hasCategory && haslive) {
      const payload = {
        createdAt: new Date().toISOString(),
        name: 'Live',
        slug: 'live',
        icon: '/images/server-server-gif.gif',
        id: 0,
      };

      setCategory([payload, ...category]);
    }
  }, [hasCategory, haslive]);

  const latestRequestIdRef = useRef(0);

  const fetchTrekscape = async (searchTerm, categoryId, page, location) => {
    const requestId = ++latestRequestIdRef.current;

    try {
      setContentLoading(true);

      if (page === 0) {
        setIsLoading(searchTerm ? false : true);
      }

      const response = await getTrekscape(
        searchTerm,
        categoryId,
        page,
        location,
      );

      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      if (response?.data) {
        if (page !== 0) {
          setTreckScapeList(prev => [...prev, ...response?.data]);
          setHasMore(response.data.length == 10);
          setNoData(false);
        } else {
          setTreckScapeList(response?.data);
          setHasMore(response?.data?.length == 10);
          setNoData(true);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
        setContentLoading(false);
      }
    }
  };

  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
    setPageNumber(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setTreckScapeList([]);
    setPageNumber(0);
    setIsLoading(true);
  };

  const debouncedFetchTrekscape = useCallback(
    debounce(
      () => fetchTrekscape(searchTerm, categoryId, pageNumber, location),
      500,
    ),
    [searchTerm, categoryId, pageNumber, location],
  );

  useEffect(() => {
    debouncedFetchTrekscape();
    return () => debouncedFetchTrekscape.cancel();
  }, [searchTerm, categoryId, pageNumber, location]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !contentLoading) {
          setPageNumber(prev => prev + 1);
        }
      },
      {threshold: 1.0},
    );

    if (loader.current) observer.observe(loader.current);

    return () => observer.disconnect();
  }, [hasMore, contentLoading]);

  useEffect(() => {
    setSearchTerm('');
    setTreckScapeList([]);
    setReviewsMap({});
    setEventLoading(true);
    setPageNumber(0);
    setIsLoading(true);

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [categoryId]);

  const currentCategory = category?.find(item => item.id == categoryId);

  const fetchReviews = async slug => {
    if (reviewsMap[slug]) return;

    const res = await getAuthReq(`/trail-points/${slug}/check-ins`);
    if (res?.status) {
      setReviewsMap(prev => ({
        ...prev,
        [slug]: res?.data?.data,
      }));
      setEventLoading(false);
    } else {
      setEventLoading(false);
    }
  };

  useEffect(() => {
    if (categorySlug === 'live') {
      liveEvents.forEach(event => {
        fetchReviews(event.slug);
      });
    }
  }, [categorySlug]);

  function getTimeDifference(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);

    if (now > past) {
      return {
        value: 'LIVE',
        // timeframe: 'Min Delay',
        toString: function () {
          return `${this.value}`;
        },
      };
    }

    const diffInSeconds = Math.floor((past - now) / 1000);

    let value, timeframe;

    if (diffInSeconds < 60) {
      value = diffInSeconds;
      timeframe = 'Seconds';
    } else {
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        value = diffInMinutes;
        timeframe = 'Minutes';
      } else {
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
          value = diffInHours;
          timeframe = 'Hours';
        } else {
          const diffInDays = Math.floor(diffInHours / 24);
          value = diffInDays;
          timeframe = 'Days';
        }
      }
    }

    return {
      value,
      timeframe,
      toString: function () {
        return `${this.value}`;
      },
    };
  }

  // useEffect(() => {
  //   const savedScrollPos = sessionStorage.getItem('trekscapeScrollPos');
  //   if (savedScrollPos) {
  //     if (scrollContainerRef.current) {
  //       scrollContainerRef.current.scrollTo({
  //         top: parseInt(savedScrollPos),
  //         behavior: 'instant',
  //       });
  //     } else {
  //       window.scrollTo({ top: parseInt(savedScrollPos), behavior: 'instant' });
  //     }
  //   }

  //   const handleScroll = () => {
  //     const scrollPos = scrollContainerRef.current
  //       ? scrollContainerRef.current.scrollTop
  //       : window.scrollY;
  //     sessionStorage.setItem('trekscapeScrollPos', scrollPos);
  //   };

  //   const scrollElement = scrollContainerRef.current || window;
  //   scrollElement.addEventListener('scroll', handleScroll);

  //   return () => {
  //     scrollElement.removeEventListener('scroll', handleScroll);
  //   };
  // }, []);

  return (
    <div className="h-auto min-h-[95vh] shadow-topHeader">
      <div className="flex-center w-full">
        <TrekscapeTopBar
          categoryId={String(categoryId)}
          setCategoryId={setCategoryId}
          category={category}
          setCategorySlug={setCategorySlug}
        />
      </div>
      {categorySlug != 'live' && (
        <div
          ref={scrollContainerRef}
          className="py-4 h-[calc(100vh-100px)] overflow-auto no-scrollbar">
          {isLoading ? (
            <div className="w-[70%] mx-auto">
              <Skeleton
                height={40}
                width="100%"
                className="rounded-[25px] border border-[#EFEFEF] px-5 py-2"
              />
            </div>
          ) : (
            <>
              {(treckScapeList?.length > 0 || searchTerm) && (
                <div className="relative w-[70%] mx-auto">
                  <input
                    type="text"
                    placeholder={`Search for ${currentCategory?.name.trim()} Trekscapes`}
                    className="border border-[#EFEFEF] w-full pl-5 pr-9 py-2 shadow-searchInput rounded-[25px] font-inter text-12 outline-none"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {searchTerm ? (
                    <RxCross1
                      className="ay-center bg-white rounded-full right-5 h-4 w-4 hover:text-primary-1200"
                      onClick={handleClearSearch}
                    />
                  ) : (
                    <CustomImage
                      className="ay-center right-5 h-5 w-5"
                      src="/images/mobtrekscape/search.svg"
                      alt="search"
                    />
                  )}
                </div>
              )}
            </>
          )}
          <div className="grid grid-cols-1 gap-5 m-4">
            {isLoading &&
              Array.from({length: 4}).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center max-w-[340px] w-full overflow-hidden mx-auto mb-3">
                  <div className="w-full h-[325px] rounded-[24px]">
                    <Skeleton height={325} className="rounded-[24px] w-full" />
                  </div>
                  <div className="flex justify-between items-center w-full h-[56px] mt-2">
                    <div>
                      <Skeleton height={17} width={100} className="mb-2" />
                      <div className="flex items-center gap-4">
                        <Skeleton height={15} width={150} />
                        <Skeleton height={15} width={100} />
                      </div>
                    </div>
                    <Skeleton width={28} height={36} />
                  </div>
                </div>
              ))}{' '}
            {!isLoading &&
              (treckScapeList.length > 0 ? (
                treckScapeList?.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center max-w-[340px] w-full overflow-hidden mx-auto mb-3">
                    <SwiperSlider images={item?.previewMedia} id={item?.slug} />
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <h1 className="my-1 text-14 font-medium font-jakarta">
                          {item?.name}
                        </h1>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <CustomImage
                              src="/images/mobtrekscape/location.svg"
                              className="h-[15px] w-[15px] object-cover"
                              alt="location"
                            />
                            <p className="font-inter text-12">
                              {item?.trailPoints || '0'} Trail Points
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CustomImage
                              src="/images/mobtrekscape/man.svg"
                              className="h-[15px] w-[15px] object-cover"
                              alt="man"
                            />
                            <p className="font-inter text-12">
                              {item?.treksters || '0'} Treksters
                            </p>
                          </div>
                        </div>
                      </div>
                      <div
                        className="px-1 py-2 flex-center bg-primary-1200 rounded cursor-pointer"
                        onClick={() => navigate(`/trekscape/${item?.slug}`)}>
                        <span className="text-white text-xl">
                          {reactIcons.doubleRight}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : searchTerm ? (
                <div className="flex flex-col items-center justify-center gap-5 h-[calc(100vh-165px)]">
                  <CustomImage
                    src="/images/sadIcon.svg"
                    className="h-[60px]"
                    alt="sad"
                  />
                  <p className="text-center text-[#000000b3]">
                    No results found for {searchTerm}. Please check the spelling
                    or try searching for another trekscape.
                  </p>
                  <p
                    className="text-center hover:text-primary-1200 cursor-pointer"
                    onClick={() => (setSearchTerm(''), setIsLoading(true))}>
                    Back To Page
                  </p>
                </div>
              ) : (
                noData && (
                  <div className="flex flex-col items-center justify-center gap-5 h-[calc(100vh-165px)]">
                    <CustomImage
                      src="/images/sadIcon.svg"
                      className="h-[60px]"
                      alt="sad"
                    />
                    <p className="text-center text-[#000000b3]">
                      Oops! No Trekscapes available at this moment.
                    </p>
                  </div>
                )
              ))}
          </div>
          {contentLoading && (
            <div className="flex justify-center items-center py-4">
              <div className="loader"></div>
            </div>
          )}
          <div ref={loader} className="h-[50px]"></div>
        </div>
      )}

      {categorySlug == 'live' && (
        <div
          ref={scrollContainerRef}
          className="py-4 h-[calc(100vh-100px)] overflow-auto no-scrollbar">
          <div className="grid grid-cols-1 gap-5 mt-3">
            {eventLoading &&
              Array.from({length: 4}).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 items-start max-w-[393px] ps-[25px] w-full overflow-hidden mx-auto mb-3">
                  {/* Header Section */}
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex flex-col items-center justify-center w-[41px] h-[41px] rounded-full overflow-hidden bg-gray-300 animate-pulse"></div>
                    <div className="font-inter">
                      <p className="text-sm font-medium">
                        <Skeleton width={120} />
                      </p>
                      <p className="flex items-center font-normal text-[8px]">
                        <Skeleton width={100} />
                      </p>
                    </div>
                  </div>

                  {/* Image and Reviews Section */}
                  <Swiper
                    slidesPerView={1.3}
                    spaceBetween={10}
                    pagination={{clickable: true}}
                    className="mySwiper">
                    {[1, 2, 3].map((_, index) => (
                      <SwiperSlide key={index}>
                        <div className="relative h-[400px] w-[265px] flex gap-5 items-center rounded-[15px] overflow-hidden bg-gray-200 animate-pulse">
                          <div className="h-full w-[265px]">
                            <Skeleton height={310} width={265} />
                          </div>

                          <div className="absolute w-full h-[141px] bottom-0 bg-event px-2 py-1 rounded-14">
                            <div className="flex items-center justify-end">
                              <div className="flex items-center">
                                <Skeleton width={50} />
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div>
                                <Skeleton circle height={50} width={50} />
                              </div>
                              <div>
                                <Skeleton width={100} />
                                <Skeleton width={60} height={20} />
                              </div>
                            </div>

                            <Skeleton count={2} width={'90%'} />
                            <Skeleton width={120} height={20} />
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              ))}
            {liveEvents &&
              liveEvents?.map((event, index) => {
                return (
                  <div
                    key={index}
                    className={`${
                      eventLoading ? 'hidden' : 'flex'
                    } flex-col gap-2 items-start max-w-[393px] ps-[25px] w-full overflow-hidden mx-auto mb-3`}>
                    <div className="flex items-center justify-between w-full">
                      <div
                        className="flex items-center gap-2 w-fit cursor-pointer"
                        onClick={() =>
                          navigate(`/trekscape/${event?.trekscapeSlug}`)
                        }>
                        <div
                          className={`flex flex-col items-center justify-center w-[41px] h-[41px] rounded-full overflow-hidden ${
                            event?.isLive ||
                            getTimeDifference(event?.startTime).toString() ==
                              'LIVE'
                              ? 'event-live'
                              : 'event-pending'
                          }`}>
                          <p className="font-medium font-inter text-sm text-white">
                            {event?.isLive ||
                            getTimeDifference(event?.startTime).toString() ==
                              'LIVE'
                              ? 'LIVE'
                              : getTimeDifference(event?.startTime).toString()}
                          </p>
                          {!event?.isLive &&
                            getTimeDifference(event?.startTime).toString() !==
                              'LIVE' && (
                              <span className="font-medium font-inter text-[7px] text-white mt-[-9px]">
                                {getTimeDifference(event?.startTime).timeframe}
                              </span>
                            )}
                        </div>
                        <div className="font-inter">
                          <p className="text-sm font-medium">{event?.name}</p>
                          <p className="flex items-center font-normal text-[8px]">
                            <CustomImage src="/images/Pin.svg" alt="pin" />{' '}
                            {(event?.distance / 1000).toFixed(2)} KM far from
                            your place
                          </p>
                        </div>
                      </div>
                      <FeedMenu
                        feed={event}
                        // setIsShoutOut={setIsShoutOut}
                        // setShoutOutFeed={setShoutOutFeed}
                      />
                    </div>

                    {reviewsMap[event?.slug]?.length > 0 ? (
                      <Swiper
                        slidesPerView={1.3}
                        spaceBetween={10}
                        pagination={{
                          clickable: true,
                        }}
                        // modules={[Pagination]}
                        className="mySwiper">
                        {reviewsMap[event?.slug]?.map((review, index) => {
                          return (
                            <SwiperSlide key={index}>
                              <div className="relative h-[400px] w-[265px] flex gap-5 items-center rounded-[15px] overflow-hidden">
                                <div className="h-full w-[265px]">
                                  <CustomImage
                                    src={review.media[0]}
                                    className="object-cover w-full h-full"
                                    alt={`slide ${index + 1}`}
                                  />
                                </div>

                                <div className="absolute w-full h-[141px] bottom-0 bg-event px-2 py-1 rounded-14">
                                  <div className="flex items-center justify-end">
                                    <div className="flex items-center">
                                      <CustomImage
                                        src="/images/Pin (1).svg"
                                        alt="pin"
                                        className="w-[14px]"
                                      />
                                      <p className="text-white font-inter font-medium text-8 capitalize">
                                        {/* {moment(item?.createdAt).fromNow()} */}{' '}
                                        {moment(
                                          Number(review?.timestamp),
                                        ).fromNow()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div>
                                      <CustomImage
                                        src={
                                          review?.user?.profileImage ||
                                          '/images/dpPlaceholder.png'
                                        }
                                        className="border border-[#F2E3DD] h-[50px] rounded-full w-[50px] object-cover"
                                        alt="profile"
                                      />
                                    </div>
                                    <div>
                                      <h1 className="font-inter font-semibold text-14 text-white">
                                        {review?.user?.firstname}{' '}
                                        {review?.user?.lastname}
                                      </h1>
                                      <p className="bg-gradient-orange1  px-1 rounded-10 font-inter text-center text-8 text-white w-[57px] h-[20px] flex items-center justify-center">
                                        {' '}
                                        {review?.visitType == 'MustVisit'
                                          ? 'Must Go'
                                          : 'Least Go'}
                                      </p>
                                    </div>
                                  </div>

                                  <p className="font-inter font-300 text-10 text-white leading-4 px-1 pt-2 line-clamp-2">
                                    {review?.review}
                                  </p>

                                  <p
                                    className="text-white font-medium underline text-sm font-inter cursor-pointer"
                                    onClick={() =>
                                      navigate(`/checkins/${event?.slug}`)
                                    }>
                                    See Full Review
                                  </p>
                                </div>
                              </div>
                            </SwiperSlide>
                          );
                        })}
                      </Swiper>
                    ) : (
                      <Swiper
                        slidesPerView={1.3}
                        spaceBetween={10}
                        pagination={{
                          clickable: true,
                        }}
                        className="mySwiper">
                        {event?.previewMedia?.map((image, index) => (
                          <SwiperSlide key={index} className="">
                            <div
                              className="h-[400px] relative w-[265px] overflow-hidden"
                              // onClick={() => navigate(`/checkins/${slug}`)}
                            >
                              <CustomImage
                                src={image}
                                alt="image"
                                className="w-full object-cover rounded-14 h-full"
                              />
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    )}
                  </div>
                );
              })}
            {/* {contentLoading && (
              <div className="flex justify-center items-center py-4">
                <div className="loader"></div>
              </div>
            )} */}
            <div className="h-[50px]"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trekscapes;
