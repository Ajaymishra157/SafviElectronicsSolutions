import { View, Text, ScrollView, Keyboard, ActivityIndicator, TextInput, TouchableWithoutFeedback, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import DropDownPicker from 'react-native-dropdown-picker'
import MyButton from '../Commoncomponent/MyButton'
import Constant from '../Commoncomponent/Constant'
import { Checkbox } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native'

const AddUser = ({ navigation, route }) => {
    const { userdata } = route.params || {};
    console.log("userData ye hai", userdata);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(userdata?.user_type || null);
    const [items, setItems] = useState([
        { label: 'Admin', value: 'Admin' },
        { label: 'Service Engineer', value: 'Service Engineer' },
        { label: 'Acountant', value: 'Acountant' },
        { label: 'Technician', value: 'Technician' },
        { label: 'Helper', value: 'Helper' },
        { label: 'Half Technician', value: 'Half Technician' },
        { label: 'Febricator', value: 'Febricator' },
        { label: 'Office staff', value: 'Office staff' },
        { label: 'Management', value: 'Management' },



    ]);

    const [fname, setFname] = useState(userdata?.first_name || null);
    const [lname, setLname] = useState(userdata?.last_name || null);
    const [address, setAddress] = useState(userdata?.address || null);
    const [mobileno, setMobileno] = useState(userdata?.whatsapp_number || null);
    const [creditamt, setCreaditamt] = useState(userdata?.credit_amount || null);
    const [password, setPassword] = useState(userdata?.password || null);
    const [isEnabled, setIsEnabled] = useState(userdata?.status == 'deactive' ? false : true)
    const [showpassword, setShowPassword] = useState(false);

    const [stateOpen, setStateOpen] = useState(false); // Controls dropdown visibility
    const [stateValue, setStateValue] = useState(userdata?.state_id || null); // Selected state
    const [stateItems, setStateItems] = useState([]);

    const [cityOpen, setCityOpen] = useState(false); // Controls dropdown visibility
    const [cityValue, setCityValue] = useState(userdata?.city_id || null); // Selected city
    console.log("city value ye hai yar abhi to", cityValue);
    const [cityItems, setCityItems] = useState([]);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({
        fname: '',
        lname: '',
        address: '',
        mobileno: '',
        role: '',
        password: '',
        state: '',
        city: '',
    });

    const validateFields = () => {
        const newErrors = {
            fname: fname ? '' : 'First Name is required',
            lname: lname ? '' : 'Last Name is required',
            address: address ? '' : 'Address is required',
            mobileno: mobileno ? '' : 'Mobile Number is required',
            role: value ? '' : 'Role is required',
            password: password ? '' : 'Password is required',
            state: stateValue ? '' : 'State is required',
            city: cityValue ? '' : 'City is required',
        };

        setErrors(newErrors);

        // Return true if no errors
        return Object.values(newErrors).every((error) => error === '');
    };

    // Clear specific error when user starts typing
    const clearError = (fieldName) => {
        setErrors(prev => ({
            ...prev,
            [fieldName]: ''
        }));
    };

    const AddUsers = async () => {
        console.log("city value ye hai add user ke andar", cityValue);
        if (!validateFields()) return;
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.add_users}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_name: fname,
                whatsapp_number: mobileno,
                password: password,
                user_type: value,
                last_name: lname,
                address: address,
                credit_amount: creditamt,
                status: isEnabled ? 'active' : 'deactive',
                state: stateValue,   // ✅ STATE ID
                city: cityValue
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            // navigation.replace('AddPermission', { user_id: result.payload.admin_id });
            navigation.goBack();
        } else {
            setError('error while adding category');
        }
        setLoading(false);
    };

    const updateUser = async () => {
        if (!validateFields()) return;
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.update_user}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userdata?.userid,
                user_name: fname,
                whatsapp_number: mobileno,
                password: password,
                user_type: value,
                last_name: lname,
                address: address,
                credit_amount: creditamt,
                status: isEnabled ? 'active' : 'deactive',
                state: stateValue,   // ✅ STATE ID
                city: cityValue
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            // navigation.reset({
            //     index: 1,
            //     routes: [
            //         { name: 'Dashboard' },  // Keep HomeScreen in the stack
            //         { name: 'Userslist' }    // Navigate to Userslist
            //     ],
            // });
            navigation.goBack(null);

        } else {
            setError('error while adding category');
        }
        setLoading(false);
    };

    // Close dropdown when tapping outside
    const handleOutsidePress = () => {
        if (open) {
            setOpen(false);
        }
        Keyboard.dismiss();
    };

    const fetchstate = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.list_state}`;
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
                label: item.state_name,
                value: item.id,
            }));
            setStateItems(formattedItems);
        } else {
            console.log('error while listing category');
        }
    };
    useFocusEffect(
        React.useCallback(() => {
            fetchstate();

        }, [])
    );

    const fetchcities = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.list_city}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state_id: stateValue }),
        });
        const result = await response.json();
        if (result.code == "200") {
            const citylist = result.payload.map((item) => ({
                label: item.city_name,
                value: item.id,
            }));
            setCityItems(citylist);

            // ✅ Set cityValue based on userdata only if editing
            if (userdata?.city_id) {
                const matchedCity = citylist.find(c => c.value == userdata.city_id);
                if (matchedCity) setCityValue(matchedCity.value);
            }
        } else {
            setCityItems([]);
            console.log('error while listing cities');
        }
    };


    useFocusEffect(
        React.useCallback(() => {
            if (stateValue) {

                fetchcities();
            }
        }, [stateValue])
    );





    const handleValueChange = (selectedValue) => {
        setValue(selectedValue);
        clearError('role');
    };
    return (
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
            <View style={{ flex: 1 }}>
                <Subheader headername={userdata?.userid ? 'Update Staff' : 'Add Staff'} />
                <View style={{ flex: 1 }}>
                    <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={{ flexGrow: 1 }}>
                        <View style={{ marginHorizontal: 15, marginVertical: 15, gap: 15 }}>

                            <View>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>First Name
                                    <Text style={{ color: '#e60000' }}>*</Text>
                                </Text>
                                <TextInput onFocus={() => {
                                    setOpen(false);

                                }} value={fname} onChangeText={(text) => {
                                    setFname(text);
                                    clearError('fname');
                                }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, paddingVertical: 10, color: '#000', borderWidth: 1, borderColor: errors.fname ? 'red' : 'gray', borderRadius: 11 }} />
                                {errors.fname ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.fname}</Text> : null}
                            </View>


                            <View>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Last Name
                                    <Text style={{ color: '#e60000' }}>*</Text>
                                </Text>
                                <TextInput onFocus={() => {
                                    setOpen(false);


                                }} value={lname} onChangeText={(text) => {
                                    setLname(text);
                                    clearError('lname');
                                }} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, paddingVertical: 10, color: '#000', borderWidth: 1, borderColor: errors.lname ? 'red' : 'gray', borderRadius: 11 }} />
                                {errors.lname ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.lname}</Text> : null}
                            </View>


                            <View>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Address
                                    <Text style={{ color: '#e60000' }}>*</Text>
                                </Text>
                                <TextInput onFocus={() => {
                                    setOpen(false);

                                }} value={address} onChangeText={(text) => {
                                    setAddress(text);
                                    clearError('address');
                                }} multiline={true} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: errors.address ? 'red' : 'gray', borderRadius: 11 }} />
                                {errors.address ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.address}</Text> : null}
                            </View>


                            <View>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Mobile Number
                                    <Text style={{ color: '#e60000' }}>*</Text>
                                </Text>
                                <TextInput onFocus={() => {
                                    setOpen(false);

                                }} value={mobileno} onChangeText={(text) => {
                                    setMobileno(text);
                                    clearError('mobileno');
                                }} maxLength={10} keyboardType='numeric' style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, paddingVertical: 10, color: '#000', borderWidth: 1, borderColor: errors.mobileno ? 'red' : 'gray', borderRadius: 11 }} />
                                {errors.mobileno ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.mobileno}</Text> : null}
                            </View>


                            <View>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>
                                    Password
                                    <Text style={{ color: '#e60000' }}>*</Text>
                                </Text>
                                <View style={{ position: 'relative', justifyContent: 'center' }}>
                                    <TextInput
                                        onFocus={() => setOpen(false)}
                                        value={password}
                                        onChangeText={(text) => {
                                            setPassword(text);
                                            clearError('password');
                                        }}
                                        secureTextEntry={!showpassword} // 🔹 Toggle password visibility
                                        maxLength={10}
                                        style={{
                                            fontFamily: 'Inter-Medium',
                                            fontSize: 14,
                                            paddingHorizontal: 10,
                                            paddingVertical: 10,
                                            color: '#000',
                                            borderWidth: 1,
                                            borderColor: errors.password ? 'red' : 'gray',
                                            borderRadius: 11,
                                            paddingRight: 40, // 🔹 Right padding for eye icon
                                        }}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showpassword)}
                                        style={{
                                            position: 'absolute',
                                            right: 10,
                                            height: '100%',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {!showpassword ? (
                                            <Image source={require('../../assets/eyeclose.png')} style={{ height: 20, width: 20 }} />
                                        ) : (
                                            <Image source={require('../../assets/eyeopen.png')} style={{ height: 20, width: 20 }} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                                {errors.password ? (
                                    <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.password}</Text>
                                ) : null}
                            </View>


                        </View>


                        <View style={{ marginBottom: 15, marginTop: 0 }}>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 18, }}>State <Text style={{ color: '#e60000' }}>*</Text></Text>
                            <DropDownPicker
                                placeholder="Select State"
                                listMode='MODAL'
                                open={stateOpen}
                                value={stateValue}
                                items={stateItems}
                                setOpen={(isOpen) => {
                                    setStateOpen(isOpen);
                                    if (isOpen) {
                                        Keyboard.dismiss();
                                        setOpen(false);
                                        setCityOpen(false);
                                        setGenderOpen(false);
                                    }
                                }}
                                setValue={(val) => {
                                    setStateValue(val);
                                    clearError('state');
                                }}

                                setItems={setStateItems}
                                searchable={true}
                                searchablePlaceholder="Search State..." // Placeholder for search bar
                                searchContainerStyle={{
                                    borderBottomColor: '#dfdfdf',
                                    borderBottomWidth: 1,
                                }}
                                searchTextInputStyle={{
                                    fontFamily: 'Inter-Regular',
                                    fontSize: 14,
                                    color: '#000',
                                }}
                                style={{
                                    width: '92%',
                                    height: 40,
                                    borderRadius: 10,
                                    borderColor: errors.state ? 'red' : 'gray',
                                    backgroundColor: '#F5F5F5',
                                    alignSelf: 'center'
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
                                    maxHeight: 600
                                }}
                            />


                        </View>
                        {errors.state ? (
                            <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 18 }}>
                                {errors.state}
                            </Text>
                        ) : null}

                        <View style={{ marginBottom: 10, marginTop: 10 }}>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 18, }}>City <Text style={{ color: '#e60000' }}>*</Text></Text>
                            <DropDownPicker
                                placeholder="Select City"
                                listMode='MODAL'
                                open={cityOpen}
                                value={cityValue}
                                items={cityItems}
                                setOpen={(isOpen) => {
                                    setCityOpen(isOpen);
                                    if (isOpen) {
                                        Keyboard.dismiss();
                                        setStateOpen(false);
                                        setOpen(false);

                                    }
                                }}
                                setValue={(val) => {
                                    setCityValue(val);
                                    clearError('city');
                                }}
                                setItems={setCityItems}
                                searchable={true} // Enable searching functionality
                                searchablePlaceholder="Search City..." // Placeholder for search bar
                                searchContainerStyle={{
                                    borderBottomColor: '#dfdfdf',
                                    borderBottomWidth: 1,
                                }}
                                searchTextInputStyle={{
                                    fontFamily: 'Inter-Regular',
                                    fontSize: 14,
                                    color: '#000',
                                }}
                                style={{
                                    width: '92%',
                                    height: 40,
                                    borderRadius: 10,
                                    borderColor: errors.city ? 'red' : 'gray',
                                    backgroundColor: '#F5F5F5',
                                    alignSelf: 'center'
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
                                    maxHeight: 600
                                }}
                                disabled={!stateValue}
                            />
                        </View>
                        {errors.city ? (
                            <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 18 }}>
                                {errors.city}
                            </Text>
                        ) : null}

                        <View style={{ marginHorizontal: 15, marginBottom: 10, marginTop: 10 }}>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 5 }}>
                                Role <Text style={{ color: '#e60000' }}>*</Text>
                            </Text>

                            <DropDownPicker
                                placeholder="Select Role"
                                listMode="MODAL"
                                open={open}
                                value={value}
                                items={items}

                                setOpen={(isOpen) => {
                                    setOpen(isOpen);
                                    if (isOpen) {
                                        Keyboard.dismiss();
                                        setStateOpen(false);
                                        setCityOpen(false);
                                        setGenderOpen(false);
                                    }
                                }}

                                setValue={handleValueChange}
                                setItems={setItems}

                                searchable={true}
                                searchablePlaceholder="Search Role..."
                                searchContainerStyle={{
                                    borderBottomColor: '#dfdfdf',
                                    borderBottomWidth: 1,
                                }}
                                searchTextInputStyle={{
                                    fontFamily: 'Inter-Regular',
                                    fontSize: 14,
                                    color: '#000',
                                }}

                                style={{
                                    width: '100%',
                                    height: 40,
                                    borderRadius: 10,
                                    borderColor: errors.role ? 'red' : 'gray',
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

                                renderListItem={({ item, index, isSelected }) => (
                                    <View key={index}>
                                        <TouchableOpacity
                                            style={{
                                                paddingVertical: 12,
                                                paddingHorizontal: 15,
                                                backgroundColor: isSelected ? '#e6f0ff' : '#fff',
                                            }}
                                            onPress={() => {
                                                handleValueChange(item.value);
                                                setOpen(false);
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: '#000',
                                                    fontFamily: 'Inter-Medium',
                                                    fontSize: 14,
                                                }}
                                            >
                                                {item.label}
                                            </Text>
                                        </TouchableOpacity>

                                        {index < items.length - 1 && (
                                            <View
                                                style={{
                                                    height: 1,
                                                    backgroundColor: '#E0E0E0',
                                                    marginHorizontal: 10,
                                                }}
                                            />
                                        )}
                                    </View>
                                )}
                            />
                        </View>

                        {errors.role ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 18 }}>{errors.role}</Text> : null}

                        <View style={{ marginHorizontal: 15, marginVertical: 15, gap: 15 }}>
                            {/* <View>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 3, }}>Credit Amount</Text>
                                <TextInput keyboardType='numeric' onFocus={() => { setOpen(false); }} value={creditamt} onChangeText={setCreaditamt} style={{ fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, paddingVertical: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />
                            </View> */}

                            {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 0 }}>
                                <Checkbox
                                    status={isEnabled ? 'checked' : 'unchecked'}
                                    onPress={() => setIsEnabled(!isEnabled)}
                                    color="#173161"
                                />
                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#000' }}>Is Enable</Text>
                            </View> */}

                            {/* {userdata?.userid &&
                            <View style={{ marginHorizontal: 5 }}>
                                <MyButton btnname="Update Permissions" background="#173161" fontsize={18} textcolor="#FFF" runFunc={() => navigation.replace('AddPermission', { user_id: userdata?.userid, from: 'update' })} />
                            </View>
                        } */}

                            {loading ?
                                <ActivityIndicator size="large" color="#173161" />
                                : <View style={{ marginHorizontal: 5, justifyContent: 'flex-end' }}>
                                    <MyButton
                                        //  btnname={userdata?.userid ? "Save" : "Next"}
                                        btnname='Save'
                                        background="#173161" fontsize={18} textcolor="#FFF" runFunc={userdata?.userid ? updateUser : AddUsers} />
                                </View>
                            }
                        </View>
                    </ScrollView>
                </View>
            </View >
        </TouchableWithoutFeedback >
        // </Pressable>
        // </KeyboardAvoidingView> 
    )
}

export default AddUser