import { View, Text, ScrollView, Keyboard, TextInput, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyButton from '../Commoncomponent/MyButton';

const AddStockEntry = ({ navigation, route }) => {
    const { stockdata, entry_no } = route.params || {};

    const formatTime = (time) => {
        if (!time) return null;  // Return null if no time is provided

        const [hour, minute] = time.split(':');  // Assuming time is in "HH:mm" format

        let hours = parseInt(hour, 10);  // Convert to integer
        let minutes = minute;  // Minutes remain as string

        let period = 'AM';  // Default period is AM

        // Convert 24-hour format to 12-hour format
        if (hours >= 12) {
            period = 'PM';
            if (hours > 12) {
                hours -= 12;  // Convert hours greater than 12 to 12-hour format
            }
        } else if (hours === 0) {
            hours = 12;  // Handle midnight as 12:xx AM
        }

        // Format hours and minutes with leading zeros if needed
        const formattedHour = hours.toString().padStart(2, '0');
        const formattedTime = `${formattedHour}:${minutes} ${period}`;

        return formattedTime;
    };

    const [subcatopen, setSubcatOpen] = useState(false); // Controls dropdown visibility
    const [subcatvalue, setSubcatValue] = useState(stockdata?.subcategoryid || null); // Selected subcategory
    const [subcatitems, setSubcatItems] = useState([]);

    const [open, setOpen] = useState(false); // Controls dropdown visibility
    const [value, setValue] = useState(stockdata?.product_id || null); // Selected product
    const [items, setItems] = useState([]);

    const [openline, setOpenline] = useState(false); // Controls dropdown visibility
    const [valueline, setValueline] = useState(stockdata?.line_id || null); // Selected value
    const [itemsline, setItemsline] = useState([]);

    const [noofqty, setNoofqty] = useState(stockdata?.qty || null);
    const [machineqty, setMachineqty] = useState(stockdata?.machine_qty || null);
    const [difference, setDifference] = useState(stockdata?.difference_qty || null);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTime, setSelectedTime] = useState(formatTime(stockdata?.time_from) || null);

    const [isModaltoVisible, setIsModaltoVisible] = useState(false);
    const [selectedtoTime, setSelectedtoTime] = useState(formatTime(stockdata?.time_to) || null);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productPrice, setProductPrice] = useState(stockdata?.product_price || 0);
    const [productqtypcs, setProductqtypcs] = useState(stockdata?.no_qty_pcs || null);
    const [productmachineqtypcs, setProductmachineqtypcs] = useState(stockdata?.machine_qty_pcs || null);
    const [productqtydiff, setProductqtydiff] = useState(stockdata?.difference_qty_pcs || null);

    const [subjects, setSubjects] = useState([]);
    const [usertype, setUsertype] = useState(null);
    const [selectedTab, setSelectedTab] = useState(stockdata?.subject_id || null);

    const [remark, setRemark] = useState(stockdata?.remarks || null);
    const [expectedqty, setExpectedQty] = useState(null);
    const [lossPerCarton, setLossPerCarton] = useState(0);
    const [lossAmount, setLossAmount] = useState(0);
    const [losshour, setLossHour] = useState(null);

    const [addsubject, setAddsubject] = useState(null);
    const [error, setError] = useState(null);
    const [catmodal, setCatModal] = useState(false);

    const dateToDisplay = stockdata?.date || new Date().toISOString().split('T')[0]; // Default to current date in YYYY-MM-DD format

    // Format the date as dd/mm/yyyy
    const formattedDate = `${String(new Date(dateToDisplay).getDate()).padStart(2, '0')}/${String(new Date(dateToDisplay).getMonth() + 1).padStart(2, '0')}/${new Date(dateToDisplay).getFullYear()}`;
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
            setSubcatItems(subcatitem);
        } else {
            setSubcatItems([]);
            console.log('error while listing subcategory');
        }
    };

    const listlines = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.list_line}`;
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
            const lineitem = result.payload.map((item) => ({
                label: item.line_name,
                value: item.id,
                production: item.line_amount
            }));
            setItemsline(lineitem);
        } else {
            setItemsline([]);
            console.log('error while listing subcategory');
        }
    };

    const listsubjects = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.subject_list}`;
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
            setSubjects(result.payload);
        } else {
            setSubjects([]);
            console.log('error while listing subcategory');
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            listsubcategory();
            listsubjects();
            listlines();
            fetchusertype();
        }, [])
    );

    const listProducts = async () => {
        if (!subcatvalue) {
            // If no category is selected, set itemsinmodal to an empty array or handle accordingly
            setItems([]);
            return;
        }
        const url = `${Constant.URL}${Constant.OtherURL.subcategory_wise_product_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subcategory_id: subcatvalue,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            const productlist = result.payload.map((item) => ({
                label: item.product_name,
                value: item.product_id,
                pcs: item.product_qty,
                price: item.product_price,
            }));
            setItems(productlist);
            if (value) {
                const selectedProduct = productlist.find(item => item.value == value);
                if (selectedProduct) {
                    setSelectedProduct(selectedProduct);
                }
            }
        } else {
            setItems([]);
            console.log('error while listing products');
        }
    };
    useEffect(() => {
        if (selectedProduct) {
            setProductPrice(selectedProduct.price);
        }
    }, [selectedProduct]); // ✅ This ensures `productPrice` updates when `selectedProduct` changes

    useFocusEffect(
        React.useCallback(() => {
            listProducts();
        }, [subcatvalue])
    );

    const generateTimes = () => {
        const times = [];
        const periods = ['AM', 'PM'];

        // Loop through periods (AM and PM)
        periods.forEach((period, i) => {
            for (let hour = 1; hour <= 12; hour++) {
                const formattedHour = hour.toString().padStart(2, '0');

                // Skip times before 8:00 AM
                if (period === 'AM' && hour < 8) continue;

                // Include 12:00 PM correctly after 11:30 AM and 12:00 AM after 11:30 PM
                const nextPeriod = i === 0 && hour === 12 ? 'PM' : i === 1 && hour === 12 ? 'AM' : period;

                times.push(`${formattedHour}:00 ${nextPeriod}`);
                times.push(`${formattedHour}:30 ${nextPeriod}`);
            }
        });

        // Now we need to add times after 12:30 AM until 7:30 AM
        for (let hour = 1; hour <= 7; hour++) {
            const formattedHour = hour.toString().padStart(2, '0');
            times.push(`${formattedHour}:00 AM`);
            times.push(`${formattedHour}:30 AM`);
        }

        return times;
    };

    const timeOptions = generateTimes();

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
        setIsModalVisible(false);
    };

    const handletoTimeSelect = (time) => {
        setSelectedtoTime(time);
        setIsModaltoVisible(false);
    };

    const calculateTimeDifference = (startTime, endTime) => {
        // Helper function to parse time string to Date object
        const parseTime = (time) => {
            if (!time) {
                throw new Error('Invalid time format');
            }

            const [hour, minutePart] = time.split(':');
            if (!minutePart) {
                throw new Error('Invalid time format');
            }

            const [minute, period] = minutePart.split(' ');

            let hours = parseInt(hour, 10);
            let minutes = parseInt(minute, 10);

            // Convert 12 AM/PM times to 24-hour format
            if (period == 'AM' && hours == 12) {
                hours = 0; // 12 AM is 00:00 in 24-hour format
            } else if (period === 'PM' && hours !== 12) {
                hours += 12; // PM times, except for 12 PM, need 12 added
            }

            // Return the Date object representing that time
            const now = new Date();
            now.setHours(hours);
            now.setMinutes(minutes);
            now.setSeconds(0);
            now.setMilliseconds(0);

            return now;
        };

        // Check if both startTime and endTime are provided
        if (!startTime || !endTime) {
            return '';
        }

        // Parse start and end times
        const start = parseTime(startTime);
        const end = parseTime(endTime);

        // If end time is earlier than start time, adjust for next day (for PM to AM)
        if (end <= start) {
            end.setDate(end.getDate() + 1);
        }

        // Calculate the difference in milliseconds
        const diffInMs = end - start;

        // Convert milliseconds to hours and minutes
        const hours = Math.floor(diffInMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

        // Return the formatted time difference
        return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes > 0 ? minutes + ' min' + (minutes !== 1 ? '' : '') : ''}`;
    };

    const timeDifference = calculateTimeDifference(selectedTime, selectedtoTime);

    useEffect(() => {
        if (timeDifference && selectedProduct && valueline && itemsline.length > 0) {  // Check if product is selected and timeDifference is valid
            let totalHours = 0;
            const selectedLine = itemsline.find(item => item.value == valueline);
            const lineProductionRate = selectedLine?.production;
            // Regular expression to capture hours and minutes from timeDifference
            const hoursMatch = timeDifference.match(/(\d+)\s*hour/);
            const minutesMatch = timeDifference.match(/(\d+)\s*min/);

            if (hoursMatch) {
                totalHours += parseInt(hoursMatch[1], 10);  // Add hours
            }

            if (minutesMatch) {
                totalHours += parseInt(minutesMatch[1], 10) / 60;  // Convert minutes to hours and add
            }

            const rate = parseFloat(lineProductionRate);
            if (isNaN(rate)) return;

            const expected = rate * totalHours;
            setExpectedQty(expected);
        }
    }, [timeDifference, selectedProduct, valueline, itemsline]);


    useEffect(() => {
        if (machineqty && noofqty) {
            const difference = machineqty - noofqty;
            setDifference(difference); // assuming you have a state for difference
        }
    }, [machineqty, noofqty]);

    useEffect(() => {
        if (noofqty && selectedProduct) {  // Check if product is selected and quantity is provided
            const pcsQty = selectedProduct.pcs;  // Access the product's quantity (pcs)
            const difference = noofqty * pcsQty;  // Calculate the difference
            setProductqtypcs(difference);  // Save the calculated difference to state
        }
    }, [noofqty, selectedProduct]);

    useEffect(() => {
        if (machineqty && selectedProduct) {  // Check if product is selected and quantity is provided
            const pcsQty = selectedProduct.pcs;  // Access the product's quantity (pcs)
            const difference = machineqty * pcsQty;  // Calculate the difference
            setProductmachineqtypcs(difference);  // Save the calculated difference to state
        }
    }, [machineqty, selectedProduct]);

    useEffect(() => {
        if (difference && selectedProduct) {  // Check if product is selected and quantity is provided
            const pcsQty = selectedProduct.pcs;  // Access the product's quantity (pcs)
            const multiply = difference * pcsQty;  // Calculate the difference
            setProductqtydiff(multiply);  // Save the calculated difference to state
        }
    }, [difference, selectedProduct]);

    useEffect(() => {
        if (selectedProduct && expectedqty != undefined && productqtypcs != undefined && productPrice && valueline) {
            const lossBottal = expectedqty - productqtypcs;
            const selectedLine = itemsline.find(item => item.value == valueline);
            const lineProductionRate = selectedLine?.production;
            const lossCarton = lossBottal / selectedProduct.pcs;
            const calculatedLossAmount = lossCarton * productPrice;
            const totalLossHours = lossBottal / lineProductionRate; // Convert lost bottles to hours

            const hours = Math.floor(totalLossHours); // Get whole hours
            const minutes = Math.round((totalLossHours - hours) * 60); // Convert remainder to minutes

            const formattedLossHour = `${hours}h ${minutes}m`;
            setLossPerCarton(lossCarton);
            setLossAmount(calculatedLossAmount);
            setLossHour(formattedLossHour);
        }
    }, [expectedqty, productqtypcs, selectedProduct, productPrice, valueline, itemsline]);

    const AddSubject = async () => {
        if (!addsubject || addsubject.trim() == '') {
            setError('Subject name cannot be empty'); // Set error if validation fails
            return;
        }
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.add_subject}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subject_name: addsubject,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setCatModal(false);
            setAddsubject('');
            setError('');
            listsubjects();
        } else {
            setError('error while adding subject');
        }
        setLoading(false);
    };

    const [errors, setErrors] = useState({
        selectedTime: '',
        selectedtoTime: '',
        noofqty: '',
        machineqty: '',
        product: '',
        subcat: '',
        line: '',
    });

    const validateFields = () => {
        const newErrors = {
            selectedTime: selectedTime ? '' : 'startTime is required',
            selectedtoTime: selectedtoTime ? '' : 'endTime is required',
            noofqty: noofqty ? '' : 'Live/Carton is required',
            machineqty: machineqty ? '' : 'Shrink Machine quantity is required',
            subcat: subcatvalue ? '' : "subcategory is required",
            product: value ? '' : 'product is required',
            line: valueline ? '' : 'Line is required',
        };

        setErrors(newErrors);

        // Return true if no errors
        return Object.values(newErrors).every((error) => error === '');
    };

    const convertTo24HourFormat = (time) => {
        const [timePart, modifier] = time.split(' ');
        let [hours, minutes] = timePart.split(':');

        if (modifier == 'PM' && hours != '12') {
            hours = (parseInt(hours, 10) + 12).toString(); // Convert PM hours to 24-hour format
        } else if (modifier == 'AM' && hours == '12') {
            hours = '00'; // Handle midnight case
        }

        return `${hours}:${minutes}:00`; // Return in HH:mm:ss format
    };

    const AddStock = async () => {
        if (!validateFields()) return;
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const currentDate = new Date().toISOString().split('T')[0];
        const timeFrom24 = convertTo24HourFormat(selectedTime);
        const timeTo24 = convertTo24HourFormat(selectedtoTime);
        const loss_bottal = expectedqty - productqtypcs;
        const url = `${Constant.URL}${Constant.OtherURL.add_stock}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date: currentDate,
                time_from: timeFrom24,
                time_to: timeTo24,
                subcategoryid: subcatvalue,
                product_id: value,
                qty: noofqty,
                user_id: id,
                machine_qty: machineqty,
                difference_qty: difference,
                subject_id: selectedTab,
                remarks: remark,
                no_qty_pcs: productqtypcs,
                machine_qty_pcs: productmachineqtypcs,
                difference_qty_pcs: productqtydiff,
                expected_qty: expectedqty,
                product_price: productPrice,
                loss_bottal: loss_bottal,
                loss_carton: lossPerCarton,
                loss_amt: lossAmount,
                time_difference: timeDifference,
                line_id: valueline,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            navigation.replace('Stockentrylist');
        } else {
            console.log('error while adding stock');
        }
        setLoading(false);
    };

    const updateStock = async () => {
        if (!validateFields()) return;
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const currentDate = new Date().toISOString().split('T')[0];
        const timeFrom24 = convertTo24HourFormat(selectedTime);
        const timeTo24 = convertTo24HourFormat(selectedtoTime);
        const loss_bottal = expectedqty - productqtypcs;
        const url = `${Constant.URL}${Constant.OtherURL.update_stock}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                entry_id: stockdata?.id,
                date: currentDate,
                time_from: timeFrom24,
                time_to: timeTo24,
                subcategoryid: subcatvalue,
                product_id: value,
                qty: noofqty,
                user_id: id,
                machine_qty: machineqty,
                difference_qty: difference,
                subject_id: selectedTab,
                remarks: remark,
                no_qty_pcs: productqtypcs,
                machine_qty_pcs: productmachineqtypcs,
                difference_qty_pcs: productqtydiff,
                expected_qty: expectedqty,
                product_price: productPrice,
                loss_bottal: loss_bottal,
                loss_carton: lossPerCarton,
                loss_amt: lossAmount,
                time_difference: timeDifference,
                line_id: valueline,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            // navigation.replace('Stockentrylist');
            navigation.reset({
                index: 1,
                routes: [
                    { name: 'Dashboard' },  // Keep HomeScreen in the stack
                    { name: 'Stockentrylist' }    // Navigate to Userslist
                ],
            });
        } else {
            console.log('error while adding stock');
        }
        setLoading(false);
    };

    return (
        <View style={{ flex: 1 }}>
            <Subheader headername={stockdata?.id ? 'Update Stock Entry' : "Add Stock Entry"} />

            <View style={{ flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps='handled'>
                    <Text style={{ textAlign: 'right', color: '#173161', fontFamily: 'Inter-Bold', fontSize: 14, paddingRight: 5, paddingTop: 5 }}>Entry No:{stockdata ? stockdata.entry_no : entry_no + 1}</Text>
                    <View style={{ marginHorizontal: 15, marginVertical: 10, gap: 10 }}>
                        <View>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 6, }}>Date</Text>
                            <Text style={{ color: '#000', fontFamily: 'Inter-Regular', fontSize: 14, borderWidth: 1, borderColor: 'gray', borderRadius: 11, paddingHorizontal: 10, paddingVertical: 14 }}>{formattedDate}</Text>
                        </View>
                        <View>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 6, }}>Time</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <View style={{ marginBottom: 0, width: '45%' }}>
                                    <TouchableOpacity onPress={() => setIsModalVisible(true)} style={{ alignItems: 'center', borderColor: errors.selectedTime ? 'red' : 'gray', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 12, borderRadius: 8, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ fontFamily: 'Inter-Regular', paddingLeft: 5, color: '#000' }}>
                                            {/* {`${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} */}
                                            {selectedTime ? selectedTime : 'HH:MM AM/PM'}
                                        </Text>
                                        <Image source={require('../../assets/down-arrow.png')} style={{ height: 18, width: 18, tintColor: 'gray' }} />
                                    </TouchableOpacity>
                                    {errors.selectedTime && !selectedTime && (
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginLeft: 5 }}>
                                            {errors.selectedTime}
                                        </Text>
                                    )}
                                </View>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 14, marginLeft: 6, }}>To</Text>

                                <View style={{ marginBottom: 0, width: '45%' }}>
                                    <TouchableOpacity disabled={!selectedTime} onPress={() => setIsModaltoVisible(true)} style={{ opacity: !selectedTime ? 0.5 : 1, alignItems: 'center', borderColor: errors.selectedtoTime ? 'red' : 'gray', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 12, borderRadius: 8, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ fontFamily: 'Inter-Regular', paddingLeft: 5, color: '#000' }}>
                                            {/* {`${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} */}
                                            {selectedtoTime ? selectedtoTime : 'HH:MM AM/PM'}
                                        </Text>
                                        <Image source={require('../../assets/down-arrow.png')} style={{ height: 18, width: 18, tintColor: 'gray' }} />
                                    </TouchableOpacity>
                                    {errors.selectedtoTime && !selectedtoTime && (
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginLeft: 5 }}>
                                            {errors.selectedtoTime}
                                        </Text>
                                    )}
                                </View>
                            </View>
                            {timeDifference &&
                                <Text style={{ fontFamily: 'Inter-Regular', paddingLeft: 5, color: '#000', textAlign: 'right' }}>{timeDifference}</Text>
                            }
                        </View>
                    </View>

                    <View style={{ marginTop: 0, zIndex: 30000 }}>
                        <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 14, }}>Line</Text>
                        <DropDownPicker
                            placeholder="Select Line"
                            open={openline}
                            value={valueline}
                            items={itemsline}
                            setOpen={(isOpen) => {
                                setOpenline(isOpen);
                                if (isOpen) {
                                    Keyboard.dismiss();
                                    setOpen(false);
                                    setSubcatOpen(false)
                                }
                            }}
                            setValue={setValueline}
                            setItems={setItemsline}
                            style={{
                                width: '95%',
                                height: 40,
                                borderRadius: 10,
                                borderColor: errors.line ? 'red' : 'gray',
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
                    {errors.line ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 20, marginTop: 20 }}>{errors.line}</Text> : null}

                    <View style={{ marginTop: 20, zIndex: 20000 }}>
                        <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 14, }}>Subcategory</Text>
                        <DropDownPicker
                            placeholder="Select Sub-Category"
                            open={subcatopen}
                            value={subcatvalue}
                            items={subcatitems}
                            setOpen={(isOpen) => {
                                setSubcatOpen(isOpen);
                                if (isOpen) {
                                    Keyboard.dismiss();
                                    setOpen(false);
                                    setOpenline(false);
                                }
                            }}
                            setValue={setSubcatValue}
                            setItems={setSubcatItems}
                            style={{
                                width: '95%',
                                height: 40,
                                borderRadius: 10,
                                borderColor: errors.subcat ? 'red' : 'gray',
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
                    {errors.subcat ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 20, marginTop: 20 }}>{errors.subcat}</Text> : null}

                    <View style={{ marginTop: 20, zIndex: 20 }}>
                        <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 14, }}>Product</Text>
                        <DropDownPicker
                            placeholder="Select Product"
                            open={open}
                            value={value}
                            items={items}
                            setOpen={(isOpen) => {
                                setOpen(isOpen);
                                if (isOpen) {
                                    Keyboard.dismiss();
                                    setSubcatOpen(false);
                                    setOpenline(false);
                                }
                            }}
                            setValue={(productId) => {
                                setValue(productId);  // Update the selected product ID
                            }}
                            setItems={setItems}
                            onChangeValue={(productId) => {
                                const selectedProduct = items.find(item => item.value === productId);  // Find the selected product
                                if (selectedProduct) {
                                    setSelectedProduct(selectedProduct);  // Save the selected product
                                }
                            }}
                            style={{
                                width: '95%',
                                height: 40,
                                borderRadius: 10,
                                borderColor: errors.product ? 'red' : 'gray',
                                backgroundColor: !subcatvalue ? '#E0E0E0' : '#F5F5F5',
                                alignSelf: 'center',
                                opacity: !subcatvalue,
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
                            disabled={!subcatvalue}
                        />
                    </View>
                    {errors.product ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 20, marginTop: 20 }}>{errors.product}</Text> : null}
                    <View style={{ marginHorizontal: 15, marginVertical: 15, marginTop: 20, gap: 15 }}>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ width: '48%' }}>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 6, }}>Live/Carton</Text>
                                <TextInput keyboardType='numeric' value={noofqty} onChangeText={setNoofqty} onFocus={() => { setOpen(false); setSubcatOpen(false) }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, paddingVertical: 10, color: '#000', borderWidth: 1, borderColor: errors.noofqty ? 'red' : 'gray', borderRadius: 11 }} />
                                {errors.noofqty && (
                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginLeft: 5 }}>
                                        {errors.noofqty}
                                    </Text>
                                )}
                            </View>

                            <View style={{ width: '48%', opacity: 0.7 }}>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 6, }}>Bottal(Preform)</Text>
                                <Text style={{ opacity: 0.5, color: '#000', fontFamily: 'Inter-Regular', fontSize: 14, borderWidth: 1, borderColor: 'gray', borderRadius: 11, paddingHorizontal: 10, paddingVertical: 14 }}>{productqtypcs}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ width: '48%' }}>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 6, }}>Shrink Machine Carton</Text>
                                <TextInput keyboardType='numeric' value={machineqty} onChangeText={setMachineqty} onFocus={() => { setOpen(false); setSubcatOpen(false) }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, paddingVertical: 10, color: '#000', borderWidth: 1, borderColor: errors.machineqty ? 'red' : 'gray', borderRadius: 11 }} />
                                {errors.machineqty && (
                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginLeft: 5 }}>
                                        {errors.machineqty}
                                    </Text>
                                )}
                            </View>
                            <View style={{ width: '48%', opacity: 0.7, }}>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 6, }}>Loss/Carton/Shrink</Text>
                                <Text style={{ opacity: 0.5, color: '#000', fontFamily: 'Inter-Regular', fontSize: 14, borderWidth: 1, borderColor: 'gray', borderRadius: 11, paddingHorizontal: 10, paddingVertical: 14 }}>({difference}) 0g</Text>
                            </View>
                        </View>

                        {/* <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ width: '48%' }}>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 6, }}>Difference</Text>
                                <Text style={{ color: '#000', fontFamily: 'Inter-Regular', fontSize: 14, borderWidth: 1, borderColor: 'gray', borderRadius: 11, paddingHorizontal: 10, paddingVertical: 14 }}>{difference}</Text>
                            </View>
                            <View style={{ width: '48%', opacity: 0.7 }}>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 6, }}>PCS</Text>
                                <Text style={{ opacity: 0.5, color: '#000', fontFamily: 'Inter-Regular', fontSize: 14, borderWidth: 1, borderColor: 'gray', borderRadius: 11, paddingHorizontal: 10, paddingVertical: 14 }}>{productqtydiff}</Text>
                            </View>
                        </View> */}

                        <View>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 6, }}>Subject</Text>
                                {usertype == 'Admin' &&
                                    <TouchableOpacity onPress={() => setCatModal(true)}>
                                        <Image source={require('../../assets/addicon.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                    </TouchableOpacity>}
                            </View>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
                                {subjects.map((item, index) => (
                                    <TouchableOpacity key={index} style={{ marginRight: 10, marginBottom: 10, paddingVertical: 5, borderWidth: 0.5, borderColor: '#000', paddingHorizontal: 15, justifyContent: 'center', borderRadius: 20, backgroundColor: selectedTab === item.subject_id ? '#cde1fe' : '#fff', }} onPress={() => setSelectedTab(item.subject_id)} >
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#000', }} >
                                            {item.subject_name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {/* {errors.selectedTab && (
                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginLeft: 5 }}>
                                    {errors.selectedTab}
                                </Text>
                            )} */}
                        </View>

                        {selectedTab &&
                            <View>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 6, }}>Remark</Text>
                                <TextInput value={remark} onChangeText={setRemark} onFocus={() => { setOpen(false); setSubcatOpen(false) }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, paddingVertical: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                                {/* {errors.machineqty && (
                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginLeft: 5 }}>
                                        {errors.machineqty}
                                    </Text>
                                )} */}
                            </View>
                        }

                        <View>
                            <Text style={{ color: '#000', fontFamily: 'Inter-Bold', fontSize: 14, marginLeft: 6, }}>Summary</Text>
                            <View style={{ flexDirection: 'row', gap: 10, marginLeft: 5 }}>
                                <Text style={{ width: '50%', fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#000' }}>Blowing/Speedper hours</Text>
                                <Text style={{ width: '40%', fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#000' }}>Expected Bottal Qty</Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 10, marginLeft: 5 }}>
                                <Text style={{ width: '50%', fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{timeDifference}</Text>
                                <Text style={{ width: '40%', fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{expectedqty}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 10, marginLeft: 5, marginTop: 5 }}>
                                <Text style={{ width: '50%', fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#000' }}>Live Bottal</Text>
                                <Text style={{ width: '40%', fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#000' }}>Live/Carton</Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 10, marginLeft: 5, marginBottom: 5 }}>
                                <Text style={{ width: '50%', fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{productqtypcs}</Text>
                                <Text style={{ width: '40%', fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{noofqty}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 10, marginLeft: 5 }}>
                                <Text style={{ width: '25%', fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#000' }}>Loss/Bottal</Text>
                                <Text style={{ width: '25%', fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#000' }}>Loss/Carton</Text>
                                <Text style={{ width: '25%', fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#000' }}>Loss Amount</Text>
                                <Text style={{ width: '20%', fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#000' }}>Loss Hour</Text>

                            </View>
                            <View style={{ flexDirection: 'row', gap: 10, marginLeft: 5, marginBottom: 5 }}>
                                <Text style={{ width: '25%', fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{expectedqty - productqtypcs}</Text>
                                <Text style={{ width: '25%', fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{parseInt(lossPerCarton)}</Text>
                                <Text style={{ width: '25%', fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{parseFloat(lossAmount).toFixed(2)}</Text>
                                <Text style={{ width: '20%', fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{losshour}</Text>
                            </View>

                            <Text style={{ color: '#000', fontFamily: 'Inter-Bold', fontSize: 14, marginLeft: 6, }}>Material Use Summary</Text>
                            <View style={{ flexDirection: 'row', gap: 10, marginLeft: 5 }}>
                                <Text style={{ width: '25%', fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#000' }}>Preform</Text>
                                <Text style={{ width: '25%', fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#000' }}>Cap</Text>
                                <Text style={{ width: '25%', fontFamily: 'Inter-Medium', fontSize: 12, color: '#000' }}>Shrink</Text>
                                <Text style={{ width: '25%', fontFamily: 'Inter-Medium', fontSize: 12, color: '#000' }}>Label</Text>

                            </View>
                            <View style={{ flexDirection: 'row', gap: 10, marginLeft: 5 }}>
                                <Text style={{ width: '25%', fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{productqtypcs}</Text>
                                <Text style={{ width: '25%', fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{productqtypcs}</Text>
                                <Text style={{ width: '25%', fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>0g</Text>
                                <Text style={{ width: '25%', fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>0g</Text>

                            </View>
                        </View>
                    </View>

                    {loading ?
                        <ActivityIndicator size="large" color="#173161" />
                        : <View style={{ marginHorizontal: 10, justifyContent: 'flex-end', marginBottom: 10 }}>
                            <MyButton btnname="Save" background="#173161" fontsize={18} textcolor="#FFF" runFunc={stockdata?.id ? updateStock : AddStock} />
                        </View>
                    }
                </ScrollView>
            </View>

            {/* Time options Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableOpacity onPress={() => setIsModalVisible(false)} style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', }}>
                    <View style={{ width: '100%', height: '60%', backgroundColor: '#fff', borderRadius: 10, padding: 20, }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 18, color: '#000' }}>Select Time</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={{ marginTop: 5 }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {timeOptions.map((time, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        padding: 15,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#eee',
                                    }}
                                    onPress={() => handleTimeSelect(time)}
                                >
                                    <Text style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular' }}>{time}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Time options Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModaltoVisible}
                onRequestClose={() => setIsModaltoVisible(false)}
            >
                <TouchableOpacity onPress={() => setIsModaltoVisible(false)} style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', }}>
                    <View style={{ width: '100%', height: '60%', backgroundColor: '#fff', borderRadius: 10, padding: 20, }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 18, color: '#000' }}>Select Time</Text>
                            <TouchableOpacity onPress={() => setIsModaltoVisible(false)} style={{ marginTop: 5 }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {timeOptions.map((time, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        padding: 15,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#eee',
                                    }}
                                    onPress={() => handletoTimeSelect(time)}
                                >
                                    <Text style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular' }}>{time}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={catmodal} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setCatModal(false); setAddsubject(''); setError(''); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: '#000' }}>Subject
                                <Text style={{ color: '#e60000' }}>*</Text>
                            </Text>
                            <TouchableOpacity onPress={() => { setCatModal(false); setAddsubject(''); setError(''); }} style={{ alignSelf: 'center' }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            placeholder="Enter Subject"
                            placeholderTextColor='gray'
                            value={addsubject}
                            onChangeText={setAddsubject}
                            style={{ borderWidth: 1, borderColor: error ? 'red' : '#ccc', borderRadius: 5, padding: 10, marginBottom: error ? 5 : 20, color: '#000', fontFamily: 'Inter-Regular' }}
                        />
                        {error ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginBottom: 10 }}>{error}</Text> : ''}
                        {loading ? (
                            <ActivityIndicator size="large" color="#173161" />
                        ) : (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity onPress={() => { AddSubject(); }} style={{ width: 120, backgroundColor: '#173161', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
                                    <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                        Save
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => { setCatModal(false); setAddsubject(''); setError(''); }} style={{ width: 120, backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 20, alignItems: 'center', borderColor: '#173161', borderWidth: 1 }}>
                                    <Text style={{ color: '#173161', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default AddStockEntry