import { View, Text, TouchableOpacity, Image, TextInput, Dimensions, ScrollView, ToastAndroid, Alert, ActivityIndicator, TouchableWithoutFeedback, Keyboard, Modal, BackHandler, AppState } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useFocusEffect, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import Constant from '../Commoncomponent/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { Checkbox } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';

const { width } = Dimensions.get('window');

const CreateOrder = ({ navigation }) => {
    const route = useRoute();
    const updatemodeRef = useRef(updatemode);
    const { companyname, mobile_no, customerid, order_no, orderdate, fetchremark, area, FestiveChecked, random_no, from, orderstatus } = route.params || {};

    const [value, setValue] = useState(null); // Selected product
    const [items, setItems] = useState([]);

    const [catvalue, setCatValue] = useState(null); // Selected category
    const [catitems, setCatItems] = useState([]);

    const [subcatvalue, setSubcatValue] = useState(null); // Selected subcategory
    const [subcatitems, setSubcatItems] = useState([]);

    const [date, setDate] = useState(orderdate ? new Date(orderdate) : new Date());  // Default to current date
    const [show, setShow] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [quantity, setQuantity] = useState(null);
    const [amount, setAmount] = useState(null);
    const [total, setTotal] = useState(null);
    const [remark, setRemark] = useState(fetchremark ? fetchremark : null);
    const [lastEditedField, setLastEditedField] = useState(null);

    const [temporderlist, setTemporderlist] = useState([]);
    const [randomno, setRandomno] = useState(random_no ? random_no : null);

    React.useEffect(() => {
        navigation.setParams({ random_no: randomno });
    }, [randomno]);

    const [loading, setLoading] = useState(false);
    const [mainloading, setMainloading] = useState(false);
    const [usertype, setUsertype] = useState(null);
    const [modalvisible, setModalvisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [selecteduser, setSelectedUser] = useState(null);
    const [selecteduserid, setselecteduserid] = useState(null);
    const [selecteduserdata, setSelecteduserdata] = useState(null);
    const [selectedcorderid, setSelectedcorderid] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [permissions, setPermissions] = useState([]);

    const [transport_remark, setTransport_remark] = useState(null);
    const [transport_amt, setTransport_amt] = useState(null);
    const [transportModal, setTransportmodal] = useState(false);
    const [updatemode, setUpdateMode] = useState(false);

    const [isFestiveChecked, setIsFestiveChecked] = useState(FestiveChecked == 'checked' ? true : false);
    const [orderdetaimodal, setOrderdetailModal] = useState(false);


    // Update the ref whenever updatemode changes
    useEffect(() => {
        updatemodeRef.current = updatemode;
    }, [updatemode]);

    //back Button par Alert
    useEffect(() => {
        const backAction = () => {
            // if (order_no) {
            //     Alert.alert('Cancel Order', 'Are you sure want to cancel updating the order ?', [
            //         {
            //             text: 'No',
            //             onPress: () => null,
            //             style: 'cancel',
            //         },
            //         { text: 'Yes', onPress: () => { cancelupdateOrderApi(); navigation.goBack(null); } },
            //     ]);
            // } else {
            Alert.alert('Cancel Order', 'Are you sure want to cancel the order ?', [
                {
                    text: 'No',
                    onPress: () => null,
                    style: 'cancel',
                },
                { text: 'Yes', onPress: () => cancelOrderApiCall() },
            ]);
            // }
            return true; // Prevent default back action
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove(); // Cleanup listener on unmount
    }, [order_no]);

    // const appState = useRef(AppState.currentState);

    // useEffect(() => {
    //     const handleAppStateChange = (nextAppState) => {
    //         if (
    //             appState.current.match(/active/) &&
    //             (nextAppState === 'background' || nextAppState === 'inactive')
    //         ) {
    //             if (temporderlist.length > 0) {
    //                 cancelOrderApiCall(); // App going to background → clean up
    //             }
    //         }
    //         appState.current = nextAppState;
    //     };

    //     const subscription = AppState.addEventListener('change', handleAppStateChange);

    //     return () => subscription.remove();
    // }, [temporderlist]);

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };
    const displayDate = formatDate(date);

    const formatTime = (date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = String(minutes).padStart(2, '0');
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };
    const displayTime = formatTime(date);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(false);
        setDate(currentDate);
        setShowTimePicker(true);
    };

    const showDatePicker = () => {
        setShow(true);
    };

    const onTimeChange = (event, selectedDate) => {
        const currentTime = selectedDate || date;
        setShowTimePicker(false);
        setDate(currentTime);
    };

    // fetch Permissions
    const listPermissions = async () => {
        const id = await AsyncStorage.getItem('admin_id');

        const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: id }),
        });
        const result = await response.json();
        if (result.code == "200") {

            // Prepare permissions state
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
    };

    // fetch user type
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

    useFocusEffect(
        React.useCallback(() => {
            listPermissions();
            fetchusertype();
        }, [])
    );

    // fetch categories
    const listcategory = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.list_category}`;
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
                label: item.name,
                value: item.cid,
            }));
            setCatItems(formattedItems);
        } else {
            console.log('error while listing category');
        }
    };
    useFocusEffect(
        React.useCallback(() => {
            listcategory();
        }, [])
    );

    // fetch sub categories
    const listsubcategory = async () => {
        if (!catvalue) {
            // If no category is selected, set itemsinmodal to an empty array or handle accordingly
            setSubcatItems([]);
            return;
        }
        const url = `${Constant.URL}${Constant.OtherURL.list_subcategory}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cid: catvalue,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            const subcatitem = result.payload.map((item) => ({
                label: item.subcategory_name,
                value: item.subcategoryid,
            }));
            setSubcatItems(subcatitem);
        } else {
            setSubcatItems([]);
            console.log('error while listing subcategory');
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            listsubcategory();
        }, [catvalue])
    );

    // fetch products
    const listProducts = async (forceUpdateMode = false) => {
        const currentUpdateMode = forceUpdateMode || updatemodeRef.current;
        if (!catvalue || !subcatvalue) {
            // If no category is selected, set itemsinmodal to an empty array or handle accordingly
            setItems([]);
            return;
        }
        const url = `${Constant.URL}${Constant.OtherURL.product_search}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                category_id: catvalue,
                subcategory_id: subcatvalue,
                customer_id: customerid,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            const existingProductIds = temporderlist.map(item => item.product_id);

            let productlist;

            if (currentUpdateMode) {
                // In update mode, show ALL products without filtering
                productlist = result.payload.map((item) => ({
                    label: item.product_name,
                    value: item.product_id,
                    price: item.product_price,
                    profit_one_box: item.profit_one_box,
                    gst_profit_one_box: item.gst_profit_one_box,
                }));
            } else {
                // Normal mode: filter out products that exist in temporderlist
                productlist = result.payload
                    .filter(item => !existingProductIds.includes(item.product_id))
                    .map((item) => ({
                        label: item.product_name,
                        value: item.product_id,
                        price: item.product_price,
                        profit_one_box: item.profit_one_box,
                        gst_profit_one_box: item.gst_profit_one_box,
                    }));
            }

            setItems(productlist);
        } else {
            setItems([]);
            console.log('error while listing products');
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            listProducts();
        }, [catvalue, subcatvalue, temporderlist])
    );

    const handleProductSelect = (selectedValue) => {
        setValue(selectedValue);

        const selectedProduct = items.find(item => item.value == selectedValue);
        if (selectedProduct) {
            setAmount(selectedProduct.price);
            setLastEditedField(null);
        }
    };

    // add order to temp table
    const addordertemp = async () => {
        // setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const url = `${Constant.URL}${Constant.OtherURL.add_order}`;

        const selectedProduct = items.find((item) => item.value == value);

        const combinedDateTime = new Date(date);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        combinedDateTime.setHours(hours);
        combinedDateTime.setMinutes(minutes);

        // Format without timezone conversion
        function formatLocalDateTime(date) {
            const pad = (num) => String(num).padStart(2, '0');

            const year = date.getFullYear();
            const month = pad(date.getMonth() + 1);
            const day = pad(date.getDate());
            const hours = pad(date.getHours());
            const minutes = pad(date.getMinutes());
            const seconds = pad(date.getSeconds());

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        const orderDate = formatLocalDateTime(combinedDateTime);

        const existingProduct = temporderlist.find(
            item => item.product_id === value
        );
        if (order_no) { // Check if order_no is present
            if (existingProduct && amount > 0) {
                // Show alert if product already exists
                const selectedOption = items.find(option => option.value == value);
                const productLabel = selectedOption ? selectedOption.label : value;
                Alert.alert(
                    'Product Already Exists',
                    `The product ${productLabel} is already in the list. Would you like to update the quantity instead?`,
                    [
                        {
                            text: 'No',
                            onPress: () => console.log('Update canceled'),
                            style: 'cancel',
                        },
                        {
                            text: 'Yes',
                            onPress: async () => {
                                console.log('Proceed with updating the existing product in order');
                                await updateorderconfirm(); // Call addOrUpdateProduct if user confirms
                            },
                        },
                    ],
                    { cancelable: false }
                );
            } else {
                // If no existing product or amount is 0, proceed directly with addOrUpdateProduct
                await updateorderconfirm();
            }
        } else {

            if (existingProduct && amount > 0) {
                // Show an alert if the product already exists
                const selectedOption = items.find(option => option.value == value);
                const productLabel = selectedOption ? selectedOption.label : value;
                Alert.alert(
                    'Product Already Exists',
                    `The product ${productLabel} is already in the list. Would you like to update the quantity instead?`,
                    [
                        {
                            text: 'No',
                            onPress: () => console.log('Add product canceled'),
                            style: 'cancel',
                        },
                        {
                            text: 'Yes',
                            onPress: async () => {
                                // Only proceed with adding/updating the product when the user clicks "Yes"
                                console.log('Proceed with updating the product');

                                setLoading(true);
                                const response = await fetch(url, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        user_id: id,
                                        product_id: value,
                                        customer_id: customerid,
                                        order_type: 'box',
                                        item_name: selectedProduct ? selectedProduct.label : '',
                                        item_qty: quantity,
                                        item_price: amount,
                                        total_price: total,
                                        order_date: orderDate,
                                        random_no: randomno ? randomno : '',
                                        profit_one_box: selectedProduct ? selectedProduct.profit_one_box : '',
                                        gst_profit_one_box: selectedProduct ? selectedProduct.gst_profit_one_box : '',
                                    }),
                                });
                                const result = await response.json();
                                if (result.code == "200") {
                                    setRandomno(result.payload.random_no)
                                    setValue(null);
                                    // setCatValue(null);
                                    // setSubcatValue(null);
                                    setQuantity(null);
                                    setAmount(null);
                                    setTotal(null);
                                    listtemporder(result.payload.random_no);
                                } else {
                                    console.log('error while adding product 1');
                                } setLoading(false);
                            },
                        },
                    ],
                    { cancelable: false }
                );
            } else {
                // If product doesn't exist, proceed directly to adding the product
                setLoading(true);
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: id,
                        product_id: value,
                        customer_id: customerid,
                        order_type: 'box',
                        item_name: selectedProduct ? selectedProduct.label : '',
                        item_qty: quantity,
                        item_price: amount,
                        total_price: total,
                        order_date: orderDate,
                        random_no: randomno ? randomno : '',
                        profit_one_box: selectedProduct ? selectedProduct.profit_one_box : '',
                        gst_profit_one_box: selectedProduct ? selectedProduct.gst_profit_one_box : '',
                    }),
                });
                const result = await response.json();
                if (result.code == "200") {
                    setRandomno(result.payload.random_no)
                    setValue(null);
                    // setCatValue(null);
                    // setSubcatValue(null);
                    setQuantity(null);
                    setAmount(null);
                    setTotal(null);
                    listtemporder(result.payload.random_no);
                } else {
                    console.log('error while adding product');
                } setLoading(false);
            }
        }
    };

    // update order in temp table
    const updateordertemp = async () => {
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const url = `${Constant.URL}${Constant.OtherURL.update_orderlist}`;

        const selectedProduct = items.find((item) => item.value == value);

        const combinedDateTime = new Date(date); // Start with the selected date
        const hours = date.getHours();
        const minutes = date.getMinutes();
        combinedDateTime.setHours(hours);
        combinedDateTime.setMinutes(minutes);

        // Format the combined date and time in a way your backend can handle (e.g., ISO string)
        const orderDate = combinedDateTime.toISOString(); // or use any other desired format

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_id: selecteduserid,
                user_id: id,
                product_id: value,
                customer_id: customerid,
                order_type: 'box',
                item_name: selectedProduct ? selectedProduct.label : '',
                item_qty: quantity,
                item_price: amount,
                total_price: total,
                order_date: orderDate
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            listtemporder(randomno);
            setValue(null);
            setCatValue(null);
            setSubcatValue(null);
            setQuantity(null);
            setAmount(null);
            setTotal(null);
            setUpdateMode(false);
            setselecteduserid(null);
        } else {
            console.log('error while updating product');
        } setLoading(false);
    };

    // update order in confirm order table 
    const updateorderconfirm = async () => {
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const url = `${Constant.URL}${Constant.OtherURL.confirm_order_update}`;

        const selectedProduct = items.find((item) => item.value == value);

        const combinedDateTime = new Date(date); // Start with the selected date
        const hours = date.getHours();
        const minutes = date.getMinutes();
        combinedDateTime.setHours(hours);
        combinedDateTime.setMinutes(minutes);

        // Format the combined date and time in a way your backend can handle (e.g., ISO string)
        const orderDate = combinedDateTime.toISOString(); // or use any other desired format

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_no: order_no,
                user_id: id,
                product_id: value,
                customer_id: customerid,
                order_type: 'box',
                item_name: selectedProduct ? selectedProduct.label : '',
                item_qty: quantity,
                item_price: amount,
                total_price: total,
                order_date: orderDate,
                profit_one_box: selectedProduct ? selectedProduct.profit_one_box : '',
                gst_profit_one_box: selectedProduct ? selectedProduct.gst_profit_one_box : '',
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            fetchorderdetails();
            setValue(null);
            setCatValue(null);
            setSubcatValue(null);
            setQuantity(null);
            setAmount(null);
            setTotal(null);
            setUpdateMode(false);
            setselecteduserid(null);
        } else {
            console.log('error while updating product 1');
        } setLoading(false);
    };

    const listtemporder = async (random_no) => {
        const id = await AsyncStorage.getItem('admin_id');
        const url = `${Constant.URL}${Constant.OtherURL.order_list}`;
        const combinedDateTime = new Date(date); // Start with the selected date
        const hours = date.getHours();
        const minutes = date.getMinutes();
        combinedDateTime.setHours(hours);
        combinedDateTime.setMinutes(minutes);

        // Format the combined date and time in a way your backend can handle (e.g., ISO string)
        const orderDate = combinedDateTime.toISOString();
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: customerid,
                user_id: id,
                order_date: orderDate,
                random_no: random_no
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setTemporderlist(result.payload)
        } else {
            setTemporderlist([]);
            console.log('error while listing temporary orders');
        }
    };

    // edit order list and add from manage_confirm_order_edit table
    const insertorderinedittable = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.edit_order}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_no: order_no,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            fetchorderdetails();
        } else {
            console.log('error while adding order to manage_confirm_order_edit');
        }
    };

    const fetchorderdetails = async () => {
        // const url = `${Constant.URL}${Constant.OtherURL.edit_order_list}`;
        const url = `${Constant.URL}${Constant.OtherURL.confirmlist_order}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_no: order_no,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setTemporderlist(result.payload);
            const festive = result.festival_order;
            setIsFestiveChecked(festive == 'Yes' ? true : false)
        } else {
            setTemporderlist([]);
            console.log('error while listing product');
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            if (order_no && from == 'productprice') {
                fetchorderdetails();
            } else if (order_no) {
                // insertorderinedittable();
                fetchorderdetails();
            } else {
                listtemporder(randomno);
            }
        }, [order_no, randomno])
    );

    const handleConfirmOrder = () => {
        if (order_no) {
            updateorder();
        } else if (isFestiveChecked) {
            confirmorderfestive();
        } else {
            confirmorder();
        }
        setModalVisible(false);
    };

    const confirmeditorder = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.confirm_edit_order}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_no: order_no,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            await updateorder();          // wait for update to complete
            await cancelupdateOrderApi();
        } else {
            console.log('error while editing order');
        }
    };

    // confirm whole order
    const confirmorder = async () => {
        setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');

        const order_id = temporderlist.map((item, index) => item.order_id.toString());
        const product_id = temporderlist.map((item, index) =>
            item.product_id.toString(),
        );
        const order_type = temporderlist.map(item => item.order_type);
        const item_name = temporderlist.map(item => item.item_name); // Ensure this property exists
        const item_qty = temporderlist.map(item => item.item_qty); // Ensure this property exists
        const item_price = temporderlist.map(item => item.item_price); // Ensure this property exists
        const total_price = temporderlist.map(item => item.total_price);
        const profit_one_box = temporderlist.map(item => item.profit_one_box);
        const gst_profit_one_box = temporderlist.map(item => item.gst_profit_one_box);

        const url = `${Constant.URL}${Constant.OtherURL.confirm_order}`;
        const combinedDateTime = new Date(date);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        combinedDateTime.setHours(hours);
        combinedDateTime.setMinutes(minutes);

        // Format without timezone conversion
        function formatLocalDateTime(date) {
            const pad = (num) => String(num).padStart(2, '0');

            const year = date.getFullYear();
            const month = pad(date.getMonth() + 1);
            const day = pad(date.getDate());
            const hours = pad(date.getHours());
            const minutes = pad(date.getMinutes());
            const seconds = pad(date.getSeconds());

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        const orderDate = formatLocalDateTime(combinedDateTime);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: id,
                customer_id: customerid,
                product_id: product_id,
                order_id: order_id,
                order_type: order_type,
                item_name: item_name,
                item_qty: item_qty,
                item_price: item_price,
                total_price: total_price,
                order_date: orderDate,
                remark: remark,
                transport_remark: transport_remark,
                transport_price: transport_amt,
                profit_one_box: profit_one_box,
                gst_profit_one_box: gst_profit_one_box
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            const orderFirestore = {
                orderId: result.order_id || Date.now().toString(),
                totalAmount: result.total_amount,
                createdBy: result.created_by, // e.g. fetched from AsyncStorage or user context
                customername: companyname,
                createdAt: firestore.FieldValue.serverTimestamp(),
            };

            await firestore().collection('orders').add(orderFirestore);

            ToastAndroid.show(
                'Your order has been Created successfully!',
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM
            );
            navigation.replace('OrderList');
            setModalVisible(false);
            setTransport_remark(null);
            setTransport_amt(null);
        } else {
            console.log('error while creating order');
        } setMainloading(false);
    };

    const confirmorderfestive = async () => {
        setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');

        const order_id = temporderlist.map((item, index) => item.order_id.toString());
        const product_id = temporderlist.map((item, index) =>
            item.product_id.toString(),
        );
        const order_type = temporderlist.map(item => item.order_type);
        const item_name = temporderlist.map(item => item.item_name); // Ensure this property exists
        const item_qty = temporderlist.map(item => item.item_qty); // Ensure this property exists
        const item_price = temporderlist.map(item => item.item_price); // Ensure this property exists
        const total_price = temporderlist.map(item => item.total_price);

        const url = `${Constant.URL}${Constant.OtherURL.festival_order}`;
        const combinedDateTime = new Date(date);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        combinedDateTime.setHours(hours);
        combinedDateTime.setMinutes(minutes);

        // Format without timezone conversion
        function formatLocalDateTime(date) {
            const pad = (num) => String(num).padStart(2, '0');

            const year = date.getFullYear();
            const month = pad(date.getMonth() + 1);
            const day = pad(date.getDate());
            const hours = pad(date.getHours());
            const minutes = pad(date.getMinutes());
            const seconds = pad(date.getSeconds());

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        const orderDate = formatLocalDateTime(combinedDateTime);
        const festival_order = isFestiveChecked ? 'Yes' : 'No';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: id,
                customer_id: customerid,
                product_id: product_id,
                order_id: order_id,
                order_type: order_type,
                item_name: item_name,
                item_qty: item_qty,
                item_price: item_price,
                total_price: total_price,
                order_date: orderDate,
                remark: remark,
                transport_remark: transport_remark,
                transport_price: transport_amt,
                festival_order: festival_order,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            const orderFirestore = {
                orderId: result.order_id || Date.now().toString(),
                totalAmount: result.total_amount,
                createdBy: result.created_by, // e.g. fetched from AsyncStorage or user context
                customername: companyname,
                createdAt: firestore.FieldValue.serverTimestamp(),
            };

            await firestore().collection('orders').add(orderFirestore);

            ToastAndroid.show(
                'Your order has been Created successfully!',
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM
            );
            navigation.replace('OrderList');
            setModalVisible(false);
            setTransport_remark(null);
            setTransport_amt(null);
        } else {
            console.log('error while creating order');
        } setMainloading(false);
    };

    // update whole order
    const updateorder = async () => {
        console.log('updateorder 1')
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.update_date}`;
        const combinedDateTime = new Date(date);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        combinedDateTime.setHours(hours);
        combinedDateTime.setMinutes(minutes);

        // Format without timezone conversion
        function formatLocalDateTime(date) {
            const pad = (num) => String(num).padStart(2, '0');

            const year = date.getFullYear();
            const month = pad(date.getMonth() + 1);
            const day = pad(date.getDate());
            const hours = pad(date.getHours());
            const minutes = pad(date.getMinutes());
            const seconds = pad(date.getSeconds());

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        const orderDate = formatLocalDateTime(combinedDateTime);
        const festival_order = isFestiveChecked ? 'Yes' : 'No';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_date: orderDate,
                order_no: order_no,
                remark: remark,
                festival_order: festival_order,
                // order_status: orderstatus,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            ToastAndroid.show(
                'Your order has been Updated successfully!',
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM
            );
            // navigation.replace('OrderList');
            navigation.reset({
                index: 1,
                routes: [
                    { name: 'Dashboard' },  // Keep HomeScreen in the stack
                    { name: 'OrderList' }    // Navigate to Userslist
                ],
            });
            setModalVisible(false);
        } else {
            console.log('error while creating order');
        } setMainloading(false);
    };

    // update order add new product in existing order
    const updateconfirmorderadd = async () => {
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');

        const selectedProduct = items.find((item) => item.value == value);

        const url = `${Constant.URL}${Constant.OtherURL.confirm_orderupdate}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                corder_id: selectedcorderid,
                user_id: id,
                customer_id: customerid,
                product_id: value,
                order_type: 'box',
                item_name: selectedProduct ? selectedProduct.label : '',
                item_qty: quantity,
                item_price: amount,
                total_price: total,
                // order_date: orderDate
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            fetchorderdetails();
            setSelectedcorderid(null);
            setValue(null);
            // setCatValue(null);
            // setSubcatValue(null);
            setQuantity(null);
            setAmount(null);
            setTotal(null);
            setUpdateMode(false);
            setselecteduserid(null);

        } else {
            console.log('error while updating order product');
        } setLoading(false);
    };

    useEffect(() => {
        if (quantity && amount && (lastEditedField != 'total')) {
            const calculatedTotal = Math.round(parseFloat(quantity) * parseFloat(amount));
            setTotal(calculatedTotal.toString());
        }
    }, [quantity, amount]);

    useEffect(() => {
        if (quantity && total && lastEditedField == 'total') {
            const parsedQty = parseFloat(quantity);
            const parsedTotal = parseFloat(total);
            if (parsedQty !== 0 && !isNaN(parsedQty) && !isNaN(parsedTotal)) {
                const calculatedAmount = (parsedTotal / parsedQty).toFixed(2);
                setAmount(calculatedAmount.toString());
            }
        }
    }, [total]);


    const openModal = (item, x, y) => {
        console.log(item);
        setModalPosition({ top: y - 15, left: x - 110 });
        setSelectedUser(item.item_name);
        setselecteduserid(item.order_id);
        setSelectedcorderid(item.corder_id ? item.corder_id : null);
        setSelecteduserdata(item);
        setModalvisible(true);
    };

    const closeModal = () => {
        setModalvisible(false);
    };
    const handleEdit = () => {
        if (selecteduserdata) {
            setUpdateMode(true);
            setValue(selecteduserdata.product_id);
            setCatValue(selecteduserdata.category_id);
            setSubcatValue(selecteduserdata.subcategory_id);
            setQuantity(selecteduserdata.item_qty);
            setAmount(selecteduserdata.item_price);
            setTotal(selecteduserdata.total_price);
            setModalvisible(false);

            updatemodeRef.current = true;

            // Call listProducts with forceUpdate flag
            setTimeout(() => {
                console.log('Calling listProducts with updatemodeRef:', updatemodeRef.current);
                listProducts(true); // Pass true to force update mode
            }, 100);
        }
    };

    const cancelOrderApiCall = async () => {
        if (temporderlist.length === 0) {
            navigation.goBack(); // Double-check before API call
            return;
        }
        const order_id = temporderlist.map((item, index) => item.order_id.toString());
        const url = `${Constant.URL}${Constant.OtherURL.cancel_order}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_id: order_id,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            navigation.goBack();
        } else {
            // setTemporderlist([]);
        }
        setMainloading(false);
    };

    const cancelupdateOrderApi = async () => {
        console.log('cancelupdateOrderApi')

        const url = `${Constant.URL}${Constant.OtherURL.edit_order_delete}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_no: order_no,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            // navigation.goBack();
        } else {
            // setTemporderlist([]);
        }
        setMainloading(false);
    };

    const handletempDelete = async (id) => {
        const url = `${Constant.URL}${Constant.OtherURL.tempdelete}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_id: id,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            closeModal();
            listtemporder(randomno);
            setselecteduserid(null);
            // setValue(null);
            // setCatValue(null);
            setSubcatValue(null);
            setQuantity(null);
            setAmount(null);
            setTotal(null);
            setUpdateMode(false);
        } else {
            // setTemporderlist([]);
        }
        setMainloading(false);
    };

    const handleconfirmDelete = async (id) => {
        console.log("df", id, order_no);

        const url = `${Constant.URL}${Constant.OtherURL.singledelete_confirmorder}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                corder_id: String(id),
            }),
        });
        const result = await response.json(); // Parse manually
        if (result.code == "200") {
            console.log(result);
            closeModal();
            fetchorderdetails();
            setSelectedcorderid(null);
            setselecteduserid(null);
        } else {
            // setTemporderlist([]);
        }
    };

    const confirmDelete = () => {
        Alert.alert(
            "Delete Order",
            `Are you sure you want to delete this ${selecteduser} item?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => {
                        if (order_no) {
                            handleconfirmDelete(selectedcorderid);
                        } else {
                            handletempDelete(selecteduserid);
                        }
                    }
                }
            ]
        );
    };

    const hasmarginPermissions = permissions['Show Margin'];

    return (
        <View style={{ flex: 1 }}>
            <View style={{ backgroundColor: '#173161', flexDirection: 'row', height: 50, alignItems: 'center', gap: 20 }}>
                <TouchableOpacity onPress={() => {
                    // if (order_no) {
                    //     Alert.alert('Cancel Order', 'Are you sure you want to cancel updating the order?', [
                    //         {
                    //             text: 'No',
                    //             onPress: () => null,
                    //             style: 'cancel',
                    //         },
                    //         {
                    //             text: 'Yes',
                    //             onPress: async () => {
                    //                 try {
                    //                     await cancelupdateOrderApi(); // Call the API
                    //                     navigation.goBack(); // Navigate back after API call
                    //                 } catch (error) {
                    //                     console.error("Error canceling order:", error);
                    //                 }
                    //             },
                    //         },
                    //     ]);
                    // } else {
                    Alert.alert('Cancel Order', 'Are you sure you want to cancel the order?', [
                        {
                            text: 'No',
                            onPress: () => null,
                            style: 'cancel',
                        },
                        {
                            text: 'Yes',
                            onPress: async () => {
                                try {
                                    await cancelOrderApiCall(); // Call the API
                                    navigation.goBack(); // Navigate back after API call
                                } catch (error) {
                                    console.error("Error canceling order:", error);
                                }
                            },
                        },
                    ]);
                    // }
                }}>
                    <Image source={require('../../assets/arrow_back.png')} style={{ marginLeft: 10, height: 25, width: 25 }} />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1, alignItems: 'center', width: '100%' }}>
                    <TouchableOpacity
                        // onPress={() => navigation.navigate('ProductPrice', { companyname: companyname, mobile: mobile_no, area: area, customerid: customerid, from: 'Createorder', order_no: order_no, randomno: randomno })} 
                        style={{ width: '60%', }}>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: '#FFF', fontFamily: 'Inter-SemiBold', fontSize: 14, marginLeft: 0, textTransform: 'capitalize', }}>{companyname}</Text>
                        <Text style={{ color: '#fff', fontFamily: 'Inter-Regular', fontSize: 14, marginLeft: 0 }}>{order_no ? order_no : mobile_no}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={showDatePicker} style={{ width: '40%', marginRight: 5, }}>
                        <Text style={{ color: 'white', fontSize: 10, fontFamily: 'Inter-Regular', textAlign: 'right', paddingRight: 5 }}>
                            {displayDate} {displayTime}{/* Display current date */}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            {show && (
                <DateTimePicker
                    value={date}
                    mode='date'
                    is24Hour={false}
                    display="default"
                    onChange={onChange}
                    minimumDate={new Date()}
                />
            )}
            {/* <ScrollView keyboardShouldPersistTaps='handled'> */}

            {/* {permissions?.Festive?.Festive && (
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginRight: 10 }}>
                    <Checkbox
                        status={isFestiveChecked ? 'checked' : 'unchecked'} // Set checked/unchecked status
                        onPress={() => setIsFestiveChecked(!isFestiveChecked)} // Toggle checkbox state
                        color='#173161'
                    />
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>Festive</Text>
                </View>
            )} */}
            {/* DateTimePicker for Time Selection */}
            {showTimePicker && (
                <DateTimePicker
                    value={date}
                    mode="time"
                    is24Hour={true} // This enables 12-hour format
                    display="clock"
                    onChange={onTimeChange}
                />
            )}

            <View style={{ marginTop: 10, zIndex: 100 }}>
                {catitems && catitems.length > 0 ? (
                    <Dropdown
                        style={{
                            width: '95%',
                            height: 45,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: 'gray',
                            backgroundColor: updatemode ? '#E0E0E0' : '#F5F5F5',
                            alignSelf: 'center',
                            opacity: updatemode ? 0.4 : 1,
                            paddingHorizontal: 10,

                        }}
                        placeholderStyle={{
                            fontFamily: 'Inter-Regular',
                            fontSize: 14,
                            color: 'gray',
                        }}
                        selectedTextStyle={{
                            fontFamily: 'Inter-Medium',
                            fontSize: 14,
                            color: '#000',
                        }}
                        containerStyle={{
                            borderRadius: 8,
                            elevation: 2,
                            backgroundColor: '#fff',
                            maxHeight: 600,
                            marginTop: 8
                        }}
                        autoScroll={false}
                        activeColor="#e6f0ff"
                        data={catitems}
                        search={false}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Category"
                        value={catvalue}
                        onChange={item => {
                            setCatValue(item.value);
                            setSubcatValue(null); // reset subcategory when category changes
                        }}
                        disable={updatemode}
                        renderItem={item => (
                            <View style={{ paddingVertical: 5, paddingHorizontal: 10, }}>
                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#000' }}>
                                    {item.label}
                                </Text>
                            </View>
                        )}
                    />
                ) : (
                    <View
                        style={{
                            width: '95%',
                            height: 45,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: 'gray',
                            backgroundColor: '#E0E0E0',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            paddingHorizontal: 10,
                        }}>
                        <Text
                            style={{
                                fontFamily: 'Inter-Regular',
                                fontSize: 14,
                                color: 'gray',
                            }}>
                            No Category Found
                        </Text>
                    </View>
                )}
            </View>

            <View style={{ marginTop: 10, zIndex: 50 }}>
                {subcatitems && subcatitems.length > 0 ? (
                    <Dropdown
                        style={{
                            width: '95%',
                            height: 45,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: 'gray',
                            backgroundColor: !catvalue || updatemode ? '#E0E0E0' : '#F5F5F5',
                            alignSelf: 'center',
                            opacity: !catvalue || updatemode ? 0.4 : 1,
                            paddingHorizontal: 10,
                        }}
                        placeholderStyle={{
                            fontFamily: 'Inter-Regular',
                            fontSize: 14,
                            color: 'gray',
                        }}
                        selectedTextStyle={{
                            fontFamily: 'Inter-Medium',
                            fontSize: 14,
                            color: '#000',
                        }}
                        containerStyle={{
                            borderRadius: 8,
                            elevation: 2,
                            backgroundColor: '#fff',
                            maxHeight: 600,
                            marginTop: 8
                        }}
                        autoScroll={false}
                        activeColor="#e6f0ff"
                        data={subcatitems}
                        search={false}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Sub-Category"
                        value={subcatvalue}
                        onChange={item => {
                            setSubcatValue(item.value);
                            setValue(null); // reset product when subcat changes
                        }}
                        disable={!catvalue || updatemode}
                        renderItem={item => (
                            <View style={{ paddingVertical: 5, paddingHorizontal: 10 }}>
                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#000' }}>
                                    {item.label}
                                </Text>
                            </View>
                        )}
                    />
                ) : (
                    <View
                        style={{
                            width: '95%',
                            height: 45,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: 'gray',
                            backgroundColor: '#E0E0E0',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            paddingHorizontal: 10,
                        }}>
                        <Text
                            style={{
                                fontFamily: 'Inter-Regular',
                                fontSize: 14,
                                color: 'gray',
                            }}>
                            No Sub-Category Found
                        </Text>
                    </View>
                )}
            </View>

            <View style={{ marginTop: 10, zIndex: 30 }}>
                <Dropdown
                    style={{
                        width: '95%',
                        height: 45,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: 'gray',
                        backgroundColor: !catvalue || !subcatvalue || updatemode ? '#E0E0E0' : '#F5F5F5',
                        alignSelf: 'center',
                        opacity: !catvalue || !subcatvalue || updatemode ? 0.4 : 1,
                        paddingHorizontal: 10,
                    }}
                    placeholderStyle={{
                        fontFamily: 'Inter-Regular',
                        fontSize: 14,
                        color: 'gray',
                    }}
                    selectedTextStyle={{
                        fontFamily: 'Inter-Medium',
                        fontSize: 14,
                        color: '#000',
                    }}
                    containerStyle={{
                        borderRadius: 8,
                        elevation: 2,
                        backgroundColor: '#fff',
                        maxHeight: 600,
                        marginTop: 8
                    }}
                    autoScroll={false}
                    activeColor="#e6f0ff"
                    data={items}
                    search={false}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={items.length == 0 ? "No product available" : "Select Product"}
                    value={value}
                    onChange={item => {
                        setValue(item.value);
                        if (!updatemode) handleProductSelect(item.value);
                    }}
                    disable={!catvalue || !subcatvalue || updatemode}
                    renderItem={item => (
                        <View style={{ paddingVertical: 5, paddingHorizontal: 10 }}>
                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#000' }}>
                                {item.label}
                            </Text>
                        </View>
                    )}
                />
            </View>


            {!permissions["Order Price"]?.["Show Rate"] && !permissions["Order Price"]?.["Show Total"] && (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 10, marginTop: 20, marginBottom: 16, }} >
                    <View>
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: 'black', textAlign: 'center' }}>QTY</Text>
                        <TextInput style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 5, fontSize: 14, width: width * 0.18, textAlign: 'center', fontFamily: 'Inter-Regular', color: '#000' }} placeholder="Qty" placeholderTextColor='gray' keyboardType="numeric" value={quantity} onChangeText={(val) => {
                            setQuantity(val);
                            setLastEditedField('quantity');
                        }} />
                    </View>
                    <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: '#000', marginTop: 10 }}>X</Text>
                    <View>
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: 'black', textAlign: 'center' }}>AMT</Text>
                        <TextInput style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 5, fontSize: 14, width: width * 0.18, textAlign: 'center', fontFamily: 'Inter-Regular', color: '#000' }} placeholder="Amount" placeholderTextColor='gray' keyboardType="numeric" value={amount} onChangeText={(val) => {
                            setAmount(val);
                            setLastEditedField('amount');
                        }} />
                    </View>
                    <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: '#000', marginTop: 10 }}>=</Text>

                    <View>
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: 'black', textAlign: 'center' }}>Total</Text>
                        {/* <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, fontSize: 14, width: width * 0.26, justifyContent: 'center', alignItems: 'center', height: 40 }} > */}
                        {/* <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: '#000' }}>{total}</Text> */}
                        <TextInput editable={usertype == 'Admin'} style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 5, fontSize: 14, width: width * 0.26, textAlign: 'center', fontFamily: 'Inter-Regular', color: '#000' }} placeholder="Total" placeholderTextColor='gray' keyboardType="numeric" value={total} onChangeText={(val) => {
                            setTotal(val);
                            setLastEditedField('total');
                        }} />
                        {/* </View> */}
                    </View>

                    <TouchableOpacity disabled={!value || !catvalue || !subcatvalue || !quantity || !amount || !total} onPress={() => {
                        if (selecteduserid && !order_no) {
                            updateordertemp();  // Calls this function if neither selecteduserid nor orderNo exist
                        } else if (selecteduserid && order_no) {
                            updateconfirmorderadd();
                        } else {
                            addordertemp();  // Calls this function if selecteduserid=selectedorderid is defined
                        }
                    }} style={{ marginTop: 12, backgroundColor: !value || !catvalue || !subcatvalue || !quantity || !amount || !total ? '#C5C6D0' : '#173161', borderRadius: 8, padding: 9, justifyContent: 'center', alignItems: 'center', width: width * 0.19, }} >
                        {loading ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Text style={{ color: !value || !catvalue || !subcatvalue || !quantity || !amount || !total ? 'black' : '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>{updatemode ? 'Update' : 'Add'}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {permissions["Order Price"]?.["Show Rate"] && permissions["Order Price"]?.["Show Total"] && (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 10, marginTop: 20, marginBottom: 16, gap: 10 }} >
                    <View>
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: 'black', textAlign: 'center' }}>QTY</Text>
                        <TextInput style={{ width: 70, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 5, fontSize: 14, textAlign: 'center', fontFamily: 'Inter-Regular', color: '#000' }} placeholder="Qty" placeholderTextColor='gray' keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
                    </View>
                    <TouchableOpacity disabled={!value || !catvalue || !subcatvalue || !quantity || !amount || !total} onPress={() => {
                        if (selecteduserid && !order_no) {
                            updateordertemp();  // Calls this function if neither selecteduserid nor orderNo exist
                        } else if (selecteduserid && order_no) {
                            updateconfirmorderadd();
                        } else {
                            addordertemp();  // Calls this function if selecteduserid is defined
                        }
                    }} style={{ width: 80, marginTop: 12, backgroundColor: !value || !catvalue || !subcatvalue || !quantity || !amount || !total ? '#C5C6D0' : '#173161', borderRadius: 8, padding: 9, justifyContent: 'center', alignItems: 'center', }} >
                        {loading ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Text style={{ color: !value || !catvalue || !subcatvalue || !quantity || !amount || !total ? 'black' : '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>{updatemode ? 'Update' : 'Add'}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {permissions["Order Price"]?.["Show Rate"] && !permissions["Order Price"]?.["Show Total"] && (

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 10, marginTop: 20, marginBottom: 16, }} >
                    <View>
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: 'black', textAlign: 'center' }}>QTY</Text>
                        <TextInput style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 5, fontSize: 14, width: width * 0.18, textAlign: 'center', fontFamily: 'Inter-Regular', color: '#000' }} placeholder="Qty" placeholderTextColor='gray' keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
                    </View>
                    <View>
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: 'black', textAlign: 'center' }}>AMT</Text>
                        <TextInput editable={false} style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 5, fontSize: 14, width: width * 0.18, textAlign: 'center', fontFamily: 'Inter-Regular', color: '#000' }} placeholder="Amount" placeholderTextColor='gray' keyboardType="numeric" value={amount} onChangeText={setAmount} />
                    </View>

                    <TouchableOpacity disabled={!value || !catvalue || !subcatvalue || !quantity || !amount || !total} onPress={() => {
                        if (selecteduserid && !order_no) {
                            updateordertemp();  // Calls this function if neither selecteduserid nor orderNo exist
                        } else if (selecteduserid && order_no) {
                            updateconfirmorderadd();
                        } else {
                            addordertemp();  // Calls this function if selecteduserid is defined
                        }
                    }} style={{ marginTop: 12, backgroundColor: !value || !catvalue || !subcatvalue || !quantity || !amount || !total ? '#C5C6D0' : '#173161', borderRadius: 8, padding: 9, justifyContent: 'center', alignItems: 'center', width: width * 0.19, }} >
                        {loading ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Text style={{ color: !value || !catvalue || !subcatvalue || !quantity || !amount || !total ? 'black' : '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>{updatemode ? 'Update' : 'Add'}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {!permissions["Order Price"]?.["Show Rate"] && permissions["Order Price"]?.["Show Total"] && (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 10, marginTop: 20, marginBottom: 16, }} >
                    <View>
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: 'black', textAlign: 'center' }}>QTY</Text>
                        <TextInput style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 5, fontSize: 14, width: width * 0.18, textAlign: 'center', fontFamily: 'Inter-Regular', color: '#000' }} placeholder="Qty" placeholderTextColor='gray' keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
                    </View>
                    <View>
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: 'black', textAlign: 'center' }}>Total</Text>
                        <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, fontSize: 14, width: width * 0.26, justifyContent: 'center', alignItems: 'center', height: 40 }} >
                            <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: '#000' }}>{permissions["Order Price"]?.["Show Total"] ? total : '-'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity disabled={!value || !catvalue || !subcatvalue || !quantity || !amount || !total} onPress={() => {
                        if (selecteduserid && !order_no) {
                            updateordertemp();  // Calls this function if neither selecteduserid nor orderNo exist
                        } else if (selecteduserid && order_no) {
                            updateconfirmorderadd();
                        } else {
                            addordertemp();  // Calls this function if selecteduserid is defined
                        }
                    }} style={{ marginTop: 12, backgroundColor: !value || !catvalue || !subcatvalue || !quantity || !amount || !total ? '#C5C6D0' : '#173161', borderRadius: 8, padding: 9, justifyContent: 'center', alignItems: 'center', width: width * 0.19, }} >
                        {loading ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Text style={{ color: !value || !catvalue || !subcatvalue || !quantity || !amount || !total ? 'black' : '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>{updatemode ? 'Update' : 'Add'}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
            {!permissions["Order Price"]?.["Show Rate"] && !permissions["Order Price"]?.["Show Total"] && (
                <View style={{ width: '100%', flexDirection: 'row', backgroundColor: '#e4f1ff', padding: 8, borderBottomWidth: 1, borderColor: '#ccc', }} >
                    <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'left', width: '5%' }}>
                        #
                    </Text>
                    <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'left', width: '35%', paddingLeft: 4 }}>
                        PRODUCT
                    </Text>
                    <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', width: '15%' }}>
                        QTY
                    </Text>
                    <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', width: '20%' }}>
                        AMOUNT
                    </Text>
                    <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', width: '20%' }}>
                        TOTAL
                    </Text>

                    <Text style={{ fontSize: 12, color: '#e4f1ff', fontFamily: 'Inter-SemiBold', textAlign: 'center', width: '5%' }}>
                        ..
                    </Text>
                </View>
            )}

            {permissions["Order Price"]?.["Show Rate"] && permissions["Order Price"]?.["Show Total"] && (
                <View style={{ width: '100%', flexDirection: 'row', backgroundColor: '#e4f1ff', padding: 8, borderBottomWidth: 1, borderColor: '#ccc', }} >
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-SemiBold', padding: 3, fontSize: 12 }}>#</Text>
                    </View>

                    <View style={{ width: '55%', justifyContent: 'center', alignItems: 'flex-start', }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-SemiBold', padding: 3, fontSize: 12 }}>PRODUCT</Text>
                    </View>

                    <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-RSemiBold', padding: 3, fontSize: 12 }}> QTY </Text>
                    </View>

                    {/* <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, }}>
                                            <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, textTransform: 'uppercase' }}> RATE </Text>
                                        </View>
                
                                        <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', }}>
                                            <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}> TOTAL </Text>
                                        </View> */}
                </View>
            )}

            {permissions["Order Price"]?.["Show Rate"] && permissions["Order Price"]?.["Show Total"] && (
                <View style={{ width: '100%', flexDirection: 'row', backgroundColor: '#e4f1ff', padding: 8, borderBottomWidth: 1, borderColor: '#ccc', }} >
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-SemiBold', padding: 3, fontSize: 12 }}>#</Text>
                    </View>

                    <View style={{ width: '42%', justifyContent: 'center', alignItems: 'flex-start', }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-SemiBold', padding: 3, fontSize: 12 }}>PRODUCT</Text>
                    </View>

                    <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-SemiBold', padding: 3, fontSize: 12 }}> QTY </Text>
                    </View>

                    {/* <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, }}>
                                            <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, textTransform: 'uppercase' }}> RATE </Text>
                                        </View> */}

                    <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-SemiBold', padding: 3, fontSize: 12 }}> TOTAL </Text>
                    </View>
                </View>
            )}
            {permissions["Order Price"]?.["Show Rate"] && permissions["Order Price"]?.["Show Total"] && (
                <View style={{ width: '100%', flexDirection: 'row', backgroundColor: '#e4f1ff', padding: 8, borderBottomWidth: 1, borderColor: '#ccc', }} >
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-SemiBold', padding: 3, fontSize: 12 }}>#</Text>
                    </View>

                    <View style={{ width: '42%', justifyContent: 'center', alignItems: 'flex-start', }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-SemiBold', padding: 3, fontSize: 12 }}>PRODUCT</Text>
                    </View>

                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-SemiBold', padding: 3, fontSize: 12 }}> QTY </Text>
                    </View>

                    <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-SemiBold', padding: 3, textTransform: 'uppercase', fontSize: 12 }}> AMOUNT </Text>
                    </View>

                    {/* <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', }}>
                                            <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}> TOTAL </Text>
                                        </View> */}
                </View>
            )}

            {/* ScrollView for Product Rows */}
            <View style={{ flex: 1 }}>
                {!permissions["Order Price"]?.["Show Rate"] && !permissions["Order Price"]?.["Show Total"] && (
                    <ScrollView keyboardShouldPersistTaps='handled' nestedScrollEnabled contentContainerStyle={{ flexGrow: 1 }}>
                        {temporderlist.map((item, index) => (
                            <View key={index} style={{ width: '100%', alignItems: 'center', flexDirection: 'row', backgroundColor: '#fff', paddingLeft: 4, borderBottomWidth: 1, borderColor: '#ccc', }} >
                                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '5%' }}>
                                    {index + 1}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'left', width: '35%', paddingLeft: 2 }}>
                                    {item.item_name}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '15%' }}>
                                    {item.item_qty}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '20%' }}>
                                    {item.item_price}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '18%' }}>
                                    {item.total_price}
                                </Text>

                                <TouchableOpacity onPress={(e) => {
                                    const { pageX, pageY } = e.nativeEvent;
                                    openModal(item, pageX, pageY);
                                }} style={{ paddingHorizontal: 5, paddingVertical: 10, }}>
                                    <Image source={require('../../assets/threedot.png')} style={{ height: 15, width: 15 }} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}

                {permissions["Order Price"]?.["Show Rate"] && permissions["Order Price"]?.["Show Total"] && (
                    <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{ flexGrow: 1 }}>
                        {temporderlist.map((item, index) => (
                            <View key={index} style={{ width: '100%', alignItems: 'center', flexDirection: 'row', backgroundColor: '#fff', paddingLeft: 4, borderBottomWidth: 1, borderColor: '#ccc', }} >
                                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '15%' }}>
                                    {index + 1}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'left', width: '55%', paddingLeft: 2 }}>
                                    {item.item_name}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '20%' }}>
                                    {item.item_qty}
                                </Text>
                                {/* <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '20%' }}>
                                    {item.item_price}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '18%' }}>
                                    {item.total_price}
                                </Text> */}

                                <TouchableOpacity onPress={(e) => {
                                    const { pageX, pageY } = e.nativeEvent;
                                    openModal(item, pageX, pageY);
                                }} style={{ paddingHorizontal: 5, paddingVertical: 10, }}>
                                    <Image source={require('../../assets/threedot.png')} style={{ height: 15, width: 15 }} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}

                {permissions["Order Price"]?.["Show Rate"] && !permissions["Order Price"]?.["Show Total"] && (
                    <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{ flexGrow: 1 }}>
                        {temporderlist.map((item, index) => (
                            <View key={index} style={{ width: '100%', alignItems: 'center', flexDirection: 'row', backgroundColor: '#fff', paddingLeft: 4, borderBottomWidth: 1, borderColor: '#ccc', }} >
                                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '15%' }}>
                                    {index + 1}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'left', width: '38%', paddingLeft: 2 }}>
                                    {item.item_name}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '20%' }}>
                                    {item.item_qty}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '18%' }}>
                                    {item.item_price}
                                </Text>
                                {/* <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '18%' }}>
                                    {item.total_price}
                                </Text> */}

                                <TouchableOpacity onPress={(e) => {
                                    const { pageX, pageY } = e.nativeEvent;
                                    openModal(item, pageX, pageY);
                                }} style={{ paddingHorizontal: 5, paddingVertical: 10, }}>
                                    <Image source={require('../../assets/threedot.png')} style={{ height: 15, width: 15 }} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}

                {permissions["Order Price"]?.["Show Rate"] && permissions["Order Price"]?.["Show Total"] && (
                    <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{ flexGrow: 1 }}>
                        {temporderlist.map((item, index) => (
                            <View key={index} style={{ width: '100%', alignItems: 'center', flexDirection: 'row', backgroundColor: '#fff', paddingLeft: 4, borderBottomWidth: 1, borderColor: '#ccc', }} >
                                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '15%' }}>
                                    {index + 1}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'left', width: '38%', paddingLeft: 2 }}>
                                    {item.item_name}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '20%' }}>
                                    {item.item_qty}
                                </Text>
                                {/* <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '20%' }}>
                                    {item.item_price}
                                </Text> */}
                                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '18%' }}>
                                    {item.total_price}
                                </Text>

                                <TouchableOpacity onPress={(e) => {
                                    const { pageX, pageY } = e.nativeEvent;
                                    openModal(item, pageX, pageY);
                                }} style={{ paddingHorizontal: 5, paddingVertical: 10, }}>
                                    <Image source={require('../../assets/threedot.png')} style={{ height: 15, width: 15 }} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 5, marginRight: 5 }}>
                <TouchableOpacity disabled={!temporderlist || temporderlist.length == 0} onPress={() => setTransportmodal(true)} style={{ backgroundColor: !temporderlist || temporderlist.length === 0 ? '#C5C6D0' : '#173161', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 10, alignItems: 'center' }} >
                    <Image source={require('../../assets/cargo-truck.png')} style={{ height: 20, width: 20, tintColor: !temporderlist || temporderlist.length == 0 ? 'gray' : '#fff' }} />
                </TouchableOpacity>
            </View>
            {/* Footer */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderTopWidth: 1, borderColor: '#ccc', }}>
                {hasmarginPermissions ?
                    <Text onLongPress={() => setOrderdetailModal(true)} style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Bold' }}>Total Margin:
                        <Text style={{ color: 'black', marginRight: 20, fontFamily: 'Inter-Regular', textAlign: 'right' }}>
                            {(temporderlist.reduce((totalprofit, item) => totalprofit + Math.round((Number(item.total_profit_one_box) || 0)), 0))}
                        </Text>
                    </Text>
                    : <Text></Text>}
                <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center', justifyContent: 'flex-end', }} >
                    <Text style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Bold' }}>Box:
                        <Text style={{ color: 'black', marginRight: 20, fontFamily: 'Inter-Regular', textAlign: 'right' }}>
                            {(temporderlist.reduce((quantity, item) => quantity + Math.round((Number(item.item_qty) || 0)), 0))}
                        </Text>
                    </Text>
                    <Text style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Bold' }}>Grand Total:
                        <Text style={{ color: 'black', marginRight: 20, fontFamily: 'Inter-Regular', textAlign: 'right' }}>
                            {(temporderlist.reduce((total, item) => total + Math.round((Number(item.total_price) || 0)), 0))}
                        </Text>
                    </Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 10 }}>
                <TouchableOpacity disabled={!temporderlist || temporderlist.length == 0} onPress={() => {
                    // if (order_no) {
                    //     Alert.alert('Cancel Order', 'Are you sure you want to cancel updating the order?', [
                    //         {
                    //             text: 'No',
                    //             onPress: () => null,
                    //             style: 'cancel',
                    //         },
                    //         {
                    //             text: 'Yes',
                    //             onPress: async () => {
                    //                 try {
                    //                     await cancelupdateOrderApi(); // Call the API
                    //                     navigation.goBack(); // Navigate back after API call
                    //                 } catch (error) {
                    //                     console.error("Error canceling order:", error);
                    //                 }
                    //             },
                    //         },
                    //     ]);
                    // } else {
                    Alert.alert('Cancel Order', 'Are you sure you want to cancel the order?', [
                        {
                            text: 'No',
                            onPress: () => null,
                            style: 'cancel',
                        },
                        {
                            text: 'Yes',
                            onPress: async () => {
                                try {
                                    await cancelOrderApiCall(); // Call the API
                                    navigation.goBack(); // Navigate back after API call
                                } catch (error) {
                                    console.error("Error canceling order:", error);
                                }
                            },
                        },
                    ]);
                    // }
                }} style={{ backgroundColor: !temporderlist || temporderlist.length === 0 ? '#C5C6D0' : '#e60000', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, width: '40%', alignItems: 'center' }}>
                    <Text style={{ color: !temporderlist || temporderlist.length == 0 ? '#000' : '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity disabled={!temporderlist || temporderlist.length == 0} onPress={() => setModalVisible(true)} style={{ backgroundColor: !temporderlist || temporderlist.length === 0 ? '#C5C6D0' : '#173161', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, width: '40%', alignItems: 'center' }} >
                    {mainloading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text style={{ color: !temporderlist || temporderlist.length == 0 ? '#000' : '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>{order_no ? 'Update Order' : 'Create Order'}</Text>
                    )}
                </TouchableOpacity>
            </View>

            <Modal visible={modalvisible} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setModalvisible(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ position: 'absolute', top: modalPosition.top, left: modalPosition.left, gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10, }} >
                        <TouchableOpacity onPress={handleEdit} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { confirmDelete(); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={modalVisible} transparent animationType="slide">
                <TouchableOpacity onPress={() => { setModalVisible(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', padding: 20, backgroundColor: 'white', borderRadius: 10, }} >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: '#000' }}></Text>
                            <TouchableOpacity onPress={() => { setModalVisible(false); setRemark(''); }} style={{ alignSelf: 'center' }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>
                        <Text style={{ fontSize: 14, marginLeft: 5, marginBottom: 10, fontFamily: 'Inter-Regular', color: 'gray' }}>
                            Enter Remark
                        </Text>
                        <TextInput style={{ width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 10, marginBottom: 20, color: '#000', fontFamily: 'Inter-Regular' }} value={remark} onChangeText={setRemark} />
                        <View style={{ alignItems: 'center' }}>
                            <TouchableOpacity onPress={handleConfirmOrder} style={{ backgroundColor: '#173161', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, width: '40%', alignItems: 'center' }} >
                                {mainloading ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={transportModal} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setTransportmodal(false); setTransport_remark(''); setTransport_amt(''); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: '#000' }}></Text>
                            <TouchableOpacity onPress={() => { setTransportmodal(false); setTransport_remark(''); setTransport_amt(''); }} style={{ alignSelf: 'center' }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>
                        <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: '#000' }}>Transport Amount</Text>
                        <TextInput
                            placeholder="Enter Transport Amount"
                            placeholderTextColor='gray'
                            value={transport_amt}
                            onChangeText={setTransport_amt}
                            keyboardType='numeric'
                            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 20, color: '#000', fontFamily: 'Inter-Regular' }}
                        />

                        <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: '#000' }}>Transport Remark</Text>
                        <TextInput
                            placeholder="Enter Transport Remark"
                            placeholderTextColor='gray'
                            value={transport_remark}
                            onChangeText={setTransport_remark}
                            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 20, color: '#000', fontFamily: 'Inter-Regular' }}
                        />
                        {/* {error ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginBottom: 10 }}>{error}</Text> : ''} */}
                        {loading ? (
                            <ActivityIndicator size="large" color="#173161" />
                        ) : (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity disabled={!transport_amt} onPress={() => { setTransportmodal(false); }} style={{ width: 120, backgroundColor: !transport_amt ? '#C5C6D0' : '#173161', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
                                    <Text style={{ color: !transport_amt ? '#000' : '#fff', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                        Next
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => { setTransportmodal(false); setTransport_remark(''); setTransport_amt(''); }} style={{ width: 120, backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 20, alignItems: 'center', borderColor: '#173161', borderWidth: 1 }}>
                                    <Text style={{ color: '#173161', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={orderdetaimodal} transparent animationType="slide">
                <TouchableOpacity
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                    activeOpacity={1}
                    onPress={() => setOrderdetailModal(false)}
                >
                    <TouchableOpacity
                        style={{
                            width: '95%',
                            paddingVertical: 20,
                            paddingHorizontal: 5,
                            backgroundColor: 'white',
                            borderRadius: 10,
                        }}
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 10, borderBottomWidth: 0.5, borderColor: '#ccc', paddingBottom: 3 }}>
                            <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: '#000' }}>Profit Summary</Text>
                            <TouchableOpacity onPress={() => { setOrderdetailModal(false) }} style={{ alignSelf: 'center' }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>

                        {temporderlist && temporderlist.length > 0 && temporderlist[0].order_no && (
                            <Text style={{ fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#666', marginBottom: 2, marginLeft: 10 }}>
                                Order No: {temporderlist[0].order_no || 'N/A'}
                            </Text>
                        )}

                        <View>
                            <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.5, borderColor: 'black', }}>
                                <View style={{ width: '7%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.5, borderColor: 'black', }}>
                                    <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, fontSize: 12 }}>#</Text>
                                </View>

                                <View style={{ width: '30%', justifyContent: 'center', alignItems: 'flex-start', borderColor: 'black', borderRightWidth: 0.5, }}>
                                    <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, fontSize: 12 }}>PRODUCT</Text>
                                </View>

                                <View style={{ width: '12%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, flexDirection: 'row' }}>
                                    <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, fontSize: 12 }}> QTY </Text>
                                </View>

                                <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderColor: 'black', borderRightWidth: 0.5, }}>
                                    <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, fontSize: 12, textTransform: 'uppercase' }}>Margin</Text>
                                </View>

                                <View style={{ width: '26%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', }}>
                                    <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, fontSize: 12, textTransform: 'uppercase' }}>Margin after GST</Text>
                                </View>
                            </View>

                            {temporderlist && temporderlist.length > 0 ? (
                                <>
                                    {temporderlist.map((item, index) => (
                                        <View key={index}>
                                            <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.3, borderColor: 'black', }} >
                                                {/* SR NO */}
                                                <View style={{ width: '7%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                        {index + 1}
                                                    </Text>
                                                </View>

                                                {/* NAME */}
                                                <View style={{ width: '30%', justifyContent: 'center', alignItems: 'flex-start', borderColor: 'black', borderRightWidth: 0.3, }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, textTransform: 'capitalize', }} >
                                                        {item.item_name}
                                                    </Text>
                                                </View>

                                                {/* QTY */}
                                                <View style={{ width: '12%', flexDirection: 'row', justifyContent: 'center', borderRightWidth: 0.3, alignItems: 'center', borderColor: 'black', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12, }} >
                                                        {item.item_qty}
                                                    </Text>
                                                </View>

                                                <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12, borderBottomWidth: 0.5, borderColor: '#000' }} >
                                                        {parseFloat(item.profit_one_box).toFixed(2)}*{item.item_qty}
                                                    </Text>
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12, }} >
                                                        {Math.round(item.total_profit_one_box)}
                                                    </Text>
                                                </View>

                                                <View style={{ width: '26%', justifyContent: 'center', alignItems: 'center', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12, borderBottomWidth: 0.5, borderColor: '#000' }} >
                                                        {parseFloat(item.gst_profit_one_box).toFixed(2)}*{item.item_qty}
                                                    </Text>
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                        {Math.round(item.total_gst_profit_one_box)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                    {/* Total Row */}
                                    <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0', borderWidth: 0.5, borderColor: 'black', }}>
                                        <View style={{ width: '7%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>
                                            <Text style={{ color: 'black', fontFamily: 'Inter-Bold', padding: 3 }}></Text>
                                        </View>

                                        <View style={{ width: '30%', justifyContent: 'center', alignItems: 'flex-start', borderColor: 'black', borderRightWidth: 0.5 }}>
                                            <Text style={{ color: 'black', fontFamily: 'Inter-Bold', padding: 3 }}>TOTAL</Text>
                                        </View>

                                        <View style={{ width: '12%', flexDirection: 'row', justifyContent: 'center', borderRightWidth: 0.5, alignItems: 'center', borderColor: 'black' }}>
                                            <Text style={{ color: 'black', fontFamily: 'Inter-Bold', fontSize: 12 }}>
                                                {temporderlist.reduce((sum, item) => sum + (parseFloat(item.item_qty) || 0), 0)}
                                            </Text>
                                        </View>

                                        <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.5 }}>
                                            <Text style={{ color: 'black', fontFamily: 'Inter-Bold', padding: 3, fontSize: 12 }}>
                                                {Math.round(temporderlist.reduce((sum, item) => sum + (parseFloat(item.total_profit_one_box) || 0), 0))}
                                            </Text>
                                        </View>

                                        <View style={{ width: '26%', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ color: 'black', fontFamily: 'Inter-Bold', padding: 3, fontSize: 12 }}>
                                                {Math.round(temporderlist.reduce((sum, item) => sum + (parseFloat(item.total_gst_profit_one_box) || 0), 0))}
                                            </Text>
                                        </View>
                                    </View>
                                </>
                            ) : null}
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
            {/* </ScrollView> */}
        </View>
        // </TouchableWithoutFeedback>
    )
}

export default CreateOrder