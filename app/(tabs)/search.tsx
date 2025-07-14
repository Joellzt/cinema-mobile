import { View, Text, Image, FlatList, ActivityIndicator, Keyboard } from 'react-native'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useIsFocused } from '@react-navigation/native'
import { images } from '@/constants/images'
import MovieCard from '@/components/MovieCard'
import useFetch from '@/services/useFetch'
import { fetchMovies } from '@/services/api'
import { icons } from '@/constants/icons'
import SearchBar from '@/components/SearchBar'
import { updateSearchCount } from '@/services/appwrite'

const SearchScreen = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const searchInputRef = useRef<TextInput>(null)
    const isFocused = useIsFocused()
    const { data: movies, loading, error, refetch: loadMovies, reset } = useFetch(() => fetchMovies({
        query: searchQuery
    }), false)

    // Solución definitiva para el foco del teclado
    useEffect(() => {
        if (isFocused) {
            const showKeyboard = async () => {
                await new Promise(resolve => setTimeout(resolve, 300))
                searchInputRef.current?.focus()
            }
            showKeyboard()
        } else {
            Keyboard.dismiss()
        }
    }, [isFocused])

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim()) {
                await loadMovies()
            } else {
                reset()
            }
        }, 500)
        
        return () => clearTimeout(timeoutId)
    }, [searchQuery])

    useEffect(() => {
        if (movies?.length > 0 && movies?.[0]) {
            updateSearchCount(searchQuery, movies[0])
        }
    }, [movies])

    return (
        <View className='flex-1 bg-primary'>
            <Image source={images.bg} className='flex-1 absolute w-full z-0' resizeMode="cover" />
            
            <FlatList
                data={movies}
                renderItem={({ item }) => <MovieCard {...item} />}
                keyExtractor={(item) => item.id.toString()}
                className='px-5'
                numColumns={3}
                columnWrapperStyle={{
                    justifyContent: 'center',
                    gap: 16,
                    marginVertical: 16,
                }}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListHeaderComponent={
                    <>
                        <View className='w-full flex-row justify-center mt-20 items-center'>
                            <Image source={icons.logodos} className='w-12 h-10 mb-5' />
                        </View>
                        
                        <View className='my-5'>
                            <SearchBar
                                ref={searchInputRef}
                                placeholder='Buscar películas...'
                                value={searchQuery}
                                onChangeText={(text: string) => setSearchQuery(text)}
                                onSubmitEditing={() => searchInputRef.current?.focus()} // Mantener foco al enviar
                            />
                        </View>

                        {loading && (
                            <ActivityIndicator size="large" color="#0000ff" className='my-3' />
                        )}

                        {error && (
                            <Text className='text-red-500 px-5 my-3'>
                                Error: {error.message}
                            </Text>
                        )}

                        {!loading && !error && searchQuery.trim() && movies?.length > 0 && (
                            <Text className='text-ms text-white font-semibold'>
                                Resultados para {''}
                                <Text className='text-accent'>{searchQuery}</Text>
                            </Text>
                        )}
                    </>
                }
                ListEmptyComponent={
                    !loading && !error ? (
                        <View className='mt-10 px-5'>
                            <Text className='text-center text-white'>
                                {searchQuery.trim() ? 'No se encontraron resultados' : 'Buscá una película'}
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    )
}

export default SearchScreen