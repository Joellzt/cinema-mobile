import { Client, Databases, Query, ID } from "appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const METRICS_COLLECTION_ID = process.env.EXPO_PUBLIC_METRICS_COLLECTION_ID!;

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

interface Movie {
  id: string | number;
  title: string;
  poster_path: string;
}

interface TrendingMovie {
  $id: string;
  searchTerm: string;
  movie_id: string | number;
  count: number;
  title: string;
  poster_url: string;
}

/**
 * Actualiza el contador de búsquedas para un término dado.
 */
export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, METRICS_COLLECTION_ID, [
      Query.equal("searchTerm", query),
      Query.limit(1),
    ]);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(DATABASE_ID, METRICS_COLLECTION_ID, existingMovie.$id, {
        count: (existingMovie.count ?? 0) + 1,
      });
    } else {
      await database.createDocument(DATABASE_ID, METRICS_COLLECTION_ID, ID.unique(), {
        searchTerm: query,
        movie_id: movie.id,
        count: 1,
        title: movie.title,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error("[updateSearchCount Error]:", error);
    throw error;
  }
};

/**
 * Obtiene las películas trending (más buscadas) ordenadas por count desc.
 */
export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, METRICS_COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);
    return result.documents.map(doc => ({
      $id: doc.$id,
      searchTerm: doc.searchTerm,
      movie_id: doc.movie_id,
      count: doc.count,
      title: doc.title,
      poster_url: doc.poster_url,
    })) as TrendingMovie[];
  } catch (error) {
    console.error("[getTrendingMovies Error]:", error);
    return undefined;
  }
};
