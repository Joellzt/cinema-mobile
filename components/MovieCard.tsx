import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import { icons } from '@/constants/icons'

interface Movie {
  id: string | number;
  poster_path: string | null;
  title: string;
  vote_average: number;
  release_date: string;
}

const MovieCard = ({id, poster_path, title, vote_average, release_date}: Movie) => {
  return (
    <Link 
      href={{
        pathname: "/movie/[id]",
        params: { id: String(id) }
      }} 
      asChild
    >
      <TouchableOpacity className='w-[30%]'>
        <Image 
          source={{
            uri: poster_path ? 
            `https://image.tmdb.org/t/p/w500${poster_path}` : 'https://placehold.co/600x400/1a1a1a/ffffff.png'
          }}
          className='w-full h-52 rounded-lg'
          resizeMode="cover"
        />
        <Text className='text-sm font-bold text-white mt-2' numberOfLines={1}>
          {title}
        </Text>

        <View className='flex-row items-center justify-start gap-x-1'>
          <Image source={icons.star} className='size-4'/>
          <Text className='text-xs text-white font-bold uppercase'>
            {Math.round(vote_average / 2)}
          </Text>
        </View>
        
        <View className='flex-row items-center justify-between'>
          <Text className='text-xs text-light-300 font-bold mt-1'>
            {release_date?.split('-')[0]}
          </Text>
          <Text className='text-xs font-light text-light-300'>
            Película
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  )
}

export default MovieCard