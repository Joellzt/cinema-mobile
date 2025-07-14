import { View, Image, TextInput, TextInputProps } from 'react-native'
import React, { forwardRef } from 'react'
import { icons } from '@/constants/icons'

interface Props extends TextInputProps {
    placeholder: string
    value?: string
    onChangeText?: (text: string) => void
}

const SearchBar = forwardRef<TextInput, Props>(({ 
    placeholder, 
    value, 
    onChangeText,
    ...props 
}, ref) => {
  return (
    <View className='flex-row items-center bg-dark-200 rounded-full px-5 py-4'>
        <Image source={icons.search} className='size-5' resizeMode="contain" tintColor="#ab8bff" />
        <TextInput 
            ref={ref}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor="#a8b5db"
            className='flex-1 ml-6 text-white'
            returnKeyType="search"
            blurOnSubmit={false}
            {...props}
        />
    </View>
  )
})

export default SearchBar