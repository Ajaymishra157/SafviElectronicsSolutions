import { View, Text, ScrollView, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, Image, Keyboard, Alert, Modal, BackHandler, AppState, } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import { Dropdown } from 'react-native-element-dropdown';
import { useFocusEffect } from '@react-navigation/native';
import Constant from '../Commoncomponent/Constant';
import MyButton from '../Commoncomponent/MyButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RadioButton } from 'react-native-paper';

const AddScheme = ({ navigation, route }) => {
  const { scheme_no, schemedata, from } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [mainloading, setmainloading] = useState(false);

  const [modalvisible, setModalvisible] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  const [schemetype, setSchemetype] = useState(schemedata ? schemedata.scheme_type : null);
  const [schemetypelist, setSchemeTypelist] = useState([
    { label: 'Free', value: 'Free' },
    { label: 'Discount', value: 'Discount' },
    { label: 'Discounted Same Product', value: 'Discounted Same Product' },
  ]);

  const [productlist, setProductlist] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [buyqty, setBuyqty] = useState(null);
  const [schemename, setSchemeName] = useState(schemedata ? schemedata.scheme_name : null);
  const [startDate, setStartDate] = useState(schemedata ? new Date(schemedata.start_date) : new Date());
  const [endDate, setEndDate] = useState(schemedata ? new Date(schemedata.end_date) : new Date());
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [schemeno, setSchemeno] = useState(scheme_no ? scheme_no : null);
  const [schemestatus, setSchemestatus] = useState(schemedata ? schemedata.scheme_status : null);

  const [freeproductlist, setFreeProductlist] = useState([]);
  const [freeproduct, setFreeProduct] = useState(null);
  const [freeqty, setFreeqty] = useState(null);
  const [freeproductprice, setFreeProductprice] = useState(null);

  const [schemes, setSchemes] = useState([]);

  const [schemelist, setSchemelist] = useState([]);

  const openModal = (item, x, y) => {
    setModalPosition({ top: y - 15, left: x - 110 });
    setSchemes(item);
    setModalvisible(true);
  };

  const closeModal = () => {
    setModalvisible(false);
  };

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (
        appState.current.match(/active/) &&
        (nextAppState == 'background' || nextAppState == 'inactive')
      ) {
        if (!scheme_no && schemelist.length > 0) {
          cancelscheme(); // App going to background → clean up
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => subscription.remove();
  }, [schemelist]);

  const isFormValid = () => {
    if (!schemename?.trim()) return false;
    if (!buyqty || isNaN(buyqty)) return false;
    if (!startDate || isNaN(startDate)) return false;
    if (!endDate || isNaN(endDate)) return false;
    if (!selectedProduct) return false;

    if (schemetype == 'Free') {
      if (!freeproduct) return false;
      if (!freeqty || isNaN(freeqty)) return false;
    }

    if (schemetype == 'Discount') {
      if (!freeproduct) return false;
      if (!freeproductprice || isNaN(freeproductprice)) return false;
    }

    if (schemetype == 'Discounted Same Product') {
      if (!freeproductprice || isNaN(freeproductprice)) return false;
    }

    return true;
  };


  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const displayStartDate = formatDate(startDate);
  const displayEndDate = formatDate(endDate);

  const showStartDatePicker = () => {
    setShowStartDate(true);
  };

  const showEndDatePicker = () => {
    setShowEndDate(true);
  };

  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    if (currentDate <= endDate) { // Ensure start date is not after end date
      setShowStartDate(false);
      setStartDate(currentDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    if (currentDate >= startDate) { // Ensure end date is not before start date
      setShowEndDate(false);
      setEndDate(currentDate);
    }
  };

  const formatDateToDatabase = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Format to yyyy-mm-dd
  };

  const listproduct = async () => {
    const url = `${Constant.URL}${Constant.OtherURL.product_list}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({

      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      const productlist = result.Payload.map((item) => ({
        label: item.product_name,
        value: item.product_id,
        price: item.product_price
      }));
      setProductlist(productlist);
      setFreeProductlist(productlist);
    } else {
      setProductlist([]);
      setFreeProductlist([]);
      console.log('error while listing product');
    }
  };

  const clearSchemeForm = () => {
    // setSchemetype('');
    // setSchemeName('');
    // setStartDate(new Date()); // or null if you want to reset it completely
    // setEndDate(new Date());
    setSelectedProduct('');
    setBuyqty('');
    setFreeProduct('');
    setFreeqty('');
    setFreeProductprice('');
  };

  const listscheme = async (scheme_no) => {
    setmainloading(true);
    const url = `${Constant.URL}${Constant.OtherURL.schemelist}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scheme_no: schemeno ? schemeno : scheme_no,
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      console.log('called');
      setSchemelist(result.payload);
    } else {
      setSchemelist([]);
      console.log('error while listing product');
    }
    setmainloading(false);
  };

  const addscheme = async () => {
    const id = await AsyncStorage.getItem('admin_id');
    const formattedstartDate = formatDateToDatabase(startDate);
    const formattedendDate = formatDateToDatabase(endDate);
    // discount product 
    const selectedProductPrice = productlist.find(p => p.value == freeproduct)?.price || 0;
    const discountPrice = parseFloat(selectedProductPrice) - parseFloat(freeproductprice || 0);
    // discounted same product
    const ProductPrice = productlist.find(p => p.value == selectedProduct)?.price || 0;
    const discountedPrice = parseFloat(ProductPrice) - parseFloat(freeproductprice || 0);
    const url = `${Constant.URL}${Constant.OtherURL.addscheme}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: id,
        scheme_name: schemename,
        scheme_type: schemetype,
        product_id: selectedProduct,
        min_qty: buyqty,
        free_product_id: schemetype == 'Discounted Same Product' ? selectedProduct : freeproduct,
        free_qty: freeqty,
        // discount_price: schemetype == 'Discounted Same Product' ? discountedPrice : discountPrice,
        discount_price: freeproductprice,
        start_date: formattedstartDate,
        end_date: formattedendDate,
        scheme_no: schemeno
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      setSchemeno(result.payload.scheme_no);
      listscheme(result.payload.scheme_no);
      clearSchemeForm();
    } else {
      console.log('error while listing product');
    }
  };

  const confirmscheme = async () => {
    setLoading(true);
    const formattedstartDate = formatDateToDatabase(startDate);
    const formattedendDate = formatDateToDatabase(endDate);
    const url = `${Constant.URL}${Constant.OtherURL.confirm_scheme}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scheme_no: schemeno,
        scheme_name: schemename,
        start_date: formattedstartDate,
        end_date: formattedendDate,
        scheme_status: schemestatus
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      navigation.goBack(null);
    } else {
      console.log('error while listing product');
    }
    setLoading(false);
  };

  const handleEdit = () => {
    if (schemes) {
      setSchemetype(schemes.scheme_type);
      setSchemeName(schemes.scheme_name);
      setStartDate(new Date(schemes.start_date));
      setEndDate(new Date(schemes.end_date));
      setSelectedProduct(schemes.product_id);
      setBuyqty(schemes.min_qty);
      setFreeProduct(schemes.free_product_id);
      setFreeqty(schemes.free_qty);
      // Get the correct product price
      const productPrice = productlist.find(p =>
        p.value == (schemes.scheme_type === 'Discounted Same Product'
          ? schemes.product_id
          : schemes.free_product_id)
      )?.price || 0;

      const discountAmount = parseFloat(productPrice) - parseFloat(schemes.discount_price || 0);
      setFreeProductprice(schemes.discount_price);
      setModalvisible(false);
    }
  };

  const updatescheme = async () => {
    const id = await AsyncStorage.getItem('admin_id');
    const formattedstartDate = formatDateToDatabase(startDate);
    const formattedendDate = formatDateToDatabase(endDate);
    // discount product 
    const selectedProductPrice = productlist.find(p => p.value == freeproduct)?.price || 0;
    const discountPrice = parseFloat(selectedProductPrice) - parseFloat(freeproductprice || 0);
    // discounted same product
    const ProductPrice = productlist.find(p => p.value == selectedProduct)?.price || 0;
    const discountedPrice = parseFloat(ProductPrice) - parseFloat(freeproductprice || 0);
    const url = `${Constant.URL}${Constant.OtherURL.scheme_update}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scheme_id: schemes.scheme_id,
        user_id: id,
        scheme_name: schemename,
        scheme_type: schemetype,
        product_id: selectedProduct,
        min_qty: buyqty,
        free_product_id: schemetype == 'Discounted Same Product' ? selectedProduct : freeproduct,
        free_qty: freeqty,
        // discount_price: schemetype == 'Discounted Same Product' ? discountedPrice : discountPrice,
        discount_price: freeproductprice,
        start_date: formattedstartDate,
        end_date: formattedendDate,
        // scheme_no: schemeno
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      listscheme();
      clearSchemeForm();
    } else {
      console.log('error while listing product');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete Order",
      `Are you sure you want to delete this ${schemes.product_name} Product Scheme?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => {
            deletescheme(schemes.scheme_id);
          }
        }
      ]
    );
  };

  const deletescheme = async (id) => {
    setmainloading(true);
    const url = `${Constant.URL}${Constant.OtherURL.delete_scheme_product}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scheme_id: id,
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      setModalvisible(false)
      listscheme();
      setSchemes([]);
    } else {
      // setSchemelist([]);
      console.log('error while delete');
    }
    setmainloading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      listproduct();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      listscheme();
    }, [schemeno])
  );

  useEffect(() => {
    const backAction = () => {
      if (schemelist.length == 0 || from == 'Edit') {
        navigation.goBack(); // Automatically navigate back if no scheme
      } else {
        Alert.alert(
          'Cancel Scheme',
          'Are you sure want to cancel the scheme ?',
          [
            {
              text: 'No',
              onPress: () => null,
              style: 'cancel',
            },
            { text: 'Yes', onPress: () => cancelscheme() },
          ]
        );
      }
      return true; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove(); // Cleanup
  }, [schemelist]); // 🔁 Add schemelist as dependency  

  const cancelscheme = async () => {
    const url = `${Constant.URL}${Constant.OtherURL.scheme_delete}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scheme_no: schemeno,
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      navigation.goBack(null);
    } else {
      // Handle error if needed
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* <Subheader headername={schemedata?.schemeid ? 'Update Scheme' : 'Add Scheme'} /> */}
      <View>
        <StatusBar backgroundColor="#173161" barStyle="light-content" />
        <View style={{ backgroundColor: '#173161', flexDirection: 'row', height: 50, alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => {
            (schemelist.length == 0 || from == 'Edit') ? navigation.goBack() :
              Alert.alert('Cancel Scheme', 'Are you sure you want to cancel the scheme?', [
                {
                  text: 'No',
                  onPress: () => null,
                  style: 'cancel',
                },
                {
                  text: 'Yes',
                  onPress: async () => {
                    try {
                      await cancelscheme(); // Call the API
                    } catch (error) {
                      console.error("Error canceling order:", error);
                    }
                  },
                },
              ]);
          }}>
            <Image source={require('../../assets/arrow_back.png')} style={{ marginLeft: 10, height: 25, width: 25 }} />
          </TouchableOpacity>
          <Text numberOfLines={1} style={{ color: '#FFF', fontFamily: 'Inter-Bold', fontSize: 16, marginLeft: 0 }}>{scheme_no ? 'Update Scheme' : 'Add Scheme'}</Text>
          <Text disabled={!schemeno} onPress={confirmscheme} style={{ color: schemeno ? '#FFF' : 'gray', fontFamily: 'Inter-Bold', fontSize: 14, marginRight: 10 }}>Save</Text>
        </View>
      </View>

      <View style={{ flex: 1, paddingBottom: 10, }}>
        <ScrollView keyboardShouldPersistTaps='handled'>
          <View style={{ marginHorizontal: 10 }}>
            <Text style={styles.Label}>Select Scheme: </Text>
            <Dropdown
              data={schemetypelist}
              labelField="label"
              valueField="value"
              placeholder="Select Scheme Type"
              placeholderStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }}
              selectedTextStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }}
              value={schemetype}
              onChange={item => {
                // clearSchemeForm();
                setSchemetype(item.value);
                Keyboard.dismiss();
              }}
              disable={scheme_no}
              style={{ height: 40, borderColor: 'gray', backgroundColor: scheme_no ? '#ddd' : '', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, fontFamily: 'Inter-Regular', color: '#000', }}
              renderItem={item => {
                const isSelected = item.value == schemetype;
                return (
                  <View style={{ padding: 5, paddingHorizontal: 10, backgroundColor: isSelected ? '#e6f0ff' : '#fff', borderRadius: 5, }} >
                    <Text style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }} >{item.label}</Text>
                  </View>
                );
              }}
            />

            {schemetype &&
              <View>
                <View style={{ marginTop: 0, }}>
                  <Text style={styles.Label}>Scheme Name: </Text>
                  <TextInput placeholder='Enter Scheme Name' placeholderTextColor='gray' value={schemename} onChangeText={setSchemeName} style={{ height: 40, fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, paddingVertical: 10, color: '#000', borderWidth: 0.5, borderColor: 'gray', borderRadius: 5 }} />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 0, }}>
                  {/* Start Date Button */}
                  <View style={{ width: '49%', }}>
                    <Text style={styles.Label}>Scheme Start Date: </Text>
                    <TouchableOpacity onPress={showStartDatePicker} style={{ borderWidth: 0.5, borderColor: 'gray', marginTop: 0, borderRadius: 10, padding: 10 }}>
                      <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{displayStartDate}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* End Date Button */}
                  <View style={{ width: '49%', }}>
                    <Text style={styles.Label}>Scheme End Date: </Text>
                    <TouchableOpacity onPress={showEndDatePicker} style={{ borderWidth: 0.5, borderColor: 'gray', marginTop: 0, borderRadius: 10, padding: 10 }}>
                      <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{displayEndDate}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Start Date Picker */}
                  {showStartDate && (
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      is24Hour={false}
                      display="default"
                      onChange={onStartDateChange}
                    // maximumDate={today}
                    />
                  )}

                  {/* End Date Picker */}
                  {showEndDate && (
                    <DateTimePicker
                      value={endDate}
                      mode="date"
                      is24Hour={false}
                      display="default"
                      onChange={onEndDateChange}
                    // maximumDate={today}
                    />
                  )}
                </View>

                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 12, color: '#fff', fontFamily: 'Inter-Bold', marginTop: 10, padding: 3, paddingLeft: 5, textAlign: 'center', textTransform: 'uppercase', backgroundColor: '#173161', width: 125 }}>Scheme Product</Text>
                </View>

                <Text style={styles.Label}>Select Product: </Text>
                <Dropdown
                  data={productlist}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Product"
                  placeholderStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }}
                  selectedTextStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }}
                  value={selectedProduct}
                  onChange={item => {
                    setSelectedProduct(item.value);
                    Keyboard.dismiss();
                  }}
                  style={{ height: 40, borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, fontFamily: 'Inter-Regular', color: '#000', }}
                  renderItem={item => {
                    const isSelected = item.value == selectedProduct;
                    return (
                      <View style={{ padding: 5, paddingHorizontal: 10, backgroundColor: isSelected ? '#e6f0ff' : '#fff', borderRadius: 5, }} >
                        <Text style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }} >{item.label}</Text>
                      </View>
                    );
                  }}
                />

                <View style={{ marginTop: 0, }}>
                  <Text style={styles.Label}>Qty: </Text>
                  <TextInput placeholder='Enter Buy QTY' placeholderTextColor='gray' keyboardType='numeric' value={buyqty} onChangeText={setBuyqty} style={{ height: 40, fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, paddingVertical: 10, color: '#000', borderWidth: 0.5, borderColor: 'gray', borderRadius: 5 }} />
                </View>

                {schemetype != 'Free' &&
                  <>
                    <Text style={styles.Label}>Product Price: </Text>
                    <View style={{ marginTop: 0, height: 40, paddingHorizontal: 10, paddingVertical: 10, borderWidth: 0.5, borderColor: 'gray', borderRadius: 5 }}>
                      <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: '#000', }}> {selectedProduct ? `${productlist.find(p => p.value == selectedProduct)?.price ?? 'N/A'}` : ''}</Text>
                    </View>
                  </>}

                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: '#fff', fontFamily: 'Inter-Bold', marginTop: 10, padding: 3, paddingLeft: 5, textAlign: 'center', textTransform: 'uppercase', backgroundColor: '#173161', }}>{schemetype} {schemetype == 'Discounted Same Product' ? '' : 'Product'}</Text>
                </View>

                <Text style={styles.Label}>Select Product: </Text>
                <Dropdown
                  data={freeproductlist}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Product"
                  placeholderStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }}
                  selectedTextStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }}
                  value={schemetype == 'Discounted Same Product' ? selectedProduct : freeproduct}
                  onChange={item => {
                    if (schemetype !== 'Discounted Same Product') {
                      setFreeProduct(item.value);
                      const selected = productlist.find(p => p.value == item.value);
                      if (selected) {
                        setFreeProductprice(selected.price.toString());
                      }
                    }
                  }}
                  disable={schemetype === 'Discounted Same Product'}

                  style={{ height: 40, borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, fontFamily: 'Inter-Regular', color: '#000', marginTop: 0, backgroundColor: schemetype == 'Discounted Same Product' ? '#ddd' : '', }}
                  renderItem={item => {
                    const isSelected = item.value == (schemetype === 'Discounted Same Product' ? selectedProduct : freeproduct);
                    return (
                      <View style={{ padding: 5, paddingHorizontal: 10, backgroundColor: isSelected ? '#e6f0ff' : '#fff', borderRadius: 5, }} >
                        <Text style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }} >{item.label}</Text>
                      </View>
                    );
                  }}
                />

                {schemetype == 'Free' &&
                  <View style={{ marginTop: 0, }}>
                    <Text style={styles.Label}>QTY: </Text>
                    <TextInput placeholder='Enter QTY' placeholderTextColor='gray' keyboardType='numeric' value={freeqty} onChangeText={setFreeqty} style={{ height: 40, fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, paddingVertical: 10, color: '#000', borderWidth: 0.5, borderColor: 'gray', borderRadius: 5 }} />
                  </View>}

                {schemetype != 'Free' &&
                  <View style={{ marginTop: 0, }}>
                    <Text style={styles.Label}>Discount Price: </Text>
                    <TextInput placeholder='Enter Price' placeholderTextColor='gray' keyboardType='numeric' value={freeproductprice?.toString()} onChangeText={setFreeProductprice} style={{ height: 40, fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, paddingVertical: 10, color: '#000', borderWidth: 0.5, borderColor: 'gray', borderRadius: 5 }} />
                  </View>}

                {scheme_no &&
                  <>
                    <Text style={styles.Label}>Status</Text>
                    <RadioButton.Group
                      onValueChange={value => {
                        setSchemestatus(value); // Allow changing only if editing
                      }}
                      value={schemestatus}
                    >
                      <View style={{ flexDirection: 'row', marginBottom: 0 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
                          <RadioButton value="Active" color='#173161' />
                          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#000' }}>
                            Active
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <RadioButton value="Inactive" color='#173161' />
                          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#000' }}>
                            Inactive
                          </Text>
                        </View>
                      </View>
                    </RadioButton.Group>
                  </>}

                {loading ?
                  <ActivityIndicator size="large" color="#173161" />
                  : <View style={{ marginHorizontal: 5, justifyContent: 'flex-end', marginTop: 10 }}>
                    <MyButton btnname={"Next"} background={isFormValid() ? "#173161" : "#A9A9A9"} fontsize={14} textcolor={isFormValid() ? "#fff" : "#000"} disabled={!isFormValid()} runFunc={schemes?.scheme_id ? updatescheme : addscheme} />
                  </View>
                }
              </View>
            }
          </View>

          {mainloading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#173161" />
            </View>
          ) : (schemelist && schemelist.length > 0 && (
            schemelist.map((item, index) => (
              <View key={index} style={styles.container}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Scheme Type: </Text>
                    <Text style={{ ...styles.value, marginLeft: 10 }}>{item.scheme_type}</Text>
                  </View>
                  <TouchableOpacity onPress={(e) => {
                    const { pageX, pageY } = e.nativeEvent;
                    openModal(item, pageX, pageY);
                  }}>
                    <Image source={require('../../assets/threedot.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                  </TouchableOpacity>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Scheme Name: </Text>
                  <Text style={styles.value}>{item.scheme_name}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Scheme Duration: </Text>
                  <Text style={styles.value}> {item.start_date
                    ? new Date(item.start_date).toLocaleDateString("en-GB")
                    : ""}-{item.end_date
                      ? new Date(item.end_date).toLocaleDateString("en-GB")
                      : ""}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Product Name: </Text>
                  <Text style={styles.value}>{item.product_name}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Buy Qty: </Text>
                  <Text style={styles.value}>{item.min_qty}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Free Product: </Text>
                  <Text style={styles.value}>{item.free_product_name}</Text>
                </View>

                {item.scheme_type == 'Free' &&
                  <View style={styles.row}>
                    <Text style={styles.label}>Free Qty: </Text>
                    <Text style={styles.value}>{item.free_qty}</Text>
                  </View>}

                {(item.scheme_type == 'Discount' || item.scheme_type == 'Discounted Same Product') &&
                  <View style={styles.row}>
                    <Text style={styles.label}>Discount Price: </Text>
                    <Text style={styles.value}>{item.discount_price}</Text>
                  </View>}
              </View>
            ))))}
        </ScrollView>
      </View>

      <Modal visible={modalvisible} transparent={true} animationType="slide">
        <TouchableOpacity onPress={() => { setModalvisible(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ position: 'absolute', top: modalPosition.top, left: modalPosition.left, gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10, }} >
            <TouchableOpacity onPress={handleEdit} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
              <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { confirmDelete(); closeModal(); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
              <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

export default AddScheme
const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 5,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#000',
    width: '35%'
  },
  value: {
    fontFamily: 'Inter-Regular', // fixed typo from 'Inter-Regualr'
    fontSize: 12,
    color: '#000',
    width: '55%',
  },
  Label: {
    fontSize: 12,
    color: 'gray',
    fontFamily: 'Inter-Medium',
    marginTop: 10,
    marginLeft: 3,
  },
});