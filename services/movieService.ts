import { Client, Databases, Query, ID, Models } from 'appwrite';

// Configuración del cliente Appwrite con validación
const getAppwriteClient = () => {
  const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;

  if (!endpoint || !projectId) {
    throw new Error('Appwrite configuration is missing in environment variables');
  }

  return new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);
};

const client = getAppwriteClient();
const databases = new Databases(client);

// Validación de variables de entorno al iniciar
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const SAVED_MOVIES_COLLECTION_ID = process.env.EXPO_PUBLIC_SAVED_MOVIES_COLLECTION_ID!;

if (!DATABASE_ID || !SAVED_MOVIES_COLLECTION_ID) {
  console.error('Error: Database or Collection ID not defined in environment variables');
  throw new Error('Configuration error: Missing database or collection ID');
}

interface SavedMovie extends Models.Document {
  userId: string;
  movieId: string;
  movieData: string;
}

interface OperationResult {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Guarda una película para un usuario
 */
export const saveMovie = async (userId: string, movieId: string, movieData: object): Promise<OperationResult> => {
  try {
    if (!userId || !movieId || !movieData) {
      throw new Error('Missing required parameters');
    }

    const { documents } = await databases.listDocuments<SavedMovie>(
      DATABASE_ID,
      SAVED_MOVIES_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('movieId', movieId)
      ]
    );

    if (documents.length > 0) {
      return { 
        success: false, 
        message: 'La película ya está en tu lista de guardados' 
      };
    }

    const document = await databases.createDocument<SavedMovie>(
      DATABASE_ID,
      SAVED_MOVIES_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        movieId,
        movieData: JSON.stringify(movieData),
        createdAt: new Date().toISOString()
      }
    );

    return { 
      success: true,
      data: {
        id: document.$id,
        movieId: document.movieId
      }
    };
  } catch (error: any) {
    console.error('[saveMovie Error]:', error.message);
    return {
      success: false,
      message: error.message || 'Error al guardar la película'
    };
  }
};

/**
 * Elimina una película guardada
 */
export const unsaveMovie = async (userId: string, movieId: string): Promise<OperationResult> => {
  try {
    const { documents } = await databases.listDocuments<SavedMovie>(
      DATABASE_ID,
      SAVED_MOVIES_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('movieId', movieId),
        Query.limit(1)
      ]
    );

    if (documents.length === 0) {
      return { 
        success: false, 
        message: 'No se encontró la película en tus guardados' 
      };
    }

    await databases.deleteDocument(
      DATABASE_ID,
      SAVED_MOVIES_COLLECTION_ID,
      documents[0].$id
    );

    return { success: true };
  } catch (error: any) {
    console.error('[unsaveMovie Error]:', error.message);
    return {
      success: false,
      message: error.message || 'Error al eliminar la película'
    };
  }
};

/**
 * Obtiene todas las películas guardadas por un usuario
 */
export const getSavedMovies = async (userId: string): Promise<Models.Document[]> => {
  try {
    const { documents } = await databases.listDocuments<SavedMovie>(
      DATABASE_ID,
      SAVED_MOVIES_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt')
      ]
    );

    return documents.map(doc => ({
      ...JSON.parse(doc.movieData),
      savedId: doc.$id,
      savedAt: doc.$createdAt
    }));
  } catch (error: any) {
    console.error('[getSavedMovies Error]:', error.message);
    throw new Error('Error al obtener películas guardadas');
  }
};

/**
 * Verifica si una película está guardada por el usuario
 */
export const isMovieSaved = async (userId: string, movieId: string): Promise<boolean> => {
  try {
    const { documents } = await databases.listDocuments<SavedMovie>(
      DATABASE_ID,
      SAVED_MOVIES_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('movieId', movieId),
        Query.limit(1)
      ]
    );

    return documents.length > 0;
  } catch (error: any) {
    console.error('[isMovieSaved Error]:', error.message);
    return false;
  }
};

/**
 * Obtiene una película guardada específica
 */
export const getSavedMovie = async (userId: string, movieId: string): Promise<Models.Document | null> => {
  try {
    const { documents } = await databases.listDocuments<SavedMovie>(
      DATABASE_ID,
      SAVED_MOVIES_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('movieId', movieId),
        Query.limit(1)
      ]
    );

    if (documents.length === 0) return null;

    return {
      ...JSON.parse(documents[0].movieData),
      savedId: documents[0].$id,
      savedAt: documents[0].$createdAt
    };
  } catch (error: any) {
    console.error('[getSavedMovie Error]:', error.message);
    throw new Error('Error al obtener la película guardada');
  }
};
