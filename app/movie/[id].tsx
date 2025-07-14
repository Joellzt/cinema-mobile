import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Client, Account } from 'appwrite';
import { icons } from '@/constants/icons';
import { saveMovie, unsaveMovie, isMovieSaved } from '@/services/movieService';
import { fetchMovieDetails } from '@/services/api';

// Configuración de Appwrite
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

interface Genre {
  id: number;
  name: string;
}

interface ProductionCompany {
  id: number;
  name: string;
}

interface MovieDetails {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  vote_count: number;
  genres: Genre[];
  budget: number;
  revenue: number;
  production_companies: ProductionCompany[];
}

const MovieInfo = ({ label, value }: { label: string; value?: string | number | null }) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value?.toString() || "N/A"}
    </Text>
  </View>
);

const MovieDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener detalles de la película
        const movieData = await fetchMovieDetails(id);
        setMovie(movieData);

        // Verificar autenticación
        const account = new Account(client);
        try {
          const currentUser = await account.get();
          setUser(currentUser);
          
          // Verificar si está guardada
          const saved = await isMovieSaved(currentUser.$id, id);
          setIsSaved(saved);
        } catch (authError) {
          setUser(null);
          setIsSaved(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'No se pudo cargar la película');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const toggleSave = async () => {
    if (!user) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para guardar películas', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Iniciar sesión', onPress: () => router.push('/profile') }
      ]);
      return;
    }

    setAuthLoading(true);
    try {
      if (isSaved) {
        await unsaveMovie(user.$id, id);
        setIsSaved(false);
      } else if (movie) {
        await saveMovie(user.$id, id, movie);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo completar la acción');
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-primary flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  if (!movie) {
    return (
      <SafeAreaView className="bg-primary flex-1 justify-center items-center px-4">
        <Text className="text-white text-lg text-center">Película no encontrada</Text>
        <TouchableOpacity
          className="mt-4 bg-accent px-6 py-2 rounded-lg"
          onPress={router.back}
        >
          <Text className="text-white font-semibold">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Portada de la película */}
        <View className="relative">
          <Image
            source={{
              uri: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'https://placehold.co/600x900/1a1a1a/ffffff?text=No+Poster'
            }}
            className="w-full h-[550px]"
            resizeMode="cover"
            defaultSource={{ uri: 'https://placehold.co/600x900/1a1a1a/ffffff?text=Cargando...' }}
          />

          {/* Botón de guardar */}
          <TouchableOpacity
            className="absolute bottom-10 right-6 bg-dark-100/90 p-3 rounded-full"
            onPress={toggleSave}
            disabled={authLoading}
          >
            <Image
              source={isSaved ? icons.save : icons.save}
              className="w-6 h-6"
              resizeMode="contain"
              tintColor={isSaved ? "#fbbf24" : "#ffffff"}
            />
          </TouchableOpacity>
        </View>

        {/* Detalles de la película */}
        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-2xl">{movie.title}</Text>
          
          <View className="flex-row items-center gap-x-2 mt-3">
            <Text className="text-light-200 text-sm">
              {movie.release_date?.split('-')[0]}
            </Text>
            <Text className="text-light-200 text-sm">•</Text>
            <Text className="text-light-200 text-sm">{movie.runtime} min</Text>
          </View>

          {/* Rating */}
          <View className="flex-row items-center bg-dark-100 px-3 py-2 rounded-md gap-x-2 mt-3">
            <Image source={icons.star} className="size-4" tintColor="#fbbf24" />
            <Text className="text-white font-bold text-sm">
              {Math.round(movie.vote_average * 10) / 10}/10
            </Text>
            <Text className="text-light-200 text-sm">
              ({movie.vote_count.toLocaleString()} votos)
            </Text>
          </View>

          {/* Información detallada */}
          <MovieInfo label="Descripción" value={movie.overview} />
          
          <MovieInfo
            label="Géneros"
            value={movie.genres?.map((g) => g.name).join(' • ')}
          />

          <View className="flex-row justify-between w-full mt-5">
            <MovieInfo
              label="Presupuesto"
              value={movie.budget > 0 ? `$${(movie.budget / 1_000_000).toFixed(1)}M` : 'N/A'}
            />
            <MovieInfo
              label="Recaudación"
              value={movie.revenue > 0 ? `$${Math.round(movie.revenue / 1_000_000)}M` : 'N/A'}
            />
          </View>

          <MovieInfo
            label="Productoras"
            value={movie.production_companies?.map((c) => c.name).join(', ')}
          />
        </View>
      </ScrollView>

      {/* Botón de volver */}
      <TouchableOpacity
        className="absolute bottom-10 left-0 right-0 mx-7 bg-accent rounded-lg py-5 flex-row items-center justify-center"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-2 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white font-semibold text-base">Volver</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MovieDetailsScreen;