import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {Linking} from 'react-native';
import Backheading from '../../components/Mobile/Backheading';

// Simple dot icon for lists
const DotIcon = () => {
  return <Text style={styles.dotIcon}>•</Text>;
};

// React icons replacement
const reactIcons = {
  dot: <DotIcon />,
};

const Community = () => {
  return (
    <>
      <Backheading heading={'Community'} />
      <ScrollView style={styles.container}>
        {/* Hero Section */}
        <View>
          <ImageBackground
            source={require('../../../public/images/community/CommunityimgB.png')}
            style={styles.heroBg}>
            <Image
              style={styles.heroShadow}
              source={require('../../../public/images/community/Communityimg_Shadow2.png')}
            />
            <View style={styles.heroContent}>
              <View style={styles.heroTextTop}>
                <Text style={styles.heroTitle}>
                  Welcome to the Traveltor Community: Where Explorers Shape the
                  Future
                </Text>
                <Text style={styles.heroSubtitle}>
                  Here, The community decides, The community gives, and The
                  community earns.
                </Text>
              </View>
              <View style={styles.heroTextBottom}>
                <Text style={styles.heroParagraph}>
                  At Traveltor, we believe in the power of community. Together,
                  we're not just travelors—we're creators, adventurers, and
                  innovators. This is your space to connect with like-minded
                  explorers, and decide the direction of our collective journey.
                  Whether it's crafting new Trekscapes , voting for your
                  favorite destinations, or earning rewards, your voice matters.
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Why Join Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Why Join the Traveltor Community?
            </Text>
          </View>
          <View style={styles.divider} />

          {/* Card 1 */}
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardNumber}>01</Text>
                <Text style={styles.cardTitle}>Shape the Adventure</Text>
              </View>
              <Text style={styles.cardText}>
                Do you dream of discovering new destinations? With Traveltor,
                you don't just explore — you help create. Suggest Trekscapes
                that inspire you, and watch as the community votes to bring them
                to life. This is your chance to turn dream treks into real
                programs for everyone to enjoy.
              </Text>
              <Text style={styles.cardHighlight}>
                Your adventure ideas, brought to life by us all.
              </Text>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Card 2 */}
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardNumber}>02</Text>
                <Text style={styles.cardTitle}>Vote for the Next Big Trek</Text>
              </View>
              <Text style={styles.cardText}>
                Our platform thrives on collaboration. When the Traveltor team
                introduces new Trekscapes , it's the community that decides what
                gets featured. Your votes shape the programs, ensuring that the
                adventures we offer are ones you truly want to experience.
              </Text>
              <Text style={styles.cardHighlight}>
                Because the best journeys are chosen together.
              </Text>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Card 3 */}
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardNumber}>03</Text>
                <Text style={styles.cardTitle}>Earn Rewards as You Go</Text>
              </View>
              <Text style={styles.cardText}>
                Every journey with Traveltor is more than an adventure—it's an
                opportunity to earn. Validate your travels, collect exclusive
                Trekcards, and unlock exciting rewards. The more you contribute
                to the community, the greater your rewards. Together, we build a
                system where everyone benefits.
              </Text>
              <Text style={styles.cardHighlight}>
                Travel, validate, and earn — powered by you.
              </Text>
            </View>
          </View>
        </View>

        {/* Platform Section */}
        <View style={styles.platformContainer}>
          <View style={styles.platformContent}>
            <ImageBackground
              source={{uri: 'community/platform-bg.png'}}
              style={styles.platformBg}>
              <View style={styles.platformTextContainer}>
                <Text style={styles.platformTitle}>
                  A Community-First Platform
                </Text>
                <Text style={styles.platformText}>
                  At Traveltor, you're not just a user—you're a key part of
                  something bigger. Every suggestion you make, every vote you
                  cast, and every adventure you validate shapes the future of
                  our platform and you get a better performance score. This is a
                  space built by travelors, for travelors, where everyone's
                  input is valued and rewarded.
                </Text>
              </View>
            </ImageBackground>
          </View>
        </View>

        {/* Journey Section */}
        <View style={styles.journeyContainer}>
          <View style={styles.journeyHeader}>
            <Text style={styles.journeyTitle}>
              The Traveltor Community Journey: Step-by-Step
            </Text>
            <Text style={styles.journeySubtitle}>
              At Traveltor, every community member has a role in shaping the
              future of exploration. Here's how you can embark on your community
              journey and contribute to the platform's evolution:
            </Text>
          </View>

          {/* Steps */}
          {/* Step 1 */}
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              1. Join the Traveltor Community
            </Text>
            <Text style={styles.stepText}>
              Step 1: Sign up and become part of the Traveltor community.
            </Text>
            <Text style={styles.stepText}>
              What's Next: Join a global network of adventurers passionate about
              exploration, rewards, and collaboration
            </Text>
          </View>
          <View style={styles.stepDivider} />

          {/* Step 2 */}
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>2. Become a Member</Text>
            <Text style={styles.stepText}>
              Step 2: As a member, explore existing Trekscapes on the platform.
            </Text>
            <Text style={styles.stepText}>
              What's Next: Validate your travels and start earning exciting
              rewards as you track your journey.
            </Text>
          </View>
          <View style={styles.stepDivider} />

          {/* Step 3 */}
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>3. Explore and Suggest</Text>
            <Text style={styles.stepText}>
              Step 3: While exploring Trekscapes , you might discover a
              destination you think should be featured.
            </Text>
            <Text style={styles.stepText}>
              What's Next: Drop your suggestion for a new Trekscape in the{' '}
              <Text style={styles.boldText}>Suggestion Box</Text>. This will be
              reviewed by <Text style={styles.boldText}>Global Alpinists</Text>{' '}
              for consideration.
            </Text>
          </View>
          <View style={styles.stepDivider} />

          {/* Step 4 */}
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              4. Global Alpinist Review and Voting
            </Text>
            <Text style={styles.stepText}>
              Step 4: Once your suggestion is reviewed, Global Alpinists will
              create a voting session for the community.
            </Text>

            <View style={styles.listItem}>
              {reactIcons.dot}
              <Text style={styles.listItemText}>
                <Text style={styles.boldText}>Community Vote:</Text> The
                community votes on whether the Trekscape should be added.
              </Text>
            </View>
            <View style={styles.listItem}>
              {reactIcons.dot}
              <Text style={styles.listItemText}>
                <Text style={styles.boldText}>Reward Airdrop:</Text> If your
                suggestion is selected, you will receive an exclusive airdrop as
                a reward for your contribution.
              </Text>
            </View>
          </View>
          <View style={styles.stepDivider} />

          {/* Step 5 */}
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>5. Become an Alpinist</Text>
            <Text style={styles.stepText}>
              Step 5: Want to contribute more? Click the Become an Alpinist
              button to elevate your role.
            </Text>
            <Text style={styles.boldText}>What's Next:</Text>
            <View style={styles.listItem}>
              {reactIcons.dot}
              <Text style={styles.listItemText}>
                Engage with new members and help guide their journey.
              </Text>
            </View>
            <View style={styles.listItem}>
              {reactIcons.dot}
              <Text style={styles.listItemText}>
                Take part in decision-making and vote on Trekscapes.
              </Text>
            </View>
            <View style={styles.listItem}>
              {reactIcons.dot}
              <Text style={styles.listItemText}>
                Expand the platform by inviting others to join.
              </Text>
            </View>
          </View>
          <View style={styles.stepDivider} />

          {/* Step 6 */}
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              6. Shape the Trekscape Ecosystem
            </Text>
            <Text style={styles.stepText}>
              Step 6: As an Alpinist, you gain the power to influence which
              Trekscapes stay on the platform.
            </Text>

            <View style={styles.listItem}>
              {reactIcons.dot}
              <Text style={styles.listItemText}>
                <Text style={styles.boldText}>Upvotes and Downvotes:</Text> Vote
                on the relevance of Trekscapes and decide which ones should be
                featured or removed.
              </Text>
            </View>
            <View style={styles.listItem}>
              {reactIcons.dot}
              <Text style={styles.listItemText}>
                <Text style={styles.boldText}>What's Next:</Text> Ensure only
                the most valuable and engaging Trekscapes are accessible to the
                community.
              </Text>
            </View>
          </View>
        </View>

        {/* Collaboration Section */}
        <View style={styles.platformContainer}>
          <View style={styles.platformContent}>
            <ImageBackground
              source={{uri: 'community/collaboration-bg.png'}}
              style={styles.platformBg}>
              <View style={styles.platformTextContainer}>
                <Text style={styles.platformTitle}>
                  The Power of Collaboration
                </Text>
                <View style={styles.listItem}>
                  {reactIcons.dot}
                  <Text style={styles.collaborationText}>
                    <Text style={styles.boldWhiteText}>Conclusion:</Text> At
                    Traveltor, your journey isn't just about exploring—it's
                    about collaborating, sharing, and rewarding each other.
                  </Text>
                </View>
                <View style={styles.listItem}>
                  {reactIcons.dot}
                  <Text style={styles.collaborationText}>
                    <Text style={styles.boldWhiteText}>
                      Together, We Evolve:
                    </Text>{' '}
                    As a community, we decide what makes the platform thrive.
                    From suggesting new Trekscapes to shaping the ecosystem,
                    every step you take impacts the future of exploration.
                  </Text>
                </View>
              </View>
            </ImageBackground>
          </View>
        </View>

        {/* Shaping Traveltor Section */}
        <View style={styles.shapingContainer}>
          <Text style={styles.shapingTitle}>
            Shaping Traveltor: Founders, Alpinists, and Community Members
          </Text>
          <Text style={styles.shapingHeading}>
            The Heart of Traveltor: Our Community
          </Text>
          <Text style={styles.shapingText}>
            Community members are the heartbeat of Traveltor, shaping its
            vibrant ecosystem. Every contribution—from exploring Trekscapes and
            suggesting new destinations to voting and validating treks—fuels the
            platform's growth. The more you participate, the more you earn
            through trekcard, rewards, and exclusive airdrops. Active members
            can even elevate their role by becoming Alpinists, gaining the power
            to influence Trekscape decisions, invite others, and unlock greater
            growth opportunities. At Traveltar, every action you take
            strengthens the community and brings unparalleled rewards!
          </Text>
          <Text style={styles.communityHighlight}>
            The more you give, the more you receive—this is the power of
            community.
          </Text>

          <Text style={styles.shapingHeading}>Become an Alpinist</Text>
          <Text style={styles.shapingText}>
            Elevate your involvement with Traveltor by becoming an Alpinist. As
            an Alpinist, you gain a powerful role in shaping the platform's
            future. You can invite new members, guide them on their journey, and
            earn more opportunities & referrer rewards towards contribute and
            grow. You also gain the ability to vote on Trekscapes —upvoting or
            downvoting based on their relevance to the community. Your decisions
            directly impact which Trekscapes remain on the platform, ensuring
            that only the best trails are featured. Become an Alpinist and help
            build the future of exploration!
          </Text>
          <Text style={styles.communityHighlight}>
            The more you give, the more you receive—this is the power of
            community.
          </Text>

          <TouchableOpacity
            style={styles.alpinistButton}
            onPress={() =>
              Linking.openURL(
                'https://docs.google.com/forms/d/1JCDh-iVkeD8UtmTmaWOmzIxMVTOcDcIg0qxuhua1RbA/edit',
              )
            }>
            <Text style={styles.buttonText}>Lead the Way – Be an Alpinist</Text>
          </TouchableOpacity>

          <Text style={styles.foundersTitle}>
            <Text style={styles.underline}>Founder Members:</Text>{' '}
            <Text>The Core Pillars of Traveltor</Text>
          </Text>

          <Text style={styles.shapingText}>
            The Founder Members of Traveltar are the core of our platform,
            turning vision into reality. With transparency and collaboration at
            their heart, these 12 leaders ensure every decision aligns with
            community values. Their dedication fosters innovation, growth, and a
            thriving ecosystem where adventurers can explore, connect, and
            contribute globally.
          </Text>
        </View>

        {/* Join Us Section */}
        <View style={styles.joinContainer}>
          <View style={styles.joinContent}>
            <Text style={styles.joinTitle}>Join us today 👋</Text>
            <Text style={styles.joinText}>
              Ready to be part of a revolutionary travel community? Join
              Traveltor and make your mark. Together, we'll create a world of
              exploration, validation, and rewards that's driven by passion and
              collaboration
            </Text>
            <Text style={styles.joinSubtitle}>
              The journey is better when we take it together.
            </Text>
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => Linking.openURL('https://t.me/traveltorsocial')}>
              <Text style={styles.buttonText}>Join Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  customImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dotIcon: {
    fontSize: 20,
    marginRight: 5,
    marginTop: 5,
  },
  // Hero Section
  heroBg: {
    height: windowHeight,
    position: 'relative',
    overflow: 'hidden',
  },
  heroShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: '100%',
    width: '100%',
  },
  heroContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: 40,
    zIndex: 10,
    position: 'relative',
  },
  heroTextTop: {
    width: '100%',
    padding: 16,
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginBottom: 16,
    fontFamily: 'Montserrat',
  },
  heroSubtitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'normal',
    fontFamily: 'Montserrat',
  },
  heroTextBottom: {
    width: '100%',
    padding: 16,
    textAlign: 'center',
  },
  heroParagraph: {
    fontSize: 12,
    lineHeight: 22,
    fontWeight: 'normal',
    color: 'white',
  },

  // Section Container
  sectionContainer: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  sectionTitle: {
    width: '100%',
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Montserrat',
    marginBottom: 8,
    color: 'black',
  },
  divider: {
    borderBottomColor: 'rgba(0, 0, 0, 0.44)',
    borderBottomWidth: 1,
    marginTop: 0,
  },

  // Cards
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 0,
  },
  cardContent: {
    flex: 2,
    height: 'auto',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  cardNumber: {
    fontFamily: 'Montserrat',
    fontSize: 32,
    fontWeight: '600',
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat',
  },
  cardText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: 'rgba(0, 0, 0, 0.76)',
    lineHeight: 22,
    width: '100%',
    paddingVertical: 0,
  },
  cardHighlight: {
    fontSize: 18,
    fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#E83B00',
    marginTop: 8,
    lineHeight: 23,
  },

  // Platform Section
  platformContainer: {
    marginVertical: 40,
    paddingHorizontal: 0,
  },
  platformContent: {
    backgroundColor: '#E93C00',
    height: 541,
    position: 'relative',
    overflow: 'hidden',
  },
  platformBg: {
    flex: 1,
    justifyContent: 'center',
  },
  platformTextContainer: {
    flex: 1,
    gap: 40,
    justifyContent: 'center',
    flexDirection: 'column',
    padding: 16,
    zIndex: 10,
    position: 'relative',
  },
  platformTitle: {
    fontSize: 40,
    fontFamily: 'Montserrat',
    fontWeight: '600',
    color: 'white',
    lineHeight: 50,
  },
  platformText: {
    fontSize: 14,
    lineHeight: 30,
    fontFamily: 'Montserrat',
    fontWeight: '500',
    color: 'white',
  },

  // Journey Section
  journeyContainer: {
    marginVertical: 40,
    paddingHorizontal: 16,
    position: 'relative',
  },
  journeyHeader: {
    paddingVertical: 0,
  },
  journeyTitle: {
    fontSize: 22,
    lineHeight: 32,
    fontFamily: 'Montserrat',
    fontWeight: '600',
    marginBottom: 20,
  },
  journeySubtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat',
    color: '#161616',
    fontWeight: '500',
  },
  stepContainer: {
    marginTop: 16,
  },
  stepTitle: {
    fontSize: 18,
    marginTop: 0,
    fontFamily: 'Montserrat',
    fontWeight: '600',
    marginBottom: 8,
    paddingLeft: 12,
    lineHeight: 23,
  },
  stepText: {
    fontSize: 14,
    color: '#444444',
    fontFamily: 'Montserrat',
    fontWeight: 'normal',
    marginBottom: 8,
    lineHeight: 30,
  },
  stepDivider: {
    borderBottomColor: '#F4D8CF',
    borderBottomWidth: 1,
    marginVertical: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Montserrat',
    fontWeight: 'normal',
    color: '#444444',
    lineHeight: 30,
  },
  boldText: {
    fontWeight: '500',
  },
  boldWhiteText: {
    fontWeight: '600',
    color: 'white',
  },
  collaborationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Montserrat',
    fontWeight: '500',
    color: 'white',
    lineHeight: 30,
  },

  // Shaping Traveltor Section
  shapingContainer: {
    marginVertical: 40,
    paddingHorizontal: 16,
    position: 'relative',
  },
  shapingTitle: {
    fontSize: 22,
    lineHeight: 32,
    fontFamily: 'Montserrat',
    fontWeight: '600',
    marginBottom: 20,
  },
  shapingHeading: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#000000',
    marginTop: 0,
    marginBottom: 16,
  },
  shapingText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.76)',
    fontWeight: '500',
    fontFamily: 'Montserrat',
    lineHeight: 28,
    marginVertical: 8,
    marginBottom: 20,
  },
  communityHighlight: {
    color: '#E83B00',
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  alpinistButton: {
    width: '100%',
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  foundersTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat',
    fontWeight: '600',
    color: '#000000',
    marginTop: 20,
    marginBottom: 20,
  },
  underline: {
    textDecorationLine: 'underline',
  },

  // Join Section
  joinContainer: {
    backgroundColor: 'rgba(70, 19, 1, 0.23)',
    position: 'relative',
    paddingBottom: 40,
  },
  joinContent: {
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  joinTitle: {
    fontSize: 24,
    lineHeight: 62,
    marginBottom: 20,
    fontWeight: '600',
    fontFamily: 'Poppins',
    color: '#E83B00',
  },
  joinText: {
    color: '#0B0B0B',
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 30,
    marginBottom: 20,
  },
  joinSubtitle: {
    color: '#0B0B0B',
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '500',
    marginBottom: 12,
  },
  joinButton: {
    width: '100%',
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 50,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Community;
