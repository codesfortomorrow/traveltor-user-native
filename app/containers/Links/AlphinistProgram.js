import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Linking,
} from 'react-native';
import BackAndHeading from '../../components/Mobile/Backheading';

const AlpinistProgram = () => {
  const AlpinitesMain = [
    {
      levelCount: '01',
      levelHeading: 'Rookie Stage',
      pera1:
        'At the Rookie Stage, you are starting your journey. Your goal is to explore, onboard new users, and earn points from check-ins. Every member you bring onboard adds value to the growing Treskscapes community.',
      pera2:
        'The progress badges outlines how Trailblazers progress through levels by onboarding new members and achieving specific check-ins. Each milestone earns badges and points, benefiting both the Trailblazer and their on boarder, fostering growth and collaboration.',
      cards: [
        {
          count: '1st Badge',
          heading: 'Trailhead Explorer',
          userCount: 5,
          checkIns: '50',
          points: 265,
        },
        {
          count: '2nd Badge',
          heading: 'Pathfinder',
          userCount: 10,
          checkIns: '100',
          points: 530,
        },
        {
          count: '3rd Badge',
          heading: 'Wayfarer',
          userCount: 15,
          checkIns: '200',
          points: 1045,
        },
        {
          count: '4th Badge',
          heading: 'Horizon Seeker',
          userCount: 25,
          checkIns: '500',
          points: 2575,
        },
        {
          count: '5th Badge',
          heading: 'Milestone Marker',
          userCount: 40,
          checkIns: '1k',
          points: 5120,
        },
      ],
    },
    {
      levelCount: '02',
      levelHeading: 'Adventure Stage',
      pera1:
        'Once you reach the Adventurer Stage, your role as a community leader becomes more impactful. You will continue exploring, but now you also guide and mentor new users, leading them to check-ins and helping grow the Treskscapes community. This is the stage where your efforts as a local ambassador truly start to shine',
      pera2:
        'The progress badges outlines how Trailblazers progress through levels by onboarding new members and achieving specific check-ins. Each milestone earns badges and points, benefiting both the Trailblazer and their on boarder, fostering growth and collaboration.',
      cards: [
        {
          count: '1st Badge',
          heading: 'Check-In Champion',
          userCount: 50,
          checkIns: '1.5k',
          points: 7650,
        },
        {
          count: '2nd Badge',
          heading: 'Trail Guardian',
          userCount: 70,
          checkIns: '2k',
          points: 10210,
        },
        {
          count: '3rd Badge',
          heading: 'Adventure Navigator',
          userCount: 100,
          checkIns: '3k',
          points: 15300,
        },
        {
          count: '4th Badge',
          heading: 'Summit Witness',
          userCount: 120,
          checkIns: '4.5k',
          points: 22860,
        },
        {
          count: '5th Badge',
          heading: 'Pioneer Badge',
          userCount: 150,
          checkIns: '6k',
          points: 30450,
        },
      ],
    },

    {
      levelCount: '03',
      levelHeading: 'Gamechanger Stage',
      pera1:
        'In the Gamechanger Stage, you are a key player in shaping the future of Treskscapes. As an Alpinist, you will lead by example, consistently onboarding new members and driving check-ins. Your influence will help expand the community, reaching new heights in exploration and rewards.',
      pera2:
        'The progress badges outlines how Trailblazers progress through levels by onboarding new members and achieving specific check-ins. Each milestone earns badges and points, benefiting both the Trailblazer and their on boarder, fostering growth and collaboration.',
      cards: [
        {
          count: '1st Badge',
          heading: 'Peak Explorer',
          userCount: 200,
          checkIns: '8k',
          points: 40600,
        },
        {
          count: '2nd Badge',
          heading: 'Adventure Architect',
          userCount: 250,
          checkIns: '10k',
          points: 50750,
        },
        {
          count: '3rd Badge',
          heading: 'Regional Vanguard',
          userCount: 300,
          checkIns: '12.5k',
          points: 63400,
        },
        {
          count: '4th Badge',
          heading: 'Trailblazer Badge',
          userCount: 400,
          checkIns: '15k',
          points: 76200,
        },
        {
          count: '5th Badge',
          heading: 'Check-In Conqueror',
          userCount: 500,
          checkIns: '20k',
          points: 101500,
        },
      ],
    },
    {
      levelCount: '04',
      levelHeading: 'Visionary Stage',
      pera1:
        'At the Visionary Stage, you become a leading figure in the Treskscapes community. Your journey culminates with the highest rewards for your efforts. You are now a global leader, fostering exploration worldwide, and helping expand the community far beyond your assigned city.',
      pera2:
        'The progress badges outlines how Trailblazers progress through levels by onboarding new members and achieving specific check-ins. Each milestone earns badges and points, benefiting both the Trailblazer and their on boarder, fostering growth and collaboration.',
      cards: [
        {
          count: '1st Badge',
          heading: 'Pathmaker',
          userCount: 600,
          checkIns: '25k',
          points: 126800,
        },
        {
          count: '2nd Badge',
          heading: 'Legendary Pathfinder',
          userCount: 800,
          checkIns: '35k',
          points: 177400,
        },
        {
          count: '3rd Badge',
          heading: 'Zenith Keeper',
          userCount: '1k',
          checkIns: '50k',
          points: 253000,
        },
        {
          count: '4th Badge',
          heading: 'Summit Master',
          userCount: '1.5k',
          checkIns: '75k',
          points: 379500,
        },
        {
          count: '5th Badge',
          heading: 'Global Alpinist',
          userCount: '2k',
          checkIns: '100k',
          points: 506000,
        },
      ],
    },
  ];

  const openLink = () => {
    Linking.openURL(
      'https://docs.google.com/forms/d/1JCDh-iVkeD8UtmTmaWOmzIxMVTOcDcIg0qxuhua1RbA/edit',
    );
  };

  return (
    <View style={styles.mainContainer}>
      <BackAndHeading heading={'Alpinist Program'} />
      <ScrollView style={styles.scrollView}>
        <View>
          <ImageBackground
            source={require('../../../public/images/community/Alpinist-program.png')}
            style={styles.headerBackground}>
            <Image
              style={styles.shadowOverlay}
              source={require('../../../public/images/community/Communityimg_Shadow2.png')}
              resizeMode="cover"
            />
            <View style={styles.headerContentContainer}>
              <View style={styles.headerTextTop}>
                <Text style={styles.headerTitle}>
                  Help others join, explore, check-in, earn rewards, and grow.
                </Text>
                <Text style={styles.headerSubtitle}>
                  Alpinists help others join Treskscapes, inspire exploration,
                  encourage check-ins, and earn rewards while building
                  community.
                </Text>
              </View>
              <View style={styles.headerTextBottom}>
                <Text style={styles.headerDescription}>
                  At Treskscapes, each Alpinist is assigned to a specific city.
                  As an Alpinist, your mission is to bring new community members
                  to the platform, foster exploration, and encourage check-ins.
                  With each new user you onboard and every check-in made, you
                  climb through the levels of the program, earning rewards,
                  badges, and recognition. The more you engage, the greater your
                  impact on the community and your rewards.
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.learnSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Learn the program</Text>
          </View>
          <View style={styles.divider} />

          {AlpinitesMain.map((item, index) => (
            <View key={index}>
              <View style={styles.levelContainer}>
                <View style={styles.levelContentContainer}>
                  <View style={styles.levelHeaderContainer}>
                    <Text style={styles.levelCount}>{item?.levelCount}</Text>
                    <Text style={styles.levelHeading}>
                      Level : {item?.levelHeading}
                    </Text>
                  </View>
                  <Text style={styles.paragraphText}>
                    {'         '}
                    {item?.pera1}
                  </Text>
                  <Text style={styles.paragraphText}>
                    {'        '}
                    {item?.pera2}
                  </Text>
                  <View style={styles.cardsContainer}>
                    {item?.cards.map((subItems, cardIndex) => (
                      <View key={cardIndex} style={styles.card}>
                        <View style={styles.cardContent}>
                          <View>
                            <Text style={styles.cardCount}>
                              {subItems?.count}
                            </Text>
                            <Text style={styles.cardHeading}>
                              {subItems?.heading}
                            </Text>
                            <View style={styles.pointsContainer}>
                              <Text style={styles.pointsText}>
                                *{subItems?.points} Points required to achieve
                                the badge
                              </Text>
                            </View>
                          </View>
                          <View>
                            <Text style={styles.unlocksText}>Unlocks at</Text>
                            <View style={styles.statsContainer}>
                              <View style={styles.statItem}>
                                <Text style={styles.statValue}>
                                  {subItems?.userCount}
                                </Text>
                                <Text style={styles.statLabel}>Users</Text>
                              </View>
                              <View style={styles.statItem}>
                                <Text style={styles.statValue}>
                                  {subItems?.checkIns}
                                </Text>
                                <Text style={styles.statLabel}>check-ins</Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              {index !== 3 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <View style={styles.vrsSection}>
          <View style={styles.vrsSectionInner}>
            <View style={styles.vrsContentContainer}>
              <Text style={styles.vrsTitle}>VRS Program 👋</Text>
              <Text style={styles.vrsDescription}>
                Upon reaching the Visionary Stage, Alpinists have the option to
                retire from active exploration and join the Voluntary Retirement
                Scheme (VRS). As a Retired Alpinist, you will receive the VRA
                badge and continue earning rewards based on the check-ins placed
                by the community members you have onboarded. For every 150K
                check-ins placed by the Traveltor community found by the retired
                Alpinist, you will earn a reward of $50. This allows you to keep
                contributing to the community even after retiring while enjoying
                continued benefits from your legacy as a leader.
              </Text>
              <TouchableOpacity style={styles.becomeButton} onPress={openLink}>
                <Text style={styles.becomeButtonText}>Became An Alpinist</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.overviewSection}>
          <View style={styles.overviewSectionInner}>
            <View style={styles.overviewContentContainer}>
              <Text style={styles.overviewTitle}>A Final Overview</Text>
              <Text style={styles.overviewDescription}>
                As an Alpinist, you are not only exploring new destinations but
                also playing a vital role in building the Treskscapes community.
                Each city will have its own Alpinist who will drive user
                engagement, promote check-ins, and expand the community. As an
                Alpinist, you are empowered to guide new users, encourage them
                to explore, and make your city a hub of discovery. The more
                users you bring in, the higher your stage and rewards become,
                making your journey through the program as fulfilling as the
                destinations you explore. Becoming an Alpinist means that your
                influence will help shape the future of travel and exploration
                for others. Keep climbing, keep exploring, and keep expanding
                the Treskscapes community!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  scrollView: {
    height: height - 100,
  },
  headerBackground: {
    height: height * 0.65,
    position: 'relative',
  },
  shadowOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  headerContentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: 40,
    zIndex: 10,
  },
  headerTextTop: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    lineHeight: 19.5,
    color: 'white',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Montserrat',
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 12,
    lineHeight: 14.63,
    fontWeight: '400',
    textAlign: 'center',
    fontFamily: 'Montserrat',
  },
  headerTextBottom: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerDescription: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    color: 'white',
    textAlign: 'center',
  },
  learnSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  sectionTitle: {
    width: '100%',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 36,
    marginBottom: 8,
    color: 'black',
    fontFamily: 'Montserrat',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.44)',
    marginTop: 0,
  },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelContentContainer: {
    flex: 2,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  levelHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  levelCount: {
    fontSize: 32,
    fontWeight: '600',
    fontFamily: 'Montserrat',
    marginRight: 8,
  },
  levelHeading: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat',
  },
  paragraphText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Montserrat',
    color: 'rgba(0,0,0,0.76)',
    lineHeight: 22,
    width: '100%',
  },
  cardsContainer: {
    marginTop: 36,
  },
  card: {
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: 'black',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardCount: {
    fontSize: 12,
    lineHeight: 12,
    fontWeight: '600',
  },
  cardHeading: {
    fontSize: 18,
    fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#E93C00',
    marginTop: 8,
    lineHeight: 25.43,
  },
  pointsContainer: {
    marginTop: 4,
  },
  pointsText: {
    fontSize: 8,
    fontWeight: '600',
  },
  unlocksText: {
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'Inter',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 0,
    gap: 16,
  },
  statItem: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    fontFamily: 'Montserrat',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'black',
    fontFamily: 'Montserrat',
  },
  vrsSection: {
    paddingHorizontal: 20,
    backgroundColor: 'rgba(70, 19, 1, 0.23)',
  },
  vrsSectionInner: {
    display: 'flex',
    flexDirection: 'column',
    paddingVertical: 40,
  },
  vrsContentContainer: {
    width: '100%',
  },
  vrsTitle: {
    fontSize: 24,
    lineHeight: 62,
    color: '#084101',
    marginBottom: 20,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  vrsDescription: {
    color: '#0B0B0B',
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 24,
    marginBottom: 20,
  },
  becomeButton: {
    width: '100%',
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 50,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  becomeButtonText: {
    color: 'white',
  },
  overviewSection: {
    paddingHorizontal: 20,
  },
  overviewSectionInner: {
    display: 'flex',
    flexDirection: 'column',
    paddingVertical: 40,
  },
  overviewContentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  overviewTitle: {
    fontSize: 24,
    lineHeight: 62,
    marginBottom: 20,
    fontWeight: '600',
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  overviewDescription: {
    color: '#0B0B0B',
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default AlpinistProgram;
