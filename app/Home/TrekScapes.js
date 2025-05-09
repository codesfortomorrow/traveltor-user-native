import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Swiper from 'react-native-swiper';

const TrekScapes = () => {
  const [trekScape, setTrekScape] = useState([
    {
      name: 'Ram',
      trailPoints: 20,
      treksters: 20,
      slug: 'ram',
      previewMedia: ['https://example.com/image.jpg'],
    },
  ]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  //   const fetchTreckScape = useCallback(async (s, isLoad) => {
  //     try {
  //       isLoad && setIsLoading(true);
  //       const response = await getTrekscape(s);
  //       if (response?.data) {
  //         setTrekScape(response?.data);
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }, []);

  useEffect(() => {
    // fetchTreckScape('', true);
  }, []);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (search.length === 0) {
      //   fetchTreckScape();
    }
  }, [search]);

  const handleNavigate = async id => {
    navigate(`/trekscape/${id}`);
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
          }}
          onPress={() => console.log('Explore clicked')}>
          <Image
            source={require('../../public/images/ring-mobile.png')}
            resizeMode="contain"
          />
          <Text style={styles.exploreText}>Explore the Trekscapes</Text>
        </TouchableOpacity>
      </View>

      {/* Swiper Section */}
      <View style={styles.swiperContainer}>
        <Swiper
          autoplay
          autoplayTimeout={3}
          loop
          showsPagination={false}
          onIndexChanged={() => {}}
          height={250}>
          {isLoading
            ? Array.from({length: 3}).map((_, index) => (
                <View key={index} style={styles.slide}>
                  <View style={styles.imagePlaceholder} />
                </View>
              ))
            : trekScape.map((slide, index) => (
                <View key={index} style={styles.slide}>
                  <Image
                    // source={slide.previewMedia[0]}
                    source={require('../../public/images/man.jpg')}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <View style={styles.card}>
                    <Text style={styles.name}>{slide.name}</Text>
                    <View style={styles.infoRow}>
                      <View style={styles.infoCol}>
                        <View style={styles.label}>
                          <Image
                            source={require('../../public/images/trekscapes/spot-black.png')}
                            style={{width: 12, height: 12}}
                          />
                          <Text style={{fontSize: 12}}>
                            {slide.trailPoints} Trail Points
                          </Text>
                        </View>
                        <View style={styles.label}>
                          <Image
                            source={require('../../public/images/trekscapes/treksters-black.png')}
                            style={{width: 12, height: 12}}
                          />
                          <Text style={{fontSize: 12}}>
                            {slide.treksters} Treksters
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleNavigate(slide.slug)}
                        style={styles.exploreBtn}>
                        <Text style={styles.exploreBtnText}>Explore</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
        </Swiper>
      </View>
    </View>
  );
};

export default TrekScapes;

const styles = StyleSheet.create({
  container: {
    paddingTop: 48,
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  searchInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  exploreText: {
    color: '#E93C00',
    fontSize: 14,
    fontWeight: '500',
  },
  swiperContainer: {
    paddingLeft: 16,
    height: 280,
  },
  slide: {
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    height: 230,
    width: '90%',
    borderRadius: 20,
  },
  imagePlaceholder: {
    height: 180,
    width: '90%',
    backgroundColor: '#ccc',
    borderRadius: 20,
  },
  card: {
    marginTop: 10,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    position: 'absolute',
    bottom: -44,
    left: 40,
    right: 40,
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
    color: '#121212',
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCol: {
    flexDirection: 'column',
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    color: '#333',
  },
  exploreBtn: {
    backgroundColor: '#FCE6DE',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E93C00',
  },
  exploreBtnText: {
    color: '#E93C00',
    fontSize: 10,
    fontWeight: '500',
  },
});
