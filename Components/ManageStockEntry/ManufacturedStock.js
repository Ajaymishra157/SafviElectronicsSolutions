import { View, Text, StatusBar, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import Constant from '../Commoncomponent/Constant'

const ManufacturedStock = ({ navigation, route }) => {
  const { product_id, productname, stock_in, startDate, endDate } = route.params || {}
  const [stockdata, setStockdata] = useState([]);
  const [mainloading, setMainloading] = useState(false);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const displayStartDate = formatDate(startDate);
  const displayEndDate = formatDate(endDate);

  const formatDatedb = (isoDate) => {
    return new Date(isoDate).toISOString().split('T')[0]; // Extracts YYYY-MM-DD
  };

  const fetchstockdata = async () => {
    setMainloading(true);
    const formattedstartDate = formatDatedb(startDate);
    const formattedendDate = formatDatedb(endDate);
    const url = `${Constant.URL}${Constant.OtherURL.user_stock_report}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: product_id,
        start_date: formattedstartDate,
        end_date: formattedendDate
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      setStockdata(result.payload);
    } else {
      setStockdata([]);
      console.log('error while fetching data');
    }
    setMainloading(false);
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchstockdata();
    }, [])
  );

  if (mainloading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#173161" />
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <View>
        <StatusBar backgroundColor="#173161" barStyle="light-content" />
        <View style={{ backgroundColor: '#173161', flexDirection: 'row', height: 50, alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require('../../assets/arrow_back.png')} style={{ marginLeft: 10, height: 25, width: 25 }} />
          </TouchableOpacity>
          <Text numberOfLines={1} style={{ flex: 1, color: '#FFF', fontFamily: 'Inter-Bold', fontSize: 14, marginLeft: 10 }}>{productname}</Text>
          <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 18, marginLeft: 20 }}>..</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {stockdata && stockdata.length > 0 ? (
          <ScrollView keyboardShouldPersistTaps='handled'>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderRadius: 10, padding: 10, marginHorizontal: 10, marginTop: 10, borderColor: '#173161', borderWidth: 1, backgroundColor: '#fff' }}>
              <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', marginHorizontal: 0, marginBottom: 10 }}>{displayStartDate}-{displayEndDate}</Text>
              <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Stock In:
                <Text style={{ fontFamily: 'Inter-Regular', textAlign: 'center', fontSize: 14, color: '#173161' }}> {stock_in}</Text>
              </Text>
            </View>
            <View style={{ margin: 10, borderRadius: 10, padding: 0, marginBottom: 5, borderColor: '#173161', borderWidth: 1, backgroundColor: '#fff' }}>
              <View style={{ flexDirection: 'row', }}>
                <View style={{ width: '8%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 5, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', marginLeft: 2 }}>SR. No</Text>
                </View>
                <View style={{ width: '20%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 5, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Date</Text>
                </View>

                <View style={{ width: '20%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 5, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Name</Text>
                </View>

                <View style={{ width: '15%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 5, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>In</Text>
                </View>

                <View style={{ width: '15%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 5, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Out</Text>
                </View>

                <View style={{ width: '20%', paddingVertical: 5, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Balance</Text>
                </View>
              </View>

              {stockdata.map((item, index) => (
                <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161' }}>
                  <View style={{ width: '8%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 5, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 12 }}>{index + 1}</Text>
                  </View>
                  <View style={{ width: '20%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 5, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 12 }}>{item.date ? new Date(item.date).toLocaleDateString("en-GB") : ""}</Text>
                  </View>

                  <View style={{ width: '20%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 5, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 12 }}>{item.name}</Text>
                  </View>

                  <View style={{ width: '15%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 5, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 12 }}>{item.stock_in}</Text>
                  </View>

                  <View style={{ width: '15%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 5, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 12 }}>{item.stock_out}</Text>
                  </View>

                  <View style={{ width: '20%', paddingVertical: 5, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 12 }}>{item.balance}</Text>
                  </View>
                </View>

              ))}
              {/* <View style={{ flexDirection: 'row',}}>
                <View style={{ width: '48%', borderRightWidth: 1, borderColor: '#173161', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Inter-Bold', color: '#173161', paddingVertical: 5, }}>Total</Text>
                </View>

                <View style={{ width: '15%', justifyContent: 'center', borderRightWidth: 1, borderColor: '#173161', alignItems: 'center' }}>
                  <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', paddingVertical: 5, fontSize: 12, textTransform: 'uppercase' }}>{totalin}</Text>
                </View>

                <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderColor: '#173161', }}>
                  <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', paddingVertical: 5, fontSize: 12, textTransform: 'uppercase' }}>{totalout}</Text>
                </View>

                <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', paddingVertical: 5, fontSize: 12, textTransform: 'uppercase' }}>{totalbal}</Text>
                </View>

              </View> */}
            </View>
          </ScrollView>
        ) : null}
      </View>
    </View>
  )
}

export default ManufacturedStock