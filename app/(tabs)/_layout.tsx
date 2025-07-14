import { View, Text, ImageBackground, Image } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { images } from '@/constants/images'
import { icons } from '@/constants/icons'

const TabIcon = ({ focused, icon, title }: any) => {
    if (focused) {
        return (
            <ImageBackground
                source={images.highlight}
                className='flex flex-row w-full flex-1 min-w-[100px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden'
            >
                <Image source={icon} tintColor="#ffffff" className="size-5" />
                <Text className='text-white text-base font-semibold'>{title}</Text>
            </ImageBackground>
        );
    }
    return (
        <View className='size-full justify-center items-center mt-4 rounded-full'>
            <Image source={icon} tintColor="#A8b5db" className='size-5'/>
        </View>
    );
}


const _layout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarItemStyle:{
                    width:'100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarStyle:{
                    backgroundColor: '#0f0d23',
                    borderRadius: 50,
                    marginHorizontal: 20,
                    marginBottom: 36,
                    height:52,
                    position: 'absolute',
                    overflow:'hidden',
                    borderWidth:1,
                    borderColor:'#0f0d23',
                  

                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Inicio',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.home} title="Inicio" />
                    )
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: 'Buscar',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.search} title="Buscar" />
                    )
                }}
            />
            <Tabs.Screen
                name="saved"
                options={{
                    title: 'Guardado',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.save} title="Guardado" />
                    )
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.person} title="Perfil" />
                    )
                }}
            />
        </Tabs>
    )
}

export default _layout