import { View, Text, Image, StatusBar } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'

const MainHeader = () => {
    return (
        <View>
            <StatusBar backgroundColor="#173161" barStyle="light-content" />
            <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#173161', alignItems: 'center' }}>
                <TouchableOpacity style={{ padding: 10 }}>
                    <Image source={require('../../assets/arrow_back.png')} style={{ height: 25, width: 25, tintColor: '#173161' }} />
                </TouchableOpacity>
                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 18, color: '#fff' }}>Safvi Electricals Solutions</Text>
                <TouchableOpacity style={{ padding: 10 }}>
                    <Image source={require('../../assets/log-out.png')} style={{ height: 20, width: 20, tintColor: '#fff' }} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default MainHeader