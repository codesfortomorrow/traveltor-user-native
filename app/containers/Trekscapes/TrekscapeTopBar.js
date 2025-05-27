import React, {useEffect, useRef, useState} from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SvgUri, SvgXml} from 'react-native-svg';

const TrekscapeTopBar = ({
  categoryId,
  setCategoryId,
  category,
  setCategorySlug,
}) => {
  const scrollRef = useRef(null);
  const {width} = useWindowDimensions();
  const SCROLL_KEY = 'categoryScrollPosition';

  // Animation value
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loadScroll = async () => {
      const savedScroll = await AsyncStorage.getItem(SCROLL_KEY);
      if (savedScroll && scrollRef.current) {
        setTimeout(() => {
          scrollRef.current.scrollTo({
            x: parseInt(savedScroll, 10),
            animated: false,
          });
        }, 10);
      }
    };
    loadScroll();
  }, [category]);

  useEffect(() => {
    // Start blink animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [blinkAnim]);

  const handleScroll = async event => {
    const x = event.nativeEvent.contentOffset.x;
    await AsyncStorage.setItem(SCROLL_KEY, String(x));
  };

  const itemMinWidth = category?.length <= 5 ? width * 0.2 : width * 0.18;

  const ColoredSvg = ({uri}) => {
    const [svgXml, setSvgXml] = useState(null);

    useEffect(() => {
      const loadSvg = async () => {
        try {
          const res = await fetch(uri);
          let svgText = await res.text();

          const targetColor = '#F53E0D';

          // Replace stroke colors
          svgText = svgText.replace(
            /stroke="[^"]*"/g,
            `stroke="${targetColor}"`,
          );

          // Optionally clear fills to keep outline-only effect
          svgText = svgText.replace(/fill="[^"]*"/g, 'fill="none"');

          setSvgXml(svgText);
        } catch (err) {
          console.error('Error loading SVG:', err);
        }
      };

      loadSvg();
    }, [uri]);

    return svgXml ? <SvgXml xml={svgXml} width={20} height={20} /> : null;
  };

  return (
    <ScrollView
      horizontal
      ref={scrollRef}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsHorizontalScrollIndicator={false}
      style={styles.container}>
      <View style={styles.content}>
        {category?.map((item, index) => {
          const isLive = item.slug === 'live';
          const isActive = item.id == categoryId;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.item, {minWidth: itemMinWidth}]}
              onPress={() => {
                setCategoryId(item.id);
                setCategorySlug(item.slug);
              }}>
              {item.slug === 'live' ? (
                <Image
                  source={item.icon}
                  style={[
                    styles.icon,
                    isActive && !isLive && styles.filterIcon,
                  ]}
                />
              ) : isActive ? (
                <View style={{minHeight: 20}}>
                  <ColoredSvg uri={item?.icon} />
                </View>
              ) : (
                <View style={{minHeight: 20}}>
                  <SvgUri
                    width="20"
                    height="20"
                    uri={item?.icon}
                    color="#000"
                  />
                </View>
              )}
              {isLive ? (
                <Animated.Text
                  style={[
                    styles.label,
                    styles.blinkText,
                    {opacity: blinkAnim},
                    isActive ? styles.activeText : styles.inactiveText,
                  ]}>
                  {item.name}
                </Animated.Text>
              ) : (
                <Text
                  style={[
                    styles.label,
                    isActive ? styles.activeText : styles.inactiveText,
                  ]}>
                  {item.name}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 3,
    zIndex: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  filterIcon: {
    tintColor: '#007e3b',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  blinkText: {
    color: '#000',
  },
  activeText: {
    color: '#e93c00',
  },
  inactiveText: {
    color: '#000',
  },
});

export default TrekscapeTopBar;
