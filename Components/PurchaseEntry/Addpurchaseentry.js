import { View, Text, TouchableOpacity, Image, Keyboard, Modal, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import Constant from '../Commoncomponent/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { RadioButton } from 'react-native-paper';

const Addpurchaseentry = ({ navigation, route }) => {
  const { bill_no, partyid, purchase_no, purchasedate } = route.params || {}
  const [customeropen, setCustomerOpen] = useState(false); // Controls dropdown visibility
  const [customervalue, setCustomerValue] = useState(partyid ? partyid : null); // Selected product
  const [customeritems, setCustomerItems] = useState([
    usertype == 'Admin' ? { label: 'Add New Party', value: 'add_new', icon: () => <Text>➕</Text> } : {},
  ]);
  const [newCategoryModalVisible, setNewCategoryModalVisible] = useState(false); // Modal visibility
  const [partyName, setpartyName] = useState(null);
  const [error, setError] = useState(null);
  const [mobile_no, setMobile_no] = useState(null);
  const [gstno, setGstno] = useState(null);

  const [catopen, setCatOpen] = useState(false); // Controls dropdown visibility
  const [catvalue, setCatValue] = useState(null); // Selected category
  const [catitems, setCatItems] = useState([]);

  const [subcatopen, setSubcatOpen] = useState(false); // Controls dropdown visibility
  const [subcatvalue, setSubcatValue] = useState(null); // Selected subcategory
  const [subcatitems, setSubcatItems] = useState([
    usertype == 'Admin' ? { label: 'Add New Type', value: 'add_new', icon: () => <Text>➕</Text> } : {},
  ]);

  const [subcategoryopen, setSubcategoryOpen] = useState(false); // Controls dropdown visibility
  const [subcategoryvalue, setSubcategoryValue] = useState(null); // Selected subcategory
  const [subcategoryitems, setSubcategoryItems] = useState([]);

  const [productopen, setProductOpen] = useState(false); // Controls dropdown visibility
  const [productvalue, setProductValue] = useState(null); // Selected subcategory
  const [productitems, setProductItems] = useState([]);

  const [date, setDate] = useState(new Date());  // Default to current date
  const [show, setShow] = useState(false);

  const [updatemode, setUpdateMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [modalvisible, setModalvisible] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  const [typemodal, setTypeModal] = useState(false);
  const [addtype, setAddtype] = useState(null);

  const [purchasetype, setPurchasetype] = useState(null);
  const [billno, setBillno] = useState(bill_no || null);
  const [boxrate, setBoxrate] = useState(null);
  const [kgrate, setKgrate] = useState(null);
  const [tonrate, setTonrate] = useState(null);
  const [pcsrate, setPcsrate] = useState(null);
  const [gram, setGram] = useState(null);
  const [perKg, setPerKg] = useState(0);
  const [stocklist, setStocklist] = useState([]);
  const [purchaseno, setpurchaseno] = useState(null);
  const [selectedentry, setSelectedEntry] = useState(null);
  const [selectedpurchaseid, setSelectedpurchaseid] = useState(null);
  const [selectedpreform_id, setSelectedPreform_id] = useState(null);
  const [error1, setError1] = useState(null);

  const [usertype, setUsertype] = useState(null);

  const formatDate = (date) => {
    if (!date) return ""; // Handle empty or undefined date

    const parsedDate = new Date(date); // Convert string date to Date object
    if (isNaN(parsedDate)) return date; // If invalid, return original value

    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // Format purchasedate if available, otherwise use the current date
  const displayDate = purchasedate ? formatDate(purchasedate) : formatDate(date);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
  };

  const showDatePicker = () => {
    setShow(true);
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

  const partylist = async () => {
    const url = `${Constant.URL}${Constant.OtherURL.party_list}`;
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
        label: item.party_name,
        value: item.id,
      }));
      const userItems = usertype == 'Admin' ? [
        { label: 'Add New Party', value: 'add_new', icon: () => <Text>➕</Text> },
        ...formattedItems
      ] : formattedItems;
      setCustomerItems(userItems);
      setNewCategoryModalVisible(false); // Close the modal
      setpartyName('');
      setMobile_no('');
      setGstno('');
    } else {
      console.log('error while listing parties');
    }
  };

  const addnewparty = async () => {
    if (!partyName || partyName.trim() == '') {
      setError('Party Name is required'); // Set error if validation fails
      return;
    }
    setLoading(true);
    const url = `${Constant.URL}${Constant.OtherURL.addparty}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        party_name: partyName,
        mobile_no: mobile_no,
        gst_no: gstno
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      setNewCategoryModalVisible(false);
      setCustomerOpen(true);
      partylist();
    } else {
      console.log('error while adding party');
    } setLoading(false)
  };
  const listsubcategory = async () => {
    const url = `${Constant.URL}${Constant.OtherURL.list_subcategory}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cid: 30,
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      const subcatitem = result.payload.map((item) => ({
        label: item.subcategory_name,
        value: item.subcategoryid,
      }));
      setSubcategoryItems(subcatitem);
    } else {
      setSubcategoryItems([]);
      console.log('error while listing subcategory');
    }
  };

  const listProducts = async () => {
    if (!subcategoryvalue) {
      // If no category is selected, set itemsinmodal to an empty array or handle accordingly
      setProductItems([]);
      return;
    }
    const url = `${Constant.URL}${Constant.OtherURL.subcategory_wise_product_list}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subcategory_id: subcategoryvalue,
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      const productlist = result.payload.map((item) => ({
        label: item.product_name,
        value: item.product_id,
        // pcs: item.product_qty,
        // price: item.product_price,
      }));
      setProductItems(productlist);
    } else {
      setProductItems([]);
      console.log('error while listing products');
    }
  };

  const listcategory = async () => {
    const url = `${Constant.URL}${Constant.OtherURL.listing_preform}`;
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
      const formattedItem = result.payload.map((item) => ({
        label: item.preform_type,
        value: item.id,
      }));
      setCatItems(formattedItem);
    } else {
      setCatItems([]);
      console.log('error while listing category');
    }
  };

  const listsubcat = async () => {
    const url = `${Constant.URL}${Constant.OtherURL.listpreform}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sub_id: catvalue
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      const formatteddata = result.payload.map((item) => ({
        label: item.preform_number,
        value: item.id,
        perkg: item.per_kg,
        icon: usertype == 'Admin' && item.id != 'add_new'
          ? () => (
            <TouchableOpacity onPress={() => openTypeModal(item)}>
              <Image source={require('../../assets/pencil.png')} style={{ height: 15, width: 15, tintColor: '#000' }} />
            </TouchableOpacity>
          )
          : undefined
      }));
      const subItems = usertype == 'Admin' ? [
        { label: 'Add New Type', value: 'add_new', icon: () => <Text>➕</Text> },
        ...formatteddata
      ] : formatteddata;
      setSubcatItems(subItems);
    } else {
      setSubcatItems([]);
      console.log('error while listing sub category');
    }
  };

  const openTypeModal = (item) => {
    setSelectedPreform_id(item.id);
    setAddtype(String(item.preform_number));
    setTypeModal(true);
  };

  const addnewtype = async () => {
    if (!addtype || addtype.trim() == '') {
      setError1('Type Name is required'); // Set error if validation fails
      return;
    }
    setLoading(true);
    const url = `${Constant.URL}${Constant.OtherURL.addpreform}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sub_id: catvalue,
        preform_number: addtype,
      }),
    });
    const result = await response.json();
    if (result.code == 200) {
      setTypeModal(false);
      setSubcatOpen(true);
      setAddtype(null);
      listsubcat();
      setError1(null);
    } else {
      console.log('error while adding type');
    } setLoading(false)
  };

  const updatetype = async () => {
    if (!addtype || addtype.trim() == '') {
      setError1('Type Name is required'); // Set error if validation fails
      return;
    }
    setLoading(true);
    const url = `${Constant.URL}${Constant.OtherURL.updatepreform}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preform_id: selectedpreform_id,
        preform_number: addtype,
      }),
    });
    const result = await response.json();
    if (result.code == 200) {
      setTypeModal(false);
      setSubcatOpen(true);
      setAddtype(null);
      listsubcat();
      setError1(null);
    } else {
      console.log('error while adding type');
    } setLoading(false)
  };

  const handleSubcatChange = (value) => {
    // If the value is 'add_new', do not select it and open the modal
    if (value == 'add_new') {
      setSubcatValue('');  // Clear the value so it's not selected
      setTypeModal(true);  // Open the modal
      return;  // Prevent further processing for 'add_new'
    }

    // Otherwise, process the selection as usual
    setSubcatValue(value);
    const selectedSubcat = subcatitems.find(item => item.value == value);
    const newPerKg = selectedSubcat ? selectedSubcat.perkg : "";
    setPerKg(newPerKg); // Set new perKg value

    // Perform calculations based on the selected subcategory
    if (purchasetype == "KG") {
      handleInputChange("KG", kgrate);
    } else if (purchasetype == "Ton") {
      handleInputChange("Ton", tonrate);
    } else if (purchasetype == "Pcs") {
      handleInputChange("Pcs", pcsrate);
    }
  };



  const handleInputChange = (type, value) => {
    let kg = parseFloat(kgrate) || 0;
    let ton = parseFloat(tonrate) || 0;
    let pcs = parseInt(pcsrate) || 0;

    if (type == "KG") {
      kg = value ? parseFloat(value) : 0;
      ton = kg / 1000;
      pcs = perKg > 0 ? Math.floor(kg * perKg) : 0;
      setKgrate(value);
      setTonrate(ton.toFixed(2));
      setPcsrate(pcs.toString());
    } else if (type == "Ton") {
      ton = value ? parseFloat(value) : 0;
      kg = ton * 1000;
      pcs = perKg > 0 ? Math.floor(kg * perKg) : 0;
      setTonrate(value);
      setKgrate(kg.toFixed(2));
      setPcsrate(pcs.toString());
    } else if (type == "Pcs") {
      pcs = value ? parseInt(value) : 0;
      kg = perKg > 0 ? pcs / perKg : 0;
      ton = kg / 1000;
      setPcsrate(value);
      setKgrate(kg.toFixed(2));
      setTonrate(ton.toFixed(2));
    }
  };

  useEffect(() => {
    if (!updatemode) { // Run only when updateMode is false
      setKgrate("");
      setTonrate("");
      setPcsrate("");
      setPurchasetype(null);
    }
  }, [subcatvalue, updatemode]); // Triggers only when subcatvalue changes


  const listpurchase = async () => {
    const url = `${Constant.URL}${Constant.OtherURL.single_purchaselist}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        party_id: partyid ? partyid : customervalue,
        bill_no: bill_no ? bill_no : billno
      }),
    });
    const result = await response.json();

    if (result.code == "200") {
      setStocklist(result.payload);
      setpurchaseno(result.payload[0].purchase_no)
    } else {
      setStocklist([]);
      console.log('error while listing category');
    }
  };

  useEffect(() => {
    if (bill_no && partyid) {
      listpurchase();
    }
  }, [bill_no, partyid]);

  useFocusEffect(
    React.useCallback(() => {
      listcategory();
      listsubcategory();
      fetchusertype();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      partylist();
    }, [usertype])
  );

  useEffect(() => {
    if (catvalue) {
      listsubcat();
    }
  }, [catvalue, usertype]);

  useEffect(() => {
    if (subcategoryvalue) {
      listProducts();
    }
  }, [subcategoryvalue]);

  const formatDateToDatabase = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Format to yyyy-mm-dd
  };

  const [errors, setErrors] = useState({
    party: '',
    billno: '',
    item: '',
    type: '',
    kgrate: '',
    tonrate: '',
    pcsrate: '',
    purchasetype: '',
  });

  // const validateFields = () => {
  //     const newErrors = {
  //       party: customervalue ? '' : 'Party Name is required',
  //       billno: billno ? '' : 'Bill No. is required',
  //       item: address ? '' : 'Address is required',
  //       type: mobileno ? '' : 'Mobile Number is required',
  //       kgrate: value ? '' : 'Role is required',
  //       tonrate: password ? '' : 'Password is required',
  //       pcsrate:
  //       purchasetype:

  //     };

  //     setErrors(newErrors);

  //     // Return true if no errors
  //     return Object.values(newErrors).every((error) => error === '');
  // };

  const Addpurchase = async () => {
    setLoading(true);
    const formattedDate = formatDateToDatabase(date);
    const id = await AsyncStorage.getItem('admin_id');
    const selectedSubcat = subcatitems.find(item => item.value === subcatvalue);
    const preformType = selectedSubcat ? selectedSubcat.label : "";

    const selectedparty = customeritems.find(item => item.value === customervalue);
    const partyname = selectedparty ? selectedparty.label : "";

    const url = `${Constant.URL}${Constant.OtherURL.addpurchase}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        purchase_no: purchase_no ? purchase_no : '',
        user_id: id,
        subcategory_id: subcategoryvalue,
        product_id: productvalue,
        party_id: customervalue,
        party_name: partyname,
        preform_id: catvalue,
        preform_type: preformType,
        preform_type_id: subcatvalue,
        bill_no: billno,
        per_kg: perKg,
        kg_qty: (selectedCategory?.label == "SHIRINK" || selectedCategory?.label == "BOPP LABEL") ? `${kgrate || "0"}.${(gram || "0").toString().padStart(3, '0')}` : kgrate,
        ton_qty: tonrate,
        pcs_qty: pcsrate,
        purchase_date: formattedDate
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      listpurchase();
      setKgrate(null);
      setTonrate(null);
      setPcsrate(null);
      setGram(null);
      setSubcatValue(null);
    } else {
      setError('error while adding purchase');
    }
    setLoading(false);
  };

  const updatepurchase = async () => {
    setLoading(true);
    const selectedSubcat = subcatitems.find(item => item.value == subcatvalue);
    const preformType = selectedSubcat ? selectedSubcat.label : "";

    const selectedparty = customeritems.find(item => item.value == customervalue);
    const partyname = selectedparty ? selectedparty.label : "";

    const url = `${Constant.URL}${Constant.OtherURL.purchase_update}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        purchase_id: selectedpurchaseid,
        purchase_no: purchase_no ? purchase_no : '',
        subcategory_id: subcategoryvalue,
        product_id: productvalue,
        party_id: customervalue,
        party_name: partyname,
        preform_id: catvalue,
        preform_type: preformType,
        preform_type_id: subcatvalue,
        bill_no: billno,
        per_kg: perKg,
        kg_qty: (selectedCategory?.label == "SHIRINK" || selectedCategory?.label == "BOPP LABEL") ? `${kgrate || "0"}.${(gram || "0").toString().padStart(3, '0')}` : kgrate,
        ton_qty: tonrate,
        pcs_qty: pcsrate,
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      listpurchase();
      setKgrate(null);
      setTonrate(null);
      setPcsrate(null);
      setGram(null);
      setSubcatValue(null);
      setSelectedpurchaseid(null);
      setpurchaseno(null);
      setSubcategoryValue(null);
      setCatValue(null);
      setProductValue(null);
      setUpdateMode(false);
    } else {
      setError('error while adding purchase');
    }
    setLoading(false);
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete Order",
      `Are you sure you want to Cancel this Purchase?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => handleDelete()
        }
      ]
    );
  };

  const handleDelete = async () => {
    const url = `${Constant.URL}${Constant.OtherURL.purchase_delete}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        purchase_no: purchaseno,
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      navigation.goBack(null);
    } else {
      // Handle error if needed
    }
    // setMainloadin(false);
  };

  const openModal = (item, x, y) => {
    setModalPosition({ top: y - 15, left: x - 110 });
    setSelectedpurchaseid(item.purchase_id);
    setSelectedEntry(item);
    // setSelectedcorderid(item.corder_id ? item.corder_id : null);
    // setSelecteduserdata(item);
    setModalvisible(true);
  };

  const confirmsingleDelete = () => {
    Alert.alert(
      "Delete Order",
      `Are you sure you want to delete this Purchase Entry?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => {
            handlesingleDelete(selectedpurchaseid);
          }
        }
      ]
    );
  };

  const handlesingleDelete = async (id) => {
    const url = `${Constant.URL}${Constant.OtherURL.single_purchase_delete}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        purchase_id: id,
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      listpurchase();
    } else {
      // Handle error if needed
    }
    // setMainloadin(false);
  };

  const handleEdit = () => {
    if (selectedentry) {
      setCustomerValue(selectedentry.party_id);
      setBillno(selectedentry.bill_no);
      setSubcategoryValue(selectedentry.subcategory_id);
      setProductValue(selectedentry.product_id);
      setSubcatValue(selectedentry.preform_type_id);
      setCatValue(selectedentry.preform_id);

      // handle SHIRINK or BOPP LABEL case
      const name = selectedentry.preform_name?.toUpperCase();
      if (name == "SHIRINK" || name == "BOPP LABEL") {
        const [kgPart, gramPart] = selectedentry.kg_qty.split(".");
        setKgrate(kgPart || "0");
        setGram(gramPart || "0");
      } else {
        setKgrate(selectedentry.kg_qty);
        setGram(""); // or set to 0 if needed
      }

      // setKgrate(selectedentry.kg_qty);
      setTonrate(selectedentry.ton_qty);
      setPcsrate(selectedentry.pcs_qty);
      setPerKg(selectedentry.per_kg);
      setpurchaseno(selectedentry.purchase_no);
      setSelectedpurchaseid(selectedentry.purchase_id);

      const pcsQty = parseFloat(selectedentry.pcs_qty);
      const preformType = parseFloat(selectedentry.preform_type);

      if (!isNaN(pcsQty) && !isNaN(preformType) && preformType !== 0) {
        const boxrate = pcsQty / preformType;
        setBoxrate(boxrate.toString());
      } else {
        setBoxrate(''); // Handle invalid division case
      }
      setModalvisible(false);
      setUpdateMode(true);
    }
  };

  const selectedCategory = catitems.find(item => item.value == catvalue);
  const selectedSubcat = subcatitems.find(item => item.value == subcatvalue);

  useEffect(() => {
    if (!subcatvalue || !selectedCategory || !selectedSubcat) return; // Ensure all values exist before running

    if (selectedCategory?.label == "CAP" && boxrate) {
      setPcsrate((parseFloat(selectedSubcat.label) * parseFloat(boxrate)).toString());
    } else {
      setPcsrate(selectedentry?.pcs_qty?.toString()); // Ensure fallback is correct
    }
  }, [boxrate, subcatvalue, selectedCategory, selectedSubcat]); // Include selectedSubcat in dependencies

  const formatFixed3 = (num) => {
    const [intPart, decPart = ''] = num.toString().split('.');
    const truncatedDecimal = decPart.substring(0, 3); // Take first 3 digits only
    const paddedDecimal = truncatedDecimal.padEnd(3, '0'); // Pad zeroes if needed
    return decPart ? `${intPart}.${paddedDecimal}` : intPart;
  };

  const totalkg = stocklist.reduce((sum, item) => sum + parseFloat(item.kg_qty || 0), 0);
  const truncatedKg = Math.floor(totalkg * 1000) / 1000;
  const formattedKg = formatFixed3(truncatedKg);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ backgroundColor: '#173161', flexDirection: 'row', height: 50, justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
        <TouchableOpacity onPress={() => { navigation.goBack(); }}>
          <Image source={require('../../assets/arrow_back.png')} style={{ marginLeft: 10, height: 25, width: 25 }} />
        </TouchableOpacity>
        <View>
          <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: '#FFF', fontFamily: 'Inter-SemiBold', fontSize: 14, marginLeft: 0, textTransform: 'capitalize', }}>Purchase Entry</Text>
        </View>
        <TouchableOpacity onPress={showDatePicker} style={{ marginRight: 5, }}>
          <Text style={{ color: 'white', fontSize: 12, fontFamily: 'Inter-Regular', textAlign: 'right', paddingRight: 5 }}>
            {displayDate}
          </Text>
        </TouchableOpacity>
      </View>
      {show && (
        <DateTimePicker
          value={date}
          mode='date'
          is24Hour={false}
          display="default"
          onChange={onChange}
          maximumDate={new Date()}
        />
      )}

      <View style={{ flex: 1, }}>
        <ScrollView keyboardShouldPersistTaps='handled'>
          <View style={{ flex: 1, justifyContent: 'space-between', }}>
            <View style={{ marginTop: 10, zIndex: 4000, marginBottom: 10 }}>
              <DropDownPicker
                placeholder="Select Party"
                open={customeropen}
                value={customervalue}
                items={customeritems}
                setOpen={(isOpen) => {
                  setCustomerOpen(isOpen);
                  if (isOpen) {
                    Keyboard.dismiss();
                    setSubcatOpen(false);
                    setCatOpen(false);
                    setSubcategoryOpen(false);
                    setProductOpen(false);
                  }
                }}
                setValue={(customervalue) => {
                  if (customervalue == 'add_new') {
                    setCustomerValue(null); // Reset the selected value to null when "Add New" is selected
                  } else {
                    setCustomerValue(customervalue); // Set the selected category value
                  }
                }}
                onChangeValue={(customervalue) => {
                  if (customervalue == 'add_new') {
                    setCustomerOpen(false);
                    setNewCategoryModalVisible(true);
                    setCustomerValue(null);
                  } else {
                    setCustomerValue(customervalue);
                  }
                }}
                setItems={setCustomerItems}
                style={{
                  width: '95%',
                  height: 40,
                  borderRadius: 10,
                  borderColor: 'gray',
                  backgroundColor: '#F5F5F5',
                  alignSelf: 'center',
                }}
                textStyle={{
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  color: '#000',
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
                  backgroundColor: '#fff',
                  maxHeight: 600,
                }}
              />

            </View>

            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              {/* <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: '#000' }}>Bill No</Text> */}
              <TextInput
                placeholder="Enter Bill No"
                placeholderTextColor='gray'
                value={billno}
                onChangeText={setBillno}
                style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 10, padding: 10, marginBottom: 10, color: '#000', fontFamily: 'Inter-Regular' }}
              />
            </View>
            <View style={{ marginBottom: 20, zIndex: 3000 }}>
              <DropDownPicker
                placeholder='Select Subcategory'
                open={subcategoryopen}
                value={subcategoryvalue}
                items={subcategoryitems}
                setOpen={(isOpen) => {
                  setSubcategoryOpen(isOpen);
                  if (isOpen) {
                    Keyboard.dismiss();
                    setCustomerOpen(false);
                    setCatOpen(false);
                    setSubcatOpen(false);
                    setProductOpen(false);
                  }
                }}
                setValue={setSubcategoryValue}
                setItems={setSubcategoryItems}
                style={{
                  width: '95%',
                  height: 40,
                  borderRadius: 10,
                  borderColor: 'gray',
                  backgroundColor: '#F5F5F5',
                  alignSelf: 'center',
                }}
                textStyle={{
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  color: '#000',
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
                  backgroundColor: '#fff',
                  maxHeight: 600,
                }}
              />
            </View>
            <View style={{ marginBottom: 20, zIndex: 2000 }}>
              <DropDownPicker
                placeholder='Select Product'
                open={productopen}
                value={productvalue}
                items={productitems}
                setOpen={(isOpen) => {
                  setProductOpen(isOpen);
                  if (isOpen) {
                    Keyboard.dismiss();
                    setCustomerOpen(false);
                    setCatOpen(false);
                    setSubcategoryOpen(false);
                    setSubcatOpen(false);
                  }
                }}
                setValue={setProductValue}
                setItems={setProductItems}
                style={{
                  width: '95%',
                  height: 40,
                  borderRadius: 10,
                  borderColor: 'gray',
                  backgroundColor: '#F5F5F5',
                  alignSelf: 'center',
                }}
                textStyle={{
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  color: '#000',
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
                  backgroundColor: '#fff',
                  maxHeight: 600,
                }}
              />
            </View>
            <View style={{ marginTop: 0, zIndex: 1000 }}>
              <DropDownPicker
                open={catopen}
                value={catvalue}
                items={catitems}
                setOpen={(isOpen) => {
                  setCatOpen(isOpen);
                  if (isOpen) {
                    Keyboard.dismiss();
                    setCustomerOpen(false);
                    setSubcatOpen(false);
                    setSubcategoryOpen(false);
                    setProductOpen(false);
                  }
                }}
                setValue={setCatValue}
                setItems={setCatItems}
                style={{
                  width: '95%',
                  height: 40,
                  borderRadius: 10,
                  borderColor: 'gray',
                  backgroundColor: '#F5F5F5',
                  alignSelf: 'center',
                  opacity: 1,
                }}
                textStyle={{
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  color: '#000',
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
                  backgroundColor: '#fff',
                  maxHeight: 600,
                }}
              />

            </View>

            <View style={{ marginTop: 20, marginBottom: 20, zIndex: 550 }}>
              <DropDownPicker
                placeholder='Select Type'
                open={subcatopen}
                value={subcatvalue}
                items={subcatitems}
                setOpen={(isOpen) => {
                  setSubcatOpen(isOpen);
                  if (isOpen) {
                    Keyboard.dismiss();
                    setCustomerOpen(false);
                    setCatOpen(false);
                    setSubcategoryOpen(false);
                    setProductOpen(false);
                  }
                }}
                setValue={(callback) => {
                  const newValue = typeof callback == "function" ? callback(subcatvalue) : callback;
                  setSubcatValue(newValue);
                }}
                setItems={setSubcatItems}
                onChangeValue={(value) => {
                  handleSubcatChange(value);
                }}
                style={{
                  width: '95%',
                  height: 40,
                  borderRadius: 10,
                  borderColor: 'gray',
                  backgroundColor: !catvalue ? '#E0E0E0' : '#F5F5F5',
                  alignSelf: 'center',
                  opacity: !catvalue ? 0.4 : 1,
                }}
                textStyle={{
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  color: '#000',
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
                  backgroundColor: '#fff',
                  maxHeight: 600,
                }}
                disabled={!catvalue}
              />
            </View>

            {selectedCategory?.label == "PREFORM" &&
              <>
                <View style={{ marginTop: 0, flexDirection: "row", alignItems: "flex-start", marginVertical: 0, marginLeft: 10 }}>
                  {["KG", "Ton", "Pcs"].map((perm) => (
                    <View key={perm} style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
                      <View style={{ transform: [{ scale: 0.8 }] }}>
                        <RadioButton
                          value={perm}
                          status={purchasetype == perm ? "checked" : "unchecked"}
                          onPress={() => setPurchasetype(perm)}
                          color="#173161"
                        />
                      </View>
                      <Text style={{ fontSize: 14, fontFamily: "Roboto-Regular", color: "#000", marginLeft: 5 }}>
                        {perm}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={{ marginHorizontal: 10, flexDirection: 'row', gap: 5, }}>
                  <TextInput
                    value={kgrate}
                    onChangeText={(value) => handleInputChange("KG", value)}
                    keyboardType='numeric'
                    editable={purchasetype == "KG"}
                    style={{ width: '33%', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 10, color: '#000', fontFamily: 'Inter-Regular', backgroundColor: purchasetype === "KG" ? "#fff" : "#e0e0e0" }}
                  />
                  <TextInput
                    value={tonrate}
                    onChangeText={(value) => handleInputChange("Ton", value)}
                    keyboardType='numeric'
                    editable={purchasetype == "Ton"}
                    style={{ width: '33%', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 10, color: '#000', fontFamily: 'Inter-Regular', backgroundColor: purchasetype === "Ton" ? "#fff" : "#e0e0e0" }}
                  />
                  <TextInput
                    value={pcsrate}
                    onChangeText={(value) => handleInputChange("Pcs", value)}
                    keyboardType='numeric'
                    editable={purchasetype == "Pcs"}
                    style={{ width: '33%', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 10, color: '#000', fontFamily: 'Inter-Regular', backgroundColor: purchasetype === "Pcs" ? "#fff" : "#e0e0e0" }}
                  />
                </View>
              </>}
            {selectedCategory?.label == "CAP" &&
              <View style={{ marginHorizontal: 10, flexDirection: 'row', gap: 5, marginTop: 0 }}>
                <TextInput
                  placeholder='Box'
                  placeholderTextColor='gray'
                  value={boxrate}
                  onChangeText={setBoxrate}
                  keyboardType='numeric'
                  style={{ width: '49%', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 10, color: '#000', fontFamily: 'Inter-Regular', backgroundColor: "#fff" }}
                />
                <TextInput
                  placeholder='Pcs'
                  placeholderTextColor='gray'
                  value={pcsrate}
                  onChangeText={setPcsrate}
                  keyboardType='numeric'
                  editable={purchasetype == "Pcs"}
                  style={{ width: '49%', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 10, color: '#000', fontFamily: 'Inter-Regular', backgroundColor: purchasetype === "Pcs" ? "#fff" : "#e0e0e0" }}
                />
              </View>}

            {(selectedCategory?.label == "SHIRINK" || selectedCategory?.label == "BOPP LABEL") &&
              <View style={{ marginHorizontal: 10, flexDirection: 'row', gap: 5, marginTop: 0 }}>
                <TextInput
                  placeholder='KG'
                  placeholderTextColor='gray'
                  value={kgrate}
                  onChangeText={setKgrate}
                  keyboardType='numeric'
                  style={{ width: '49%', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 10, color: '#000', fontFamily: 'Inter-Regular', backgroundColor: "#fff" }}
                />
                <TextInput
                  placeholder='Gram'
                  placeholderTextColor='gray'
                  value={gram}
                  onChangeText={setGram}
                  keyboardType='numeric'
                  style={{ width: '49%', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 10, color: '#000', fontFamily: 'Inter-Regular', backgroundColor: "#fff" }}
                />
              </View>}

            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity onPress={selectedpurchaseid ? updatepurchase : Addpurchase} disabled={!customervalue || !catvalue || !subcatvalue || (selectedCategory?.label == "PREFORM" && !purchasetype) || !billno} style={{ marginTop: 6, backgroundColor: !customervalue || !catvalue || !subcatvalue || (selectedCategory?.label == "PREFORM" && !purchasetype) || !billno ? '#C5C6D0' : '#007bff', borderRadius: 8, padding: 9, justifyContent: 'center', alignItems: 'center', width: 200 }} >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={{ color: !customervalue || !catvalue || !subcatvalue || (selectedCategory?.label == "PREFORM" && !purchasetype) || !billno ? 'black' : '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>{updatemode ? 'Update' : 'Add'}</Text>
                )}
              </TouchableOpacity>
            </View>
            <View style={{ borderBottomWidth: 0.5, borderColor: 'gray', marginVertical: 4 }}></View>
            <View style={{ minHeight: 150 }}>
              <View style={{ width: '100%', flexDirection: 'row', backgroundColor: '#e4f1ff', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#ccc', }} >
                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', width: '5%' }}>
                  #
                </Text>
                <Text style={{ textTransform: 'uppercase', fontSize: 12, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'left', width: '20%', paddingLeft: 4 }}>
                  Product
                </Text>
                <Text style={{ textTransform: 'uppercase', fontSize: 12, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', width: '15%' }}>
                  Type
                </Text>
                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', width: '15%' }}>
                  KG
                </Text>
                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', width: '15%' }}>
                  TON
                </Text>
                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', width: '20%' }}>
                  PCS
                </Text>
                <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', width: '5%' }}></Text>
              </View>

              {stocklist.map((item, index) => (
                <View key={index} style={{ width: '100%', flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#ccc', }} >
                  <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '5%' }}>
                    {index + 1}
                  </Text>
                  <Text style={{ textTransform: 'uppercase', fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'left', width: '20%', paddingLeft: 4 }}>
                    {item.preform_name}
                  </Text>
                  <Text style={{ textTransform: 'uppercase', fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '15%' }}>
                    {item.preform_type}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '15%' }}>
                    {item.kg_qty}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '15%' }}>
                    {item.ton_qty}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular', textAlign: 'center', width: '20%' }}>
                    {item.pcs_qty}
                  </Text>

                  <TouchableOpacity onPress={(e) => {
                    const { pageX, pageY } = e.nativeEvent;
                    openModal(item, pageX, pageY);
                  }} style={{ paddingHorizontal: 10, paddingVertical: 0, }}>
                    <Image source={require('../../assets/threedot.png')} style={{ height: 15, width: 15 }} />
                  </TouchableOpacity>
                </View>
              ))}

              {stocklist.length > 0 && stocklist.some(item => ['SHIRINK', 'BOPP LABEL'].includes(item.preform_name?.toUpperCase())) &&
                <View style={{ width: '100%', flexDirection: 'row', backgroundColor: '#e4f1ff', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#ccc', }} >
                  <Text style={{ textTransform: 'uppercase', fontSize: 12, color: '#000', fontFamily: 'Inter-Medium', textAlign: 'center', width: '40%' }}>
                    Total
                  </Text>
                  <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Medium', textAlign: 'center', width: '15%' }}>{formattedKg}</Text>
                  <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Medium', textAlign: 'center', width: '15%' }}></Text>
                  <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Medium', textAlign: 'center', width: '20%' }}></Text>
                  <Text style={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Medium', textAlign: 'center', width: '5%' }}></Text>
                </View>}
            </View>
            <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 10 }}>
              <TouchableOpacity disabled={!stocklist || stocklist.length == 0} onPress={() => { confirmDelete(); }} style={{ backgroundColor: !stocklist || stocklist.length == 0 ? '#C5C6D0' : '#e60000', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, width: '40%', alignItems: 'center' }}>
                <Text style={{ color: !stocklist || stocklist.length == 0 ? '#000' : '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity disabled={!stocklist || stocklist.length == 0} onPress={() => navigation.goBack(null)} style={{ backgroundColor: !stocklist || stocklist.length === 0 ? '#C5C6D0' : '#007bff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, width: '40%', alignItems: 'center' }} >
                {/* {mainloading ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : ( */}
                <Text style={{ color: !stocklist || stocklist.length == 0 ? '#000' : '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>Save</Text>
                {/* )} */}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      <Modal visible={newCategoryModalVisible} transparent={true} animationType="slide">
        <TouchableOpacity onPress={() => { setNewCategoryModalVisible(false); setError(''); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: '#000' }}>Add New Party</Text>
              <TouchableOpacity onPress={() => { setNewCategoryModalVisible(false); setError(''); }} style={{ alignSelf: 'center' }}>
                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: '#000' }}>Party Name</Text>
            <TextInput
              placeholder="Enter Party Name"
              placeholderTextColor='gray'
              value={partyName}
              onChangeText={setpartyName}
              style={{ borderWidth: 1, borderColor: error ? 'red' : '#ccc', borderRadius: 5, padding: 10, marginBottom: 10, color: '#000', fontFamily: 'Inter-Regular' }}
            />
            {error ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginBottom: 10 }}>{error}</Text> : ''}

            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: '#000' }}>Mobile No.</Text>
            <TextInput
              placeholder="Enter Mobile No"
              placeholderTextColor='gray'
              keyboardType='numeric'
              value={mobile_no}
              onChangeText={setMobile_no}
              maxLength={10}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10, color: '#000', fontFamily: 'Inter-Regular' }}
            />

            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: '#000' }}>GST No</Text>
            <TextInput
              placeholder="Enter GST No"
              placeholderTextColor='gray'
              value={gstno}
              onChangeText={setGstno}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10, color: '#000', fontFamily: 'Inter-Regular' }}
            />
            {/* {error ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginBottom: 10 }}>{error}</Text> : ''} */}
            {loading ? (
              <ActivityIndicator size="large" color="#173161" />
            ) : (
              <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity onPress={() => { addnewparty(); }} style={{ width: 120, backgroundColor: '#173161', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                    Save
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { setNewCategoryModalVisible(false); }} style={{ width: 120, backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 20, alignItems: 'center', borderColor: '#173161', borderWidth: 1 }}>
                  <Text style={{ color: '#173161', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={typemodal} transparent={true} animationType="slide">
        <TouchableOpacity onPress={() => { setTypeModal(false); setError1(''); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: '#000' }}>{selectedpreform_id ? 'Update Type' : 'Add New Type'}</Text>
              <TouchableOpacity onPress={() => { setTypeModal(false); setError1(''); }} style={{ alignSelf: 'center' }}>
                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
              </TouchableOpacity>
            </View>

            <Text style={{ marginBottom: 10, fontSize: 12, fontFamily: 'Inter-Regular', color: '#000', paddingVertical: 13, borderRadius: 5, borderWidth: 1, borderColor: '#ccc', opacity: 0.5, paddingHorizontal: 10 }}>{selectedCategory?.label}</Text>

            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: '#000' }}>Type Name</Text>
            <TextInput
              placeholder="Enter Type Name"
              placeholderTextColor='gray'
              value={addtype?.toString()}
              onChangeText={setAddtype}
              style={{ borderWidth: 1, borderColor: error1 ? 'red' : '#ccc', borderRadius: 5, padding: 10, marginBottom: 10, color: '#000', fontFamily: 'Inter-Regular' }}
            />
            {error1 ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginBottom: 10 }}>{error1}</Text> : ''}

            {loading ? (
              <ActivityIndicator size="large" color="#173161" />
            ) : (
              <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity onPress={selectedpreform_id ? updatetype : addnewtype} style={{ width: 120, backgroundColor: '#173161', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                    Save
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { setTypeModal(false); setAddtype(null); setError1(null); }} style={{ width: 120, backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 20, alignItems: 'center', borderColor: '#173161', borderWidth: 1 }}>
                  <Text style={{ color: '#173161', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={modalvisible} transparent={true} animationType="slide">
        <TouchableOpacity onPress={() => { setModalvisible(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          {/* <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '50%', gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}> */}
          {/* <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>{selectedCategory.name}:</Text> */}
          <View
            onStartShouldSetResponder={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: modalPosition.top,
              left: modalPosition.left,
              gap: 10,
              backgroundColor: '#fff',
              paddingHorizontal: 20,
              paddingBottom: 20,
              paddingTop: 10,
              borderRadius: 10,
            }}
          >
            <TouchableOpacity onPress={handleEdit} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
              <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { confirmsingleDelete(); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
              <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

export default Addpurchaseentry