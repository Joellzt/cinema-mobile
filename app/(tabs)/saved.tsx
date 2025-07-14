import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Account, Client } from 'appwrite';
import { getSavedMovies } from '@/services/movieService';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';


const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') 
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const SavedMovies = () => {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const account = new Account(client);
        const currentUser = await account.get();
        setUser(currentUser);

        if (currentUser) {
          const savedMovies = await getSavedMovies(currentUser.$id);
          setMovies(savedMovies);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-primary justify-center items-center px-4">
        <Text className="text-white text-lg text-center">
          Inicia sesión para ver tus películas guardadas
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary p-4">
      <Text className="text-white text-lg font-bold mb-6 mt-10">Mis Películas</Text>
      
      {movies.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Image 
            source={icons.save}
            className="w-40 h-40 mb-4"
            resizeMode="contain"
          />
          <Text className="text-light-200 text-lg">No tienes películas guardadas</Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              className="flex-row items-center mb-4 bg-dark-100 p-3 rounded-lg"
              onPress={() => router.push(`/movie/${item.id}`)}
            >
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }}
                className="w-16 h-24 rounded-md mr-4"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-white font-semibold text-lg" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="text-light-200 text-sm">
                  {item.release_date?.split('-')[0]} • ⭐ {item.vote_average?.toFixed(1)}
                </Text>
              </View>
              <Image
                source={icons.arrow}
                className="w-5 h-5"
                tintColor="#9CA3AF"
              />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default SavedMovies;