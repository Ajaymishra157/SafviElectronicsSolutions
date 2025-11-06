import { View, Text, TouchableOpacity, Image, ActivityIndicator, ScrollView, Keyboard, RefreshControl, Linking, Modal, TextInput, Dimensions, StatusBar, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import { useFocusEffect } from '@react-navigation/native';
import Constant from '../Commoncomponent/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';

const FestiveOrderlist = ({ navigation, route }) => {
  const { order_no, filterdate, filterstatus } = route.params || {}
  const [myorders, setMyorders] = useState([]);
  const [mainloading, setMainloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [formatteddate, setFormattedDate] = useState(filterdate || null);
  const [refreshing, setRefreshing] = useState(false);
  const [usertype, setUsertype] = useState(null);
  const [user_id, setUser_id] = useState(null);
  const [advanceorder, setAdvanceOrder] = useState(null);
  const [selectedorder, setSelectedOrder] = useState(null);
  const [isordermerged, setIsorderMerged] = useState(null);
  const [selectedorderstatus, setSelectedorderstatus] = useState(null);
  const [urgentorder, setUrgentorder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [remark, setRemark] = useState(null);

  const [openstatus, setOpenStatus] = useState(false); // Controls dropdown visibility
  const [valuestatus, setValueStatus] = useState(filterstatus ? filterstatus : 'Pending'); // Selected category value
  const [itemsstatus, setItemsStatus] = useState([
    { label: 'All Status', value: 'All Status' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Loading', value: 'Loading' },
    { label: 'Cancel', value: 'Cancelled' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Advanced', value: 'Advanced' },
    { label: 'On The Way', value: 'On The Way' }
  ]);

  const [openloadingopt, setOpenLoadingopt] = useState(false); // Controls dropdown visibility
  const [valueloadingopt, setValueLoadingopt] = useState('Drop'); // Selected category value
  const [itemsloadingopt, setItemsLoadingopt] = useState([
    { label: 'Drop', value: 'Drop' },
    { label: 'PickUp', value: 'PickUp' },
  ]);
  const [openvehicle, setOpenVehicle] = useState(false); // Controls dropdown visibility
  const [valuevehicle, setValueVehicle] = useState(null); // Selected category value
  const [itemsvehicle, setItemsVehicle] = useState([]);
  const [addvehicle, setAddvehicle] = useState(null);
  const [vehiclemodal, setVehiclemodal] = useState(false);

  const [modalvisible, setModalvisible] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  const [ordernomodal, setOrdernomodal] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);

  const [remarkmodal, setRemarkModal] = useState(false);
  const scrollRef = useRef();

  useFocusEffect(
    React.useCallback(() => {
      if (order_no) {
        const focusedOrderNo = order_no;
        const focusedIndex = myorders.findIndex(order => order.order_no === focusedOrderNo);

        if (focusedIndex != -1 && scrollRef.current) {
          // Calculate the scroll position based on the index
          const itemHeight = 300; // Adjust this based on the height of your order items
          const scrollY = focusedIndex * itemHeight;
          scrollRef.current.scrollTo({ y: scrollY, animated: true });
        }
      }
    }, [myorders, order_no])
  );

  const openModal = (item, x, y) => {
    const modalWidth = 200; // Modal width (fixed)
    const windowWidth = Dimensions.get('window').width;
    const extraSpace = 40; // Adjust this value for more space
    const centerX = x - modalWidth / 2;
    const leftPosition = Math.max(20, Math.min(centerX, windowWidth - modalWidth - extraSpace));

    setModalPosition({ top: y - 15, left: leftPosition });
    setSelectedOrder(item.order_no);
    setIsorderMerged(item.merge_order);
    setSelectedorderstatus(item.status);
    setUrgentorder(item.set_urgent);
    setModalvisible(true);
  };

  const openMergeOrderModal = (selectedOrderNo) => {
    navigation.navigate('MergeOrder', { selectedOrderNo })
  };

  const handleChangeDate = (event, selectedDate) => {
    if (event.type == 'dismissed') {
      setShow(false);
      return;
    }
    const currentDate = selectedDate || new Date();
    setShow(false);

    // Format date as YYYY/MM/DD
    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

    setDate(currentDate); // Save the actual date object
    setFormattedDate(formattedDate); // Save the formatted string
  };

  const formatfilterDate = (dateString) => {
    if (!dateString) return "00-00-0000"; // Default if no date is provided
    const date = new Date(dateString); // Convert to Date object
    const day = String(date.getDate()).padStart(2, '0'); // Get day and pad if needed
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-based, add 1)
    const year = date.getFullYear(); // Get full year

    return `${day}/${month}/${year}`;
  };

  const fetchusertype = async () => {
    setLoading(true);
    const id = await AsyncStorage.getItem('admin_id');

    const url = `${Constant.URL}${Constant.OtherURL.fetch_usertype}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: id }),
    });
    const result = await response.json();
    if (result.code == "200") {
      setUsertype(result.payload.user_type)
    } else {
      console.log('Error fetching permissions');
    }
    setLoading(false);
  };

  const [permissionlist, setPermissionsList] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const listPermissions = async () => {
    setMainloading(true);
    const id = await AsyncStorage.getItem('admin_id');
    const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: id }),
    });
    const result = await response.json();
    if (result.code == "200") {
      setPermissionsList(result.payload);
      let permissionsData = {};
      result.payload.forEach((item) => {
        const permsArray = item.menu_permission.split(',');
        let permsObject = {};
        permsArray.forEach((perm) => {
          permsObject[perm] = true;
        });
        permissionsData[item.menu_name] = permsObject;
      });

      setPermissions(permissionsData);
    } else {
      console.log('Error fetching permissions');
    }
    setMainloading(false);
  };

  const hasPermissions = permissions['Orders'] || {};
  useFocusEffect(
    React.useCallback(() => {
      fetchusertype();
      listPermissions();
    }, [])
  );

  const listmyorders = async () => {
    setLoading(true);
    const url = `${Constant.URL}${Constant.OtherURL.festival_order_list}`;
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
      setMyorders(result.payload);
      setAdvanceOrder(result.count)
    } else {
      setMyorders([]);
      console.log('error while listing orders');
    }
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      listmyorders();
    }, [])
  );

  const setorderurgent = async () => {
    setMainloading(true);
    const url = `${Constant.URL}${Constant.OtherURL.set_urgent}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_no: selectedorder,
        argent_type: 'Set Urgent',
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      setModalvisible(false);
      listmyorders();
    } else {
      console.log('error while listing product');
    }
    setMainloading(false);
  };

  const Unmergeorder = async (selectedorder) => {
    setMainloading(true);
    const url = `${Constant.URL}${Constant.OtherURL.mergeorder_delete}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_no: selectedorder,
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      setModalvisible(false);
      listmyorders();
    } else {
      console.log('error while unmerging order');
    }
    setMainloading(false);
  };

  const handleSelectUnMergeOrder = (orderNo) => {
    Alert.alert(
      "Confirm Unmerge",
      `Are you sure you want to unmerge order ${selectedorder}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => Unmergeorder(orderNo) }
      ]
    );
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setSearchTerm(null);
    navigation.setParams({ order_no: null });
    listmyorders().then(() => setRefreshing(false));
  }, [formatteddate, valuestatus, searchTerm]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of the year

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // 12 AM/PM case

    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  };

  const listvehicle = async () => {
    setLoading(true);
    const url = `${Constant.URL}${Constant.OtherURL.list_vehicle_entries}`;
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
      const formattedItems = result.payload.map((item) => ({
        label: item.vic_no,
        value: item.id,
      }));
      setItemsVehicle(formattedItems);
    } else {
      setItemsVehicle([])
      console.log('error while listing vehicle');
    }
    setLoading(false);
  };
  useFocusEffect(
    React.useCallback(() => {
      listvehicle();
    }, [])
  );

  const updateStatus = async (status, remark) => {
    setLoading(true);
    const id = await AsyncStorage.getItem('admin_id');
    const url = `${Constant.URL}${Constant.OtherURL.update_status}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: id,
        order_no: selectedorder,
        status: status,
        remarks: remark
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      setModalvisible(false);
      listmyorders();
      setRemark('');
      setRemarkModal(false);
    } else {
      console.log('error while listing vehicle');
    }
    setLoading(false);
  };

  const [errors, setErrors] = useState({
    addvehicle: '',
    selectvehicle: '',
  });

  const validateFields = () => {
    const newErrors = {};

    if (valueloadingopt == "Drop") {
      newErrors.selectvehicle = valuevehicle ? '' : 'Vehicle is required';
    } else {
      newErrors.addvehicle = addvehicle ? '' : 'Vehicle is required';
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === '');
  };


  const vehicleentry = async () => {
    if (!validateFields()) return;
    setLoading(true);
    const id = await AsyncStorage.getItem('admin_id');
    const selectedVehicle = itemsvehicle.find(item => item.value === valuevehicle);
    const vehicleLabel = selectedVehicle ? selectedVehicle.label : valuevehicle;
    const url = `${Constant.URL}${Constant.OtherURL.add_vic_entry}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: id,
        order_no: selectedorder,
        vic_no: addvehicle ? addvehicle : vehicleLabel,
        type: valueloadingopt
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      setVehiclemodal(false);
      setValueLoadingopt('Drop')
      setOpenLoadingopt(false);
      setOpenVehicle(false);
      setValueVehicle(null);
      setAddvehicle(null);
      listmyorders();
      updateStatus("Loading", "");
    } else {
      console.log('error while listing vehicle');
    }
    setLoading(false);
  };

  const handleOnTheWay = (status) => {
    if (status == 'On The Way') {
      updateStatus("Cancel On The Way", "");
    } else {
      updateStatus("On The Way", "");
    }
  };

  const handleresettopending = () => {
    updateStatus("Pending", '');
  };

  const handleCancel = () => {
    updateStatus("Cancelled", remark);
  };

  const handleloading = (status) => {
    if (status == 'Loading') {
      updateStatus("Cancel Loading", "");
    } else {
      setVehiclemodal(true);
      setModalvisible(false)
    }
  };

  const filteredOrders = myorders.filter(order => {
    if (!searchTerm) return true;
    return order.order_no?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (mainloading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#173161" />
      </View>
    );
  }
  return (
    // <TouchableWithoutFeedback onPress={() => { setOpenStatus(false); Keyboard.dismiss(); }}>
    <View style={{ flex: 1 }}>
      <View>
        <StatusBar backgroundColor="#173161" barStyle="light-content" />
        <View style={{ backgroundColor: '#173161', flexDirection: 'row', height: 50, alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require('../../assets/arrow_back.png')} style={{ marginLeft: 10, height: 25, width: 25 }} />
          </TouchableOpacity>
          <Text numberOfLines={1} style={{ color: '#FFF', fontFamily: 'Inter-Bold', fontSize: 16, marginLeft: 0 }}>Festive Orders</Text>
          <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 18, marginLeft: 20 }}>..</Text>
        </View>
      </View>

      {/* <View style={{ marginHorizontal: 10, marginBottom: 5, marginTop:10 }}>
          <TextInput placeholder='Search By Order No' value={searchTerm} onChangeText={(text) => setSearchTerm(text)} placeholderTextColor='gray' style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: '#173161', borderWidth: 1, borderColor: '#737373', backgroundColor: '#fff', borderRadius: 15, paddingHorizontal: 10 }} />
        </View> */}

      {/* {advanceorder ? (
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#e60000', marginHorizontal: 20 }}>
            Advance Orders: {advanceorder}
          </Text>
        ) : null} */}

      <View style={{ flex: 1, }}>
        <ScrollView keyboardShouldPersistTaps='handled' nestedScrollEnabled={true} refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
          {loading ? (
            <View style={{ alignItems: 'center', marginTop: 10 }}>
              <ActivityIndicator size="large" color="#173161" />
            </View>
          ) :
            filteredOrders.length == 0 ? (
              <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No Festive Orders available</Text>
            ) : (
              filteredOrders.map((item, index) => (
                <View key={index} style={{
                  gap: 10, paddingBottom: 5,
                  paddingTop: 5,
                  borderColor: '#000',
                }}>
                  <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 10, marginHorizontal: item.merge_order ? 3 : 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View>
                        <View style={{ flexDirection: 'row', width: '85%', }}>
                          <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#173161' }}>Name: </Text>
                          <Text style={{ width: '85%', fontFamily: 'Inter-Regular', fontSize: 12, color: '#173161', textTransform: 'uppercase', textAlignVertical: 'center' }}>{item.company_name}{item.area ? ` (${item.area})` : ''}</Text>
                        </View>

                        <View style={{ flexDirection: 'row', }}>
                          <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#173161' }}>Mobile No: </Text>
                          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase', textAlignVertical: 'center' }}>{item.mobile_no}</Text>
                        </View>
                      </View>

                      <TouchableOpacity onPress={() => navigation.navigate('FestiveOrderDetails', { customerid: item.customer_id, companyname: item.company_name })} style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={require('../../assets/skip-track.png')} style={{ height: 15, width: 15 }} />
                      </TouchableOpacity>

                    </View>
                  </View>

                </View>
              ))
            )}
        </ScrollView>
      </View>

      <Modal visible={modalvisible} transparent={true} animationType="slide">
        <TouchableOpacity onPress={() => { setModalvisible(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ position: 'absolute', top: modalPosition.top, left: modalPosition.left, gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10, }} >
            {usertype != 'Transporter' && selectedorderstatus != 'Cancelled' &&
              <TouchableOpacity disabled={selectedorderstatus != 'Pending'} onPress={setorderurgent} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', opacity: selectedorderstatus != 'Pending' ? 0.5 : 1 }}>
                <Image source={require('../../assets/exclamation.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>{urgentorder == 'Yes' ? 'Cancel Urgent' : 'Set Urgent'}</Text>
              </TouchableOpacity>}
            {usertype != 'Salesman' && selectedorderstatus != 'Cancelled' &&
              <>
                <TouchableOpacity disabled={selectedorderstatus == 'On The Way'} onPress={() => handleloading(selectedorderstatus)} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', opacity: selectedorderstatus == 'On The Way' ? 0.5 : 1 }}>
                  <Image source={require('../../assets/truck.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                  <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>{selectedorderstatus == 'Loading' ? 'Cancel Loading' : 'Loading'}</Text>
                </TouchableOpacity>
                <TouchableOpacity disabled={selectedorderstatus == 'Pending'} onPress={() => handleOnTheWay(selectedorderstatus)} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', opacity: selectedorderstatus == 'Pending' ? 0.5 : 1 }}>
                  <Image source={require('../../assets/vehicle.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                  <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>{selectedorderstatus == 'On The Way' ? 'Cancel On The Way' : 'On The Way'}</Text>
                </TouchableOpacity>
              </>}
            {(usertype == 'Admin' && selectedorderstatus == 'Pending' && selectedorderstatus != 'Cancelled') && (
              <TouchableOpacity onPress={() => { (isordermerged == null ? openMergeOrderModal(selectedorder) : handleSelectUnMergeOrder(selectedorder)); setRemarkModal(false); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', opacity: 1 }}>
                <Image source={require('../../assets/merge.png')} style={{ height: 16, width: 16, tintColor: '#173161' }} />
                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>{isordermerged == null ? 'Merge Order' : 'Unmerge Order'}</Text>
              </TouchableOpacity>
            )}
            {(hasPermissions.Cancel && selectedorderstatus != 'Delivered' && selectedorderstatus != 'Cancelled') && (
              <TouchableOpacity onPress={() => { setRemarkModal(true); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', opacity: 1 }}>
                <Image source={require('../../assets/cancel.png')} style={{ height: 14, width: 14, tintColor: '#173161' }} />
                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Cancel</Text>
              </TouchableOpacity>
            )}

            {(selectedorderstatus == 'Cancelled') && (
              <TouchableOpacity onPress={() => handleresettopending()} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', opacity: 1 }}>
                <Image source={require('../../assets/reset.png')} style={{ height: 14, width: 14, tintColor: '#173161' }} />
                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Reset To Pending</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Loading drop and pickup modal */}
      <Modal visible={vehiclemodal} transparent={true} animationType="slide">
        <TouchableOpacity onPress={() => { setVehiclemodal(false); setOpenLoadingopt(false); setOpenVehicle(false); setValueLoadingopt('Drop') }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 10, paddingBottom: 20, paddingTop: 20, borderRadius: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: '#fff' }}>*</Text>
              <TouchableOpacity onPress={() => { setVehiclemodal(false); setOpenLoadingopt(false); setOpenVehicle(false); setValueLoadingopt('Drop') }} style={{ alignSelf: 'center' }}>
                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: '#404040', fontFamily: 'Inter-SemiBold', fontSize: 14, borderWidth: 1, opacity: 0.5, borderColor: 'gray', borderRadius: 10, padding: 10, paddingVertical: 15, marginHorizontal: 5, marginBottom: 10 }}>Loading</Text>
            <View style={{ marginBottom: 20, zIndex: openloadingopt ? 3000 : 1 }}>
              <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: 'gray', paddingHorizontal: 10 }}>Transport Type
                <Text style={{ color: '#e60000' }}>*</Text>
              </Text>
              <DropDownPicker
                placeholder="Select option"
                open={openloadingopt}
                value={valueloadingopt}
                items={itemsloadingopt}
                setOpen={(isOpen) => {
                  setOpenLoadingopt(isOpen);
                  if (isOpen) {
                    Keyboard.dismiss();
                    setOpenVehicle(false);
                  }
                }}
                setValue={setValueLoadingopt}
                setItems={setItemsLoadingopt}
                style={{
                  width: '95%',
                  height: 40,
                  borderRadius: 5,
                  borderColor: '#173161',
                  alignSelf: 'center'
                }}
                textStyle={{
                  fontFamily: 'Inter-Bold',
                  fontSize: 14,
                  color: '#173161',
                }}
                placeholderStyle={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 14,
                  color: 'gray',
                }}
                dropDownContainerStyle={{
                  borderColor: '#fff',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                  backgroundColor: '#fff'
                }}
              />
              {/* {errors.category ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginTop: 10, marginLeft: 10 }}>{errors.category}</Text> : null} */}
            </View>

            {valueloadingopt == 'Drop' ? (
              <View style={{ marginBottom: 20, zIndex: openvehicle ? 2000 : 1 }}>
                <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: 'gray', paddingHorizontal: 10 }}>Vehicle
                  <Text style={{ color: '#e60000' }}>*</Text>
                </Text>
                <DropDownPicker
                  placeholder="Select Vehicle"
                  open={openvehicle}
                  value={valuevehicle}
                  items={itemsvehicle}
                  setOpen={(isOpen) => {
                    setOpenVehicle(isOpen);
                    if (isOpen) {
                      Keyboard.dismiss();
                      setOpenLoadingopt(false);
                    }
                  }}
                  setValue={setValueVehicle}
                  setItems={setItemsVehicle}
                  style={{
                    width: '95%',
                    height: 40,
                    borderRadius: 5,
                    borderColor: errors.selectvehicle ? 'red' : '#173161',
                    alignSelf: 'center'
                  }}
                  textStyle={{
                    fontFamily: 'Inter-Bold',
                    fontSize: 14,
                    color: '#173161',
                  }}
                  placeholderStyle={{
                    fontFamily: 'Inter-Regular',
                    fontSize: 14,
                    color: 'gray',
                  }}
                  dropDownContainerStyle={{
                    borderColor: '#fff',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 2,
                    backgroundColor: '#fff'
                  }}
                />
                {errors.selectvehicle ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginTop: 10, marginLeft: 10 }}>{errors.selectvehicle}</Text> : null}

              </View>
            ) : (
              <>
                <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: 'gray', paddingHorizontal: 10 }}>Vehicle
                  <Text style={{ color: '#e60000' }}>*</Text>
                </Text>
                <TextInput
                  placeholder="Enter Vehicle"
                  placeholderTextColor='gray'
                  value={addvehicle}
                  onChangeText={setAddvehicle}
                  style={{ marginHorizontal: 10, borderWidth: 1, borderColor: errors.addvehicle ? 'red' : '#ccc', borderRadius: 5, padding: 10, marginBottom: errors.addvehicle ? 10 : 20, color: '#000', fontFamily: 'Inter-Regular' }}
                /></>
            )}
            {errors.addvehicle ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 10, marginBottom: 10 }}>{errors.addvehicle}</Text> : null}

            {loading ? (
              <ActivityIndicator size="large" color="#173161" />
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => { vehicleentry(); }} style={{ width: 120, backgroundColor: '#173161', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                    Save
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { setVehiclemodal(false); setOpenLoadingopt(false); setOpenVehicle(false); setValueLoadingopt('Drop') }} style={{ width: 120, backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 20, alignItems: 'center', borderColor: '#173161', borderWidth: 1 }}>
                  <Text style={{ color: '#173161', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={remarkmodal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <View
            style={{
              width: '80%',
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 10,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 8, fontFamily: 'Inter-Regular', color: '#000' }}>
              </Text>
              <TouchableOpacity onPress={() => { setRemarkModal(false) }} style={{ alignSelf: 'center' }}>
                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 14, marginLeft: 5, marginBottom: 10, fontFamily: 'Inter-Regular', color: 'gray' }}>
              Enter Remark
            </Text>
            <TextInput
              style={{
                width: '100%',
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                borderRadius: 10,
                marginBottom: 20,
                color: '#000',
                fontFamily: 'Inter-Regular'
              }}
              value={remark}
              onChangeText={setRemark}
            />
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity onPress={handleCancel} style={{ backgroundColor: '#007bff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, width: '40%', alignItems: 'center' }} >
                {mainloading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View >
    // </TouchableWithoutFeedback>
  )
}

export default FestiveOrderlist