import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, FlatList } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader';
import MyButton from '../Commoncomponent/MyButton';
import Constant from '../Commoncomponent/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Checkbox } from 'react-native-paper';

const AddCustomertodistributor = ({ navigation, route }) => {
  const { customerdata, customerIds } = route.params || {};
  const headerName = customerdata ? customerdata.area ? `  ${customerdata.company_name} (${customerdata.area})` : customerdata.companyname : '';

  const [customerlist, setCustomerList] = useState([]);
  const [mainloading, setMainloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState({});

  const listcustomers = async () => {
    setMainloading(true);
    const id = customerdata ? customerdata.c_id : '';
    const url = `${Constant.URL}${Constant.OtherURL.shoplist}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        distributor_shop: id
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      setCustomerList(result.payload);
      console.log('customerIds', customerIds)
      if (Array.isArray(customerIds)) {
        const preSelected = {};
        result.payload.forEach(item => {
          if (customerIds.includes(String(item.c_id))) {
            preSelected[item.c_id] = true;
          }
        });
        setSelectedCustomers(preSelected);
        console.log(preSelected);
      }

    } else {
      setCustomerList([]);
      console.log('error while listing customer');
    }
    setMainloading(false);
  };

  const addcustomers = async () => {
    setLoading(true);
    const id = customerdata ? customerdata.c_id : '';
    const selectedIds = Object.keys(selectedCustomers).filter(key => selectedCustomers[key]);
    const url = `${Constant.URL}${Constant.OtherURL.addshop}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        distributor_shop: id,
        shop_id: selectedIds
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      navigation.goBack(null);
    } else {
      console.log('error while adding customers');
    }
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      listcustomers();
    }, [customerIds])
  );

  const toggleSelection = (id) => {
    setSelectedCustomers((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  if (mainloading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#173161" />
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <Subheader headername={headerName} />
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <ActivityIndicator size="large" color="#173161" />
          </View>
        ) : customerlist.length == 0 ? (
          <Text style={{
            fontFamily: 'Inter-Bold',
            fontSize: 14,
            color: '#173161',
            alignSelf: 'center',
            marginTop: 100
          }}>
            No Customers available
          </Text>
        ) : (
          <FlatList
            data={customerlist}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ padding: 10 }}
            keyboardShouldPersistTaps='handled'
            // refreshing={refreshing}
            // onRefresh={onRefresh}
            renderItem={({ item }) => (
              <TouchableOpacity disabled={true} style={{ gap: 10, marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', borderRadius: 10, padding: 5, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff', alignItems: 'center' }}>
                  <Checkbox
                    status={selectedCustomers[item.c_id] ? 'checked' : 'unchecked'}
                    onPress={() => toggleSelection(item.c_id)}
                    color='#173161'
                  />
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, width: '85%', color: '#173161', textTransform: 'uppercase' }}>{item.company_name}{item.area ? ` (${item.area})` : ''}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
      <View style={{ margin: 10 }}>
        <MyButton btnname="Save" background="#173161" fontsize={16} textcolor="#FFF" runFunc={addcustomers} />
      </View>
    </View>
  )
}

export default AddCustomertodistributor