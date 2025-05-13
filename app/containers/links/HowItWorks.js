import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {StyleSheet} from 'react-native';
import Swiper from 'react-native-swiper';
import Backheading from '../../components/Mobile/Backheading';

const {width, height} = Dimensions.get('window');

const HowItWorks = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const imagesAll = [
    require('../../../public/images/how-it-work/1.png'),
    require('../../../public/images/how-it-work/2.png'),
    require('../../../public/images/how-it-work/3.png'),
    require('../../../public/images/how-it-work/4.png'),
    require('../../../public/images/how-it-work/5.png'),
    require('../../../public/images/how-it-work/6.png'),
    require('../../../public/images/how-it-work/7.png'),
    require('../../../public/images/how-it-work/8.png'),
    require('../../../public/images/how-it-work/9.png'),
    require('../../../public/images/how-it-work/10.png'),
  ];

  const data = [
    {
      title: '1. Join the Community',
      paragraph:
        'Start your adventure by signing up on Traveltor. Create an account easily with your email, mobile number, or wallet integration. Once registered, stake tokens to access exclusive travel programs and gain the tools to enhance your exploration.',
    },
    {
      title: '2. Explore Unique Trekscapes',
      paragraph:
        'Traveltor offers a variety of Trekscapes designed for all kinds of explorers. These Trekscapes are programs made up of carefully selected destinations and mapped trails. Whether you are looking for an exhilarating challenge or a serene getaway, there is a program that fits your aspirations. Each program provides an interactive map highlighting the key locations you need to visit, ensuring you stay on track throughout your journey.',
    },
    {
      title: '3. Validate Your Travels',
      paragraph:
        'When you reach a designated spot in your chosen program, confirm your visit by using the "Check-in" button. To successfully validate your presence, ensure you are within a 20-meter range of the spot. This step verifies your progress and moves you closer to completing the program, turning every destination into a memorable milestone.',
    },
    {
      title: '4. Earn Exciting Rewards',
      paragraph:
        'Upon completing all the locations in a program, you will unlock special rewards. These rewards may include tokens, event discounts, or exclusive offers that make your travel experience even more fulfilling. Traveltor ensures that your commitment to exploration is recognized and rewarded at every step.',
    },
    {
      title: '5. Suggest New Trekscapes',
      paragraph:
        'Have an idea for an exciting trek space or destination thats not yet on the platform? You can suggest it through the community suggestion box. Your input will be reviewed by Traveltors Global Alpinists, who will create a community vote to determine its inclusion. If your suggestion is approved, it becomes part of the platform, and you will receive a special reward as a token of appreciation.',
    },
    {
      title: '6. Become a Global Alpinist',
      paragraph:
        'Want to take your involvement to the next level? Apply to become a Global Alpinist. Alpinists are key contributors who curate Trekscapes, evaluate new suggestions, and make decisions that shape the platforms future. They also have the power to upvote or downvote trekscapes and trail points, ensuring the content remains relevant and engaging. Alpinists can also invite new members to the platform, creating opportunities to expand the community while enjoying additional earning opportunities themselves.',
    },
    {
      title: '7. Stay Engaged and Earn More',
      paragraph:
        'Active participation on Traveltor opens doors to endless opportunities. Complete more programs, suggest innovative ideas, and take part in community votes to keep the platform dynamic and evolving. Share your tokens with friends to enable their journeys and rise on the leaderboard to showcase your travel accomplishments.',
    },
    {
      title: '8. Collaborate with the Community',
      paragraph:
        'Traveltor thrives on community input. From suggesting new destinations to voting on trekscapes, every member has a say. Together, users and Alpinists ensure that the platform grows and remains vibrant, innovative, and inclusive.',
    },
    {
      title: '9. Daily Check-in',
      paragraph:
        'Stay connected with Traveltar by completing daily check-ins. While these check-ins don not offer rewards, they help you maintain an active presence on the platform. Use this opportunity to explore its features, stay updated, and immerse yourself in the community. Even when you are not actively trekking, daily check-ins keep you aligned with your travel aspirations and ensure you are always a part of the adventure-driven experience Traveltar offers.',
    },
    {
      title: '10. Earn Tokens',
      paragraph:
        'Users can earn tokens effortlessly by joining Traveltars official Telegram channel. Stay connected with the community, receive updates on programs and rewards, and engage in discussions with fellow adventurers. Its a simple way to enhance your platform experience while staying informed about exciting opportunities and features that Traveltar offers.',
    },
  ];

  return (
    <SafeAreaView style={styles.main}>
      <Backheading heading={'How It Works'} />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          <View style={styles.contentGrid}>
            <View style={styles.contentContainer}>
              <Text style={styles.introText}>
                At Traveltor, we make travel more meaningful by connecting
                adventurers with curated experiences, rewards, and an active
                community. Here's how you can join the platform and turn your
                journeys into milestones:
              </Text>

              <View style={styles.phoneContainer}>
                {/* Camera Section */}
                <View style={styles.camera}>
                  {/* Camera Lens */}
                  <View style={styles.cameraLens}></View>
                </View>

                {/* Swiper Section */}
                <Swiper
                  style={styles.swiper}
                  showsPagination={false}
                  autoplay={true}
                  autoplayTimeout={5}
                  onIndexChanged={index => setActiveIndex(index)}>
                  {imagesAll?.map((image, index) => (
                    <View key={index} style={styles.slideContainer}>
                      <Image
                        source={image}
                        style={styles.slideImage}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </Swiper>
              </View>

              <Text style={styles.title}>{data[activeIndex]?.title}</Text>
              <Text style={styles.paragraph}>
                {data[activeIndex]?.paragraph}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    minHeight: height * 0.95,
  },
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'white',
    height: height - 100,
  },
  scrollView: {
    flex: 1,
  },
  contentGrid: {
    paddingVertical: 40,
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  introText: {
    color: 'black',
    fontSize: 14,
    fontFamily: 'Inter',
    lineHeight: 18,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  phoneContainer: {
    width: 308,
    height: 530,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: 'black',
    borderRadius: 29,
    backgroundColor: 'white',
    position: 'relative',
    zIndex: 0,
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{translateX: -35}],
    width: 70,
    height: 10,
    backgroundColor: 'black',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    zIndex: 10,
  },
  cameraLens: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{translateX: -3}],
    width: 6,
    height: 6,
    backgroundColor: 'white',
    borderRadius: 3,
  },
  swiper: {
    height: 506,
    width: 293,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideImage: {
    width: 293,
    height: 506,
    borderRadius: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: 'normal',
    marginTop: 40,
    marginBottom: 20,
    lineHeight: 24,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  paragraph: {
    color: 'black',
    fontSize: 18,
    fontFamily: 'Inter',
    lineHeight: 26,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontWeight: '300',
  },
});

export default HowItWorks;
