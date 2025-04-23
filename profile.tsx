import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { AbilityRadarChart } from '@/components/profile/AbilityRadarChart';
import { ClubInformation } from '@/components/profile/ClubInformation';
import { PlayerRecommendations } from '@/components/profile/PlayerRecommendations';
import { SkillsSection } from '@/components/profile/SkillsSection';
import { useAuthStore } from '@/store/auth-store';
import { useMatchStore } from '@/store/match-store';
import { useChatStore } from '@/store/chat-store';
import { users } from '@/mocks/users';
import colors from '@/constants/colors';
import { User, Skill, Strategy, Ability, Club, Recommendation } from '@/types';
import api from '@/api';

// Mock data for new components
const mockAbilities: Ability[] = [
  { name: 'Potting', value: 8 },
  { name: 'Positioning', value: 7 },
  { name: 'Safety Play', value: 9 },
  { name: 'Break Building', value: 6 },
  { name: 'Concentration', value: 8 },
  { name: 'Tactical Play', value: 7 },
];

const mockClubs: Club[] = [
  {
    id: '1',
    name: 'London Snooker Club',
    location: 'London, UK',
    memberSince: 'January 2020',
    role: 'Senior Member',
    achievements: [
      'Club Championship Runner-up 2021',
      'Highest break in monthly tournament (143)'
    ],
    memberCount: 120,
    website: 'https://londonsnookerclub.com'
  },
  {
    id: '2',
    name: 'Elite Cue Sports Academy',
    location: 'Manchester, UK',
    memberSince: 'March 2022',
    memberCount: 85
  }
];

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    text: 'An exceptional player with great sportsmanship. Always a pleasure to play against and learn from.',
    date: 'May 15, 2023',
    likes: 12,
    userLiked: true
  },
  {
    id: '2',
    userId: '3',
    userName: 'Michael Chen',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    rating: 4,
    text: 'Solid technical skills and great strategic thinking. Helped me improve my safety play significantly.',
    date: 'February 3, 2023',
    likes: 8,
    userLiked: false
  }
];

// Fixed the type issue by using specific string literals for level
const mockSkills: Skill[] = [
  {
    id: '1',
    name: 'Long Potting',
    level: 'expert',
    endorsements: 24
  },
  {
    id: '2',
    name: 'Safety Play',
    level: 'advanced',
    endorsements: 18
  },
  {
    id: '3',
    name: 'Break Building',
    level: 'intermediate',
    endorsements: 12
  },
  {
    id: '4',
    name: 'Positional Play',
    level: 'advanced',
    endorsements: 15
  }
];

const mockStrategies: Strategy[] = [
  {
    id: '1',
    title: 'Effective Safety Play Techniques',
    description: 'A detailed guide on how to develop and execute safety shots in different table situations. Includes common patterns and decision-making framework.'
  },
  {
    id: '2',
    title: 'Break Building Patterns',
    description: 'My approach to constructing breaks efficiently, focusing on key ball positions and shot selection to maximize scoring opportunities.'
  }
];

export default function ProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user: currentUser, updateProfile, checkAuth } = useAuthStore();
  const { createMatch } = useMatchStore();
  const { createChat, setActiveChat } = useChatStore();
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ensure we have the latest auth state
  useEffect(() => {
    checkAuth();
  }, []);
  
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, this would use the API:
        // let userData;
        // if (userId) {
        //   userData = await api.users.getUserById(userId);
        // } else {
        //   userData = await api.users.getCurrentUser();
        // }
        // setProfileUser(userData);
        
        // For now, we'll just use our mock data
        let foundUser: User | undefined;
        
        if (userId) {
          foundUser = users.find(u => u.id === userId);
        } else if (currentUser) {
          // If no userId provided and we have a current user, show current user's profile
          foundUser = currentUser;
        }
        
        if (foundUser) {
          setProfileUser(foundUser);
          
          // Check if current user is connected to this user
          if (currentUser && currentUser.connections) {
            setIsConnected(currentUser.connections.includes(foundUser.id));
          }
        } else {
          setError('User not found');
        }
        
        // Simulate network delay
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to load profile');
        setIsLoading(false);
      }
    };
    
    // Only fetch if we have a userId or currentUser
    if (userId || currentUser) {
      fetchUser();
    } else {
      setIsLoading(false);
      setError('No user information available');
    }
  }, [userId, currentUser]);
  
  const handleConnect = async () => {
    if (!currentUser || !profileUser) return;
    
    try {
      if (isConnected) {
        // In a real app, this would use the API:
        // await api.users.removeConnection(profileUser.id);
        
        // Remove connection
        const updatedConnections = currentUser.connections.filter(id => id !== profileUser.id);
        
        await updateProfile({
          ...currentUser,
          connections: updatedConnections
        });
        
        setIsConnected(false);
      } else {
        // In a real app, this would use the API:
        // await api.users.addConnection(profileUser.id);
        
        // Add connection
        const updatedConnections = [...currentUser.connections, profileUser.id];
        
        await updateProfile({
          ...currentUser,
          connections: updatedConnections
        });
        
        // Create a match request
        await createMatch({
          requesterId: currentUser.id,
          receiverId: profileUser.id,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error connecting with user:', error);
      Alert.alert('Error', 'Failed to update connection');
    }
  };
  
  const handleMessage = async () => {
    if (!currentUser || !profileUser) return;
    
    try {
      // In a real app, this would use the API:
      // const chatData = await api.chats.createChat([currentUser.id, profileUser.id], false);
      
      // Create a new chat
      const newChat = createChat({
        participantIds: [currentUser.id, profileUser.id],
        isGroup: false,
        name: '',
        createdAt: new Date().toISOString(),
        creatorId: currentUser.id,
        lastMessageAt: new Date().toISOString()
      });
      
      // Set active chat
      if (newChat) {
        setActiveChat(newChat);
        
        // Navigate to the chat screen
        router.push({
          pathname: '/(tabs)/network',
          params: { openChat: newChat.id }
        });
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('Error', 'Failed to create chat');
    }
  };
  
  const handleEditProfile = () => {
    Alert.alert(
      "Edit Profile",
      "This would open a profile editor in a real app",
      [{ text: "OK" }]
    );
  };

  const handleEditAbilities = () => {
    Alert.alert(
      "Edit Abilities",
      "This would open an ability editor in a real app",
      [{ text: "OK" }]
    );
  };

  const handleEditClubs = () => {
    Alert.alert(
      "Edit Club Memberships",
      "This would open a club membership editor in a real app",
      [{ text: "OK" }]
    );
  };

  const handleViewClub = (clubId: string) => {
    Alert.alert(
      "View Club",
      `This would navigate to club ${clubId} in a real app`,
      [{ text: "OK" }]
    );
  };

  const handleAddRecommendation = (text: string, rating: number) => {
    Alert.alert(
      "Add Recommendation",
      `Added recommendation with rating ${rating}: ${text}`,
      [{ text: "OK" }]
    );
  };

  const handleLikeRecommendation = (id: string) => {
    Alert.alert(
      "Like Recommendation",
      `Liked recommendation ${id}`,
      [{ text: "OK" }]
    );
  };

  const handleEditSkills = () => {
    Alert.alert(
      "Edit Skills",
      "This would open a skills editor in a real app",
      [{ text: "OK" }]
    );
  };

  const handleEditStrategies = () => {
    Alert.alert(
      "Edit Strategies",
      "This would open a strategies editor in a real app",
      [{ text: "OK" }]
    );
  };

  const handleEndorseSkill = (skillId: string) => {
    Alert.alert(
      "Endorse Skill",
      `Endorsed skill ${skillId}`,
      [{ text: "OK" }]
    );
  };

  const handleViewStrategy = (strategyId: string) => {
    Alert.alert(
      "View Strategy",
      `This would navigate to strategy ${strategyId} in a real app`,
      [{ text: "OK" }]
    );
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Profile',
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error || !profileUser) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Profile',
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }} 
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'User not found'}</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const isCurrentUser = currentUser?.id === profileUser.id;
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: isCurrentUser ? 'Your Profile' : profileUser.name,
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <ProfileHeader 
          user={profileUser}
          isCurrentUser={isCurrentUser}
          isConnected={isConnected}
          onConnect={handleConnect}
          onMessage={handleMessage}
          onEditProfile={isCurrentUser ? handleEditProfile : undefined}
        />
        
        {/* Ability Radar Chart */}
        <AbilityRadarChart 
          abilities={mockAbilities}
          isEditable={isCurrentUser}
          onEdit={handleEditAbilities}
        />
        
        {/* Club Information */}
        <ClubInformation 
          clubs={mockClubs}
          isEditable={isCurrentUser}
          onEdit={handleEditClubs}
          onViewClub={handleViewClub}
        />
        
        {/* Player Recommendations */}
        <PlayerRecommendations 
          recommendations={mockRecommendations}
          isCurrentUser={isCurrentUser}
          onAddRecommendation={handleAddRecommendation}
          onLikeRecommendation={handleLikeRecommendation}
          onUserPress={(userId) => router.push(`/profile?userId=${userId}`)}
        />
        
        {/* Skills Section */}
        <SkillsSection 
          skills={mockSkills}
          strategies={mockStrategies}
          isEditable={isCurrentUser}
          onEditSkills={handleEditSkills}
          onEditStrategies={handleEditStrategies}
          onEndorseSkill={handleEndorseSkill}
          onViewStrategy={handleViewStrategy}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});