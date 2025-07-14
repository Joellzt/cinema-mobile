interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  [key: string]: any;
}

interface MovieDetails extends Movie {
  runtime: number;
  genres: Array<{ id: number; name: string }>;
  budget: number;
  revenue: number;
  production_companies: Array<{ id: number; name: string }>;
}

export const TMDB_CONFIG = {
  BASE_URL: 'https://api.themoviedb.org/3',
  API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`
  },
  language: 'es-MX'
};

/**
 * Busca películas en TMDB
 * @param {object} params - Parámetros de búsqueda
 * @param {string} [params.query] - Término de búsqueda (opcional)
 * @param {number} [params.page=1] - Página de resultados (opcional)
 * @returns {Promise<Movie[]>} Lista de películas
 */
export const fetchMovies = async ({ query, page = 1 }: { query?: string; page?: number }): Promise<Movie[]> => {
  try {
    const endpoint = query
      ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}&language=${TMDB_CONFIG.language}`
      : `${TMDB_CONFIG.BASE_URL}/movie/popular?page=${page}&language=${TMDB_CONFIG.language}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      overview: movie.overview,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
    }));
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
};

/**
 * Obtiene detalles completos de una película
 * @param {string} movieId - ID de la película en TMDB
 * @returns {Promise<MovieDetails>} Detalles completos de la película
 */
export const fetchMovieDetails = async (movieId: string): Promise<MovieDetails> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?` +
      new URLSearchParams({
        api_key: TMDB_CONFIG.API_KEY || '',
        language: TMDB_CONFIG.language,
        append_to_response: 'videos,credits' // Datos adicionales
      }),
      {
        method: 'GET',
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo obtener detalles de la película`);
    }

    const data = await response.json();

    // Validación y transformación de datos
    return {
      id: data.id,
      title: data.title || 'Sin título',
      poster_path: data.poster_path || null,
      overview: data.overview || 'Descripción no disponible',
      release_date: data.release_date || '',
      vote_average: data.vote_average || 0,
      vote_count: data.vote_count || 0,
      runtime: data.runtime || 0,
      genres: data.genres || [],
      budget: data.budget || 0,
      revenue: data.revenue || 0,
      production_companies: data.production_companies || [],
      // Campos adicionales
      original_title: data.original_title,
      tagline: data.tagline,
      videos: data.videos?.results || [],
      credits: data.credits || {}
    };
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw new Error('No se pudo cargar la película. Por favor intenta nuevamente.');
  }
};

/**
 * Obtiene películas similares
 * @param {string} movieId - ID de la película
 * @returns {Promise<Movie[]>} Lista de películas similares
 */
export const fetchSimilarMovies = async (movieId: string): Promise<Movie[]> => {
  const response = await fetch(
    `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/similar?language=${TMDB_CONFIG.language}`,
    {
      method: 'GET',
      headers: TMDB_CONFIG.headers,
    }
  );
  const data = await response.json();
  return data.results;
};