import {CheckInBar} from '@/components';
import useAuth from '@/hooks/useAuth';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {toast} from 'react-hot-toast';
import {setError} from '@/redux/actions';
import CustomImage from '@/components/CustomImage';
import {
  generateDraftId,
  getDraftById,
  publishDraft,
  saveDraft,
} from '@/helpers/db';
import ImageCropper from '@/components/Crop/ImageCropper';
import {TiDelete} from 'react-icons/ti';
import {Pagination, Autoplay} from 'swiper/modules';
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import {
  convertToThreeFourRatio,
  getLocation,
  handleFileChange,
} from '@/helpers/fileUploadHelper';
import {CheckInStep2} from '@/containers/pageListAsync';

const GeneralCheckIn = () => {
  const dispatch = useDispatch();
  const [successCheckin, setSuccessCheckin] = useState(null);
  const [loading, setLoading] = useState(false);
  const {getCurrentTrekscapes} = useAuth();
  const location = useSelector(state => state.location);
  const navigate = useNavigate();
  const [showSelectedDateTime, setShowSelectedDateTime] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [step, setStep] = useState(1);
  const [trailPointDetail, setTrailPointDetail] = useState([]);
  const [currentTrekscapes, setCurrentTrekscapes] = useState([]);
  const [locationloader, setLocationloader] = useState(true);
  const [hasLocation, setHasLocation] = useState(true);
  const [handleName, setHandleName] = useState('');
  const date = new Date(showSelectedDateTime);
  const delaySeconds = Math.floor(date.getTime() / 1000);
  const [getLocationLoader, setGetLocationLoader] = useState(false);
  const [showSingleFile, setShowSingleFile] = useState({});
  const [croppedImages, setCroppedImages] = useState({});
  const [isCropOpen, setIsCropOpen] = useState(false);
  const inputRef = useRef(null);
  const isTriggered = useRef(false);
  const [isLoaded, setIsLoaded] = useState({});

  const handleCheckInTreckScape = async () => {
    try {
      setLoading(true);
      localStorage.removeItem('generalDraft');

      const trailPoint = trailPointDetail[0];
      const payload = {
        type: trailPoint?.trekscape_id ? 'TrailPoint' : 'Trekscape',
        lat: location?.latitude || 0,
        long: location?.longitude || 0,
        review: reviewText,
        delay: delaySeconds,
      };

      if (trailPoint?.trekscape_id) {
        payload.trailPointId = trailPoint.id;
      } else {
        payload.trekscapeId = trailPoint.id;
      }

      const updatedFiles = await Promise.all(
        selectedFiles.map(async file => {
          const croppedImage = croppedImages[file.id];
          if (croppedImage) {
            const blob = await fetch(croppedImage).then(res => res.blob());
            return new File(
              [blob],
              `cropped_${file.file?.name || 'image'}.jpg`,
              {
                type: 'image/jpeg',
              },
            );
          }
          return await convertToThreeFourRatio(file.file);
        }),
      );

      const draftId = await generateDraftId(payload, updatedFiles);

      const existingDraft = await getDraftById(draftId);

      if (!existingDraft) {
        await saveDraft({
          id: draftId,
          files: updatedFiles,
          payload: payload,
          status: 'readyforPublish',
          type: 'general',
        });
      }

      const response = await publishDraft();
      if (response?.status) {
        setSuccessCheckin({
          status: true,
          data: {
            name: handleName,
            point: payload.type === 'TrailPoint' ? 1000 : 5,
          },
        });
      } else {
        toast.error('Failed to publish check-in.');
      }
    } catch (error) {
      dispatch(
        setError({
          open: true,
          custom_message: error?.message || 'Something went wrong',
        }),
      );
      console.error('Check-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentTrekscapes = useCallback(async ({latitude, longitude}) => {
    setLocationloader(true);
    try {
      const response = await getCurrentTrekscapes({
        latitude,
        longitude,
      });
      if (response) {
        setCurrentTrekscapes(response);
        setTrailPointDetail(response);
      } else {
        setCurrentTrekscapes([]);
        setTrailPointDetail(null);
      }
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setLocationloader(false);
      setLoading(false);
      setHasLocation(false);
    }
  }, []);

  useEffect(() => {
    if (!location?.response && location?.latitude) {
      fetchCurrentTrekscapes(location);
    } else {
      setCurrentTrekscapes([]);
      setTrailPointDetail(null);
    }
  }, [fetchCurrentTrekscapes, location]);

  const disable =
    location?.response ||
    !trailPointDetail ||
    selectedFiles?.length == 0 ||
    locationloader;

  useEffect(() => {
    const savedCrops =
      JSON.parse(sessionStorage.getItem('croppedImages')) || {};
    setCroppedImages(savedCrops);
  }, []);

  const handleCropDone = (originalImage, croppedImage) => {
    setCroppedImages(prev => {
      const updatedCrops = {...prev, [originalImage]: croppedImage};
      sessionStorage.setItem('croppedImages', JSON.stringify(updatedCrops));
      return updatedCrops;
    });
  };

  useEffect(() => {
    const triggerFileInput = () => {
      if (inputRef.current && !isTriggered.current) {
        isTriggered.current = true;
        setTimeout(() => {
          inputRef.current?.click();
        }, 0);
      }
    };

    triggerFileInput();
  }, []);

  return (
    <>
      {step == 2 ? (
        <CheckInStep2
          currentTrekscapes={currentTrekscapes}
          setReviewText={setReviewText}
          disable={disable}
          handleCheckInTreckScape={handleCheckInTreckScape}
          setStep={setStep}
          locationloader={locationloader}
          handleName={handleName}
          setHandleName={setHandleName}
          setTrailPointDetail={setTrailPointDetail}
          croppedImages={croppedImages}
          successCheckin={successCheckin}
          setSuccessCheckin={setSuccessCheckin}
          selectedFiles={selectedFiles}
        />
      ) : (
        <div>
          <CheckInBar
            disable={selectedFiles?.length === 0}
            setShowSelectedDateTime={setShowSelectedDateTime}
            trigger={'Next'}
            setStep={setStep}
            isCropOpen={isCropOpen}
            setIsCropOpen={setIsCropOpen}
            selectedFiles={selectedFiles}
            nextTrip={true}
          />
          {!location?.response &&
          !loading &&
          location &&
          currentTrekscapes &&
          !hasLocation &&
          currentTrekscapes.length == 0 ? (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] shadow-topHeader w-full bg-white p-3">
              <CustomImage
                src="/images/sadIcon.svg"
                className="h-60 my-2 mb-4"
                alt="sad"
              />
              <h1 className="font-inter font-300 text-18 text-center leading-5">
                We’re Not Here Yet, But We’re Trying.
              </h1>
              <p className="font-inter font-300 text-14 text-center leading-5 my-3 mb-5">
                Not here yet! Locals, help us expand—join our Telegram to
                connect this location!
              </p>
              <button
                onClick={() => navigate('/trekscapes')}
                className="text-white bg-primary-100 font-medium text-12 px-5 py-2 my-2  rounded-15 leading-none">
                Explore
              </button>
            </div>
          ) : (
            <>
              {location?.response && (
                <>
                  <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] w-full bg-white p-3 shadow-topHeader">
                    <CustomImage
                      src="/images/sadIcon.svg"
                      className="h-60 my-2 mb-4"
                      alt="sad"
                    />
                    <h1 className="font-inter font-300 text-16 text-center leading-5">
                      {location?.response?.code === 1
                        ? 'Permission denied. Please enable geolocation access.'
                        : location?.response?.message}
                    </h1>

                    <button
                      disabled={getLocationLoader}
                      onClick={() =>
                        getLocation(setGetLocationLoader, dispatch)
                      }
                      className="text-white bg-primary-100 font-medium text-14 px-5 py-2 my-5 w-[75px] h-[30px] rounded-15 leading-none flex items-center justify-center">
                      {getLocationLoader ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        'Retry'
                      )}
                    </button>
                  </div>
                </>
              )}

              {!location?.response && (
                <div
                  className={`shadow-topHeader h-auto min-h-[90vh] flex flex-col gap-[20px] pt-5 ${
                    selectedFiles?.length !== 0 &&
                    !isCropOpen &&
                    'justify-center'
                  }`}>
                  {selectedFiles.length == 0 && (
                    <div className="px-5 flex flex-col gap-[50px]">
                      <div className="self-center">
                        <CustomImage
                          src="https://ik.imagekit.io/8u2famo7gp/prod/5ab9e2e49445d4bdf1454b78585f9125.svg?tr=w-97,q-10"
                          alt="Earn Tvtor"
                          className="min-h-[95px]"
                        />
                      </div>
                      <div className="w-full h-[125px] border-2 border-[#31313180] flex items-center justify-start gap-8 px-3">
                        <CustomImage
                          src="/images/uploadImageMic.svg"
                          alt="Mic"
                        />
                        <p className="w-[65%]">
                          Crop or Adjust your photo before publishing, tap on to
                          photo preview.
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedFiles?.length !== 0 && !isCropOpen && (
                    <p
                      className={`text-center font-inter font-normal text-base text-[#0000009A] ${
                        selectedFiles?.length !== 0 &&
                        !isCropOpen &&
                        '-mt-[90px]'
                      }`}>
                      *{selectedFiles?.length > 1 && 'Scroll to see more and'}{' '}
                      Tap to adjust display
                    </p>
                  )}

                  {selectedFiles?.length !== 0 && (
                    <div>
                      <Swiper
                        className="mySwiper mobile"
                        style={{position: 'relative'}}
                        modules={[Pagination, Autoplay]}
                        slidesPerView="auto"
                        centeredSlides={true}
                        spaceBetween={20}
                        pagination={false}>
                        {selectedFiles &&
                          !isCropOpen &&
                          selectedFiles?.map(file => {
                            const imageUrl = croppedImages[file.id] || file.url;
                            return (
                              <SwiperSlide
                                key={file?.id}
                                className={`w-[300px] max-w-[300px] flex justify-center items-center mx-auto h-[400px] relative rounded-lg overflow-hidden ${
                                  selectedFiles?.length === 1
                                    ? 'mx-auto !ml-auto !mr-auto'
                                    : ''
                                }`}>
                                {!isLoaded[file?.id] && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm z-10">
                                    Loading image...
                                  </div>
                                )}
                                <CustomImage
                                  src={imageUrl}
                                  alt="checkin"
                                  className={`fade-in w-full h-full object-cover transition-opacity duration-300 ${
                                    isLoaded[file?.id]
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  }`}
                                  onLoad={() =>
                                    setIsLoaded(prev => ({
                                      ...prev,
                                      [file.id]: true,
                                    }))
                                  }
                                  loading="lazy"
                                  onClick={() => (
                                    setShowSingleFile(file), setIsCropOpen(true)
                                  )}
                                />
                                <TiDelete
                                  className="absolute top-2 right-2 text-red-600 text-[32px] z-[100] cursor-pointer"
                                  onClick={() =>
                                    setSelectedFiles(prevFiles =>
                                      prevFiles.filter(
                                        fileObj => fileObj.id !== file.id,
                                      ),
                                    )
                                  }
                                />
                              </SwiperSlide>
                            );
                          })}
                      </Swiper>
                    </div>
                  )}

                  {selectedFiles?.length !== 0 && isCropOpen && (
                    <div className="relative top-0 left-0 right-0 h-[70vh] flex items-center">
                      <ImageCropper
                        fileId={showSingleFile?.id || selectedFiles[0]?.id}
                        originalFile={
                          showSingleFile?.file || selectedFiles[0]?.file
                        }
                        imageSrc={showSingleFile?.url || selectedFiles[0].url}
                        onCropDone={handleCropDone}
                        setIsCropOpen={setIsCropOpen}
                      />
                    </div>
                  )}

                  {!isCropOpen && (
                    <div className="px-14 mx-auto w-full pt-[20px]">
                      <input
                        ref={inputRef}
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={event =>
                          handleFileChange(event, setSelectedFiles, setIsLoaded)
                        }
                        multiple
                      />

                      <label
                        htmlFor="file-upload"
                        className="bg-[#E93C00] text-white flex items-center justify-center mx-auto cursor-pointer px-4 py-2 border border-[#D9D9D9] rounded-lg">
                        <CustomImage
                          src="/images/camera.svg"
                          alt="Add Icon"
                          className="mr-2"
                        />
                        <span className="font-inter text-14">
                          Add your photos
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default GeneralCheckIn;
