import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Client, Account, ID } from 'appwrite';
import { images } from '@/constants/images';
import { icons } from '@/constants/icons';

// Tipos de TypeScript
type User = {
  $id: string;
  name: string;
  email: string;
  emailVerification: boolean;
};

type FormData = {
  email: string;
  password: string;
  name: string;
};

// Configuración de Appwrite
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);

const ProfileInfo = ({ label, value }: { label: string; value?: string | number | null }) => (
  <View className="flex-col items-center justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const ProfileScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: ''
  });

  // Verificar sesión al cargar
  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await account.get() as User;
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const handleChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailAuth = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!isLogin && !formData.name) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }

    setAuthLoading(true);
    try {
      if (isLogin) {
        await account.createEmailPasswordSession(formData.email, formData.password);
        const currentUser = await account.get() as User;
        setUser(currentUser);
      } else {
        await account.create(ID.unique(), formData.email, formData.password, formData.name);
        await account.createEmailPasswordSession(formData.email, formData.password);
        const currentUser = await account.get() as User;
        setUser(currentUser);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Ocurrió un error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setFormData({ email: '', password: '', name: '' });
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar la sesión');
    }
  };

  if (loading) {
    return (
      <View className="bg-primary flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ 
        paddingBottom: 80,
        flexGrow: 1,
        justifyContent: 'center'
      }}>
        {user ? (
          <View className="items-center px-5">
            <Image 
              source={icons.logo} 
              className="w-32 h-32 rounded-full"
              resizeMode="contain"
            />

            <Text className="text-white font-bold text-xl mt-5">{user.name}</Text>
            
            <ProfileInfo label="Correo electrónico" value={user.email} />
            <ProfileInfo 
              label="Verificación" 
              value={user.emailVerification ? "Verificado" : "No verificado"} 
            />

            <View className="flex-row justify-between w-3/4 mt-8">
              <ProfileInfo label="Películas vistas" value="24" />
              <ProfileInfo label="Valoración" value="8.6/10" />
            </View>

            <TouchableOpacity
              className="bg-red-500 h-12 rounded-md mt-10 w-3/4 flex-row items-center justify-center"
              onPress={handleLogout}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Image
                    source={icons.logo}
                    className="size-5 mr-2"
                    tintColor="#fff"
                  />
                  <Text className="text-white font-semibold">Cerrar sesión</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="items-center px-5">
            <Text className="text-white font-bold text-xl mb-8">
              {isLogin ? 'Inicia sesión' : 'Regístrate'}
            </Text>

            {!isLogin && (
              <TextInput
                className="h-12 bg-dark-100 text-light-100 w-full px-4 rounded-md mb-4"
                placeholder="Nombre completo"
                placeholderTextColor="#A0A0A0"
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                autoCapitalize="words"
              />
            )}

            <TextInput
              className="h-12 bg-dark-100 text-light-100 w-full px-4 rounded-md mb-4"
              placeholder="Correo electrónico"
              placeholderTextColor="#A0A0A0"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              className="h-12 bg-dark-100 text-light-100 w-full px-4 rounded-md mb-6"
              placeholder="Contraseña"
              placeholderTextColor="#A0A0A0"
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
              secureTextEntry
            />

            <TouchableOpacity
              className="bg-accent h-12 rounded-md w-3/4 flex-row items-center justify-center"
              onPress={handleEmailAuth}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold">
                  {isLogin ? 'Iniciar sesión' : 'Registrarse'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4"
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text className="text-light-200">
                {isLogin 
                  ? '¿No tienes cuenta? Regístrate aquí' 
                  : '¿Ya tienes cuenta? Inicia sesión aquí'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;