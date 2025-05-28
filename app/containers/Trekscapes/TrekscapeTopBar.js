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

  // const ColoredSvg = ({uri}) => {
  //   console.log({uri});
  //   const [svgXml, setSvgXml] = useState(null);

  //   useEffect(() => {
  //     const loadSvg = async () => {
  //       try {
  //         const res = await fetch(uri);
  //         let svgText = await res.text();

  //         const targetColor = '#F53E0D';

  //         // Replace stroke colors
  //         svgText = svgText.replace(
  //           /stroke="[^"]*"/g,
  //           `stroke="${targetColor}"`,
  //         );

  //         // Optionally clear fills to keep outline-only effect
  //         // svgText = svgText.replace(/fill="[^"]*"/g, 'fill="none"');

  //         setSvgXml(svgText);
  //       } catch (err) {
  //         console.error('Error loading SVG:', err);
  //       }
  //     };

  //     loadSvg();
  //   }, [uri]);

  //   return svgXml ? <SvgXml xml={svgXml} width={20} height={20} /> : null;
  // };

  const ColoredSvg = ({uri}) => {
    const [svgXml, setSvgXml] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
      const loadSvg = async () => {
        setIsLoading(true);
        setHasError(false);

        try {
          const res = await fetch(uri);

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }

          let svgText = await res.text();

          const targetColor = '#F53E0D';

          if (!svgText.includes('<svg') && !svgText.includes('<SVG')) {
            throw new Error('Response is not valid SVG');
          }

          const originalSvg = svgText;

          // Analyze the SVG structure
          const hasStrokeAttr = /stroke="[^"]*"/g.test(svgText);
          const hasStrokeStyle = /stroke\s*:/g.test(svgText);
          const hasFillAttr = /fill="[^"]*"/g.test(svgText);
          const hasFillStyle = /fill\s*:/g.test(svgText);
          const hasNoneFill = /fill="none"/g.test(svgText);
          const hasCurrentColor = /currentColor/gi.test(svgText);

          // Strategy 1: Handle currentColor first (most reliable)
          if (hasCurrentColor) {
            console.log('Using currentColor strategy');
            svgText = svgText.replace(/currentColor/gi, targetColor);
          }
          // Strategy 2: Filled icons
          else if (hasFillAttr && !hasNoneFill && !hasStrokeAttr) {
            svgText = svgText.replace(
              /fill="(?!none)[^"]*"/g,
              `fill="${targetColor}"`,
            );
            svgText = svgText.replace(
              /fill\s*:\s*(?!none)[^;]+/gi,
              `fill: ${targetColor}`,
            );
          }
          // Strategy 3: Stroked icons
          else if (hasStrokeAttr || hasStrokeStyle) {
            svgText = svgText.replace(
              /stroke="[^"]*"/g,
              `stroke="${targetColor}"`,
            );
            svgText = svgText.replace(
              /stroke\s*:\s*[^;]+/gi,
              `stroke: ${targetColor}`,
            );
            // Clear fills for outline effect
            svgText = svgText.replace(/fill="(?!none)[^"]*"/g, 'fill="none"');
          }
          // Strategy 4: No clear color attributes - try to add stroke
          else {
            // Add stroke to common drawing elements
            const elements = [
              'path',
              'circle',
              'rect',
              'ellipse',
              'polygon',
              'polyline',
              'line',
            ];
            elements.forEach(element => {
              const regex = new RegExp(`<${element}([^>]*?)>`, 'gi');
              svgText = svgText.replace(regex, (match, attrs) => {
                if (
                  !attrs.includes('stroke') &&
                  !attrs.includes('fill') &&
                  !attrs.includes('style')
                ) {
                  return `<${element}${attrs} stroke="${targetColor}" fill="none">`;
                }
                return match;
              });
            });
          }

          // Handle style attributes comprehensively
          svgText = svgText.replace(/style="([^"]*?)"/gi, (match, styles) => {
            let newStyles = styles;

            // Replace stroke in styles
            if (newStyles.includes('stroke:')) {
              newStyles = newStyles.replace(
                /stroke\s*:\s*[^;]+/gi,
                `stroke: ${targetColor}`,
              );
            }

            // Replace fill in styles (but preserve none)
            if (
              newStyles.includes('fill:') &&
              !newStyles.includes('fill: none') &&
              !newStyles.includes('fill:none')
            ) {
              newStyles = newStyles.replace(
                /fill\s*:\s*[^;]+/gi,
                `fill: ${targetColor}`,
              );
            }

            return `style="${newStyles}"`;
          });

          setSvgXml(svgText);
          setIsLoading(false);
        } catch (err) {
          console.error('Error loading/processing SVG:', err);
          setHasError(true);
          setIsLoading(false);
        }
      };

      loadSvg();
    }, [uri]);

    // Loading state
    if (isLoading) {
      return (
        <View
          style={{
            width: 20,
            height: 20,
            backgroundColor: '#f0f0f0',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{fontSize: 8, color: '#666'}}>...</Text>
        </View>
      );
    }

    // Error state - show colored square
    if (hasError || !svgXml) {
      return (
        <View
          style={{
            width: 20,
            height: 20,
            borderWidth: 1,
            borderColor: '#F53E0D',
            backgroundColor: 'transparent',
          }}
        />
      );
    }

    // Success state
    return <SvgXml xml={svgXml} width={20} height={20} />;
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
