import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, Image } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';
import MyButton from '../Commoncomponent/MyButton';

const Schemeslist = ({ navigation }) => {
  const [mainloading, setMainloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schemelist, setSchemelist] = useState([]);
  const [permissionlist, setPermissionsList] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [modalvisible, setModalvisible] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  const [selectedschemename, setSelectedschemename] = useState(null);
  const [schemeno, setschemeno] = useState(null);
  const [schemedata, setSchemeData] = useState([]);

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

  const listscheme = async () => {
    setLoading(true);
    const url = `${Constant.URL}${Constant.OtherURL.listscheme}`;
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
      setSchemelist(result.payload);
    } else {
      setSchemelist([]);
      console.log('error while listing product');
    }
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      listPermissions();
      listscheme();
    }, [])
  );
  const hasPermissions = permissions['Schemes'] || {};

  const openModal = (item, x, y) => {
    setModalPosition({ top: y - 15, left: x - 110 });
    setSelectedschemename(item.scheme_name);
    setSchemeData(item);
    setschemeno(item.scheme_no);
    setModalvisible(true);
  };

  const closeModal = () => {
    setModalvisible(false);
  };

  const handleDelete = async (id) => {
    const url = `${Constant.URL}${Constant.OtherURL.scheme_delete}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scheme_no: id,
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      closeModal();
      listscheme();
    } else {
      // Handle error if needed
    }
    setMainloading(false);
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete Scheme",
      `Are you sure you want to delete ${selectedschemename} scheme?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => handleDelete(schemeno)
        }
      ]
    );
  };

  const handleEdit = () => {
    if (schemeno && schemedata) {
      navigation.navigate('AddScheme', { scheme_no: schemeno, schemedata: schemedata, from: 'Edit' });
      setModalvisible(false);
    }
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
      <Subheader headername="Scheme List" />
      <View style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps='handled'>
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#173161" />
            </View>
          ) : (schemelist && schemelist.length > 0 && (
            schemelist.map((scheme, index) => {
              const schemeType = scheme.scheme_type;
              return (
                <View key={index} style={{ borderWidth: 1, borderColor: '#ccc', padding: 5, margin: 3, borderRadius: 5, backgroundColor: '#fff' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                      <View style={{ flexDirection: 'row', marginHorizontal: 5, }}>
                        <Text style={{ fontFamily: 'Inter-Bold', color: '#000', fontSize: 12 }}>Scheme Name: </Text>
                        <Text style={styles.value}>{scheme.scheme_name}</Text>
                      </View>

                      <View style={{ flexDirection: 'row', marginHorizontal: 5 }}>
                        <Text style={{ fontFamily: 'Inter-Bold', color: '#000', fontSize: 12 }}>Scheme Type: </Text>
                        <Text style={styles.value}>{scheme.scheme_type}</Text>
                      </View>

                      <View style={{ flexDirection: 'row', marginHorizontal: 5, }}>
                        <Text style={{ fontFamily: 'Inter-Bold', color: '#000', fontSize: 12 }}>Scheme Duration: </Text>
                        <Text style={styles.value}> {scheme.start_date
                          ? new Date(scheme.start_date).toLocaleDateString("en-GB")
                          : ""}-{scheme.end_date
                            ? new Date(scheme.end_date).toLocaleDateString("en-GB")
                            : ""}</Text>
                      </View>

                      <View style={{ flexDirection: 'row', marginHorizontal: 5 }}>
                        <Text style={{ fontFamily: 'Inter-Bold', color: '#000', fontSize: 12 }}>Scheme Status: </Text>
                        <Text style={styles.value}>{scheme.scheme_status}</Text>
                      </View>
                    </View>

                    {(hasPermissions.Update || hasPermissions.Delete) && (
                      <TouchableOpacity onPress={(e) => {
                        const { pageX, pageY } = e.nativeEvent;
                        openModal(scheme, pageX, pageY);
                      }}>
                        <Image source={require('../../assets/threedot.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={{ borderBottomWidth: 0.5, borderColor: '#173161', marginTop: 10 }}></View>
                  {scheme.data.map((item, productindex) => (
                    <View key={productindex} style={styles.container}>
                      <View style={styles.row}>
                        <Text style={styles.label}>Product Name: </Text>
                        <Text style={styles.value}>{item.product_name}</Text>
                      </View>

                      <View style={styles.row}>
                        <Text style={styles.label}>Qty: </Text>
                        <Text style={styles.value}>{item.min_qty}</Text>
                      </View>

                      <View style={styles.row}>
                        <Text style={styles.label}>{schemeType == 'Free' ? 'Free' : schemeType == 'Discount' ? 'Discount' : 'Discounted Same'} Product: </Text>
                        <Text style={styles.value}>{item.free_product_name}</Text>
                      </View>

                      {schemeType == 'Free' &&
                        <View style={styles.row}>
                          <Text style={styles.label}>Free Qty: </Text>
                          <Text style={styles.value}>{item.free_qty}</Text>
                        </View>}

                      {(schemeType == 'Discount' || schemeType == 'Discounted Same Product') &&
                        <View style={styles.row}>
                          <Text style={styles.label}>Discount Price: </Text>
                          <Text style={styles.value}>{item.discount_price}</Text>
                        </View>}
                    </View>
                  ))}
                </View>
              )
            })))}
        </ScrollView>
      </View>
      {hasPermissions.Add && (
        <View style={{ margin: 10 }}>
          <MyButton btnname="Add Scheme" background="#173161" fontsize={18} textcolor="#FFF" runFunc={() => navigation.navigate('AddScheme')} />
        </View>
      )}

      <Modal visible={modalvisible} transparent={true} animationType="slide">
        <TouchableOpacity onPress={() => { setModalvisible(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ position: 'absolute', top: modalPosition.top, left: modalPosition.left, gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10, }} >
            {hasPermissions.Update && (
              <TouchableOpacity onPress={handleEdit} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
              </TouchableOpacity>
            )}
            {hasPermissions.Delete && (
              <TouchableOpacity onPress={() => { confirmDelete(); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

export default Schemeslist
const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    marginHorizontal: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 5,
    borderBottomWidth: 0.5,
    borderColor: '#173161'
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
    width: '60%',
  },
});