import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    TextInput,
    ActivityIndicator,
    StatusBar,
    ScrollView,
    Image,
    Modal
} from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Constant from '../Commoncomponent/Constant'



const OrderListService = ({ navigation, route }) => {
    const { customerid, selectedOrderNo, customerName, staffName, ProductId } = route.params || {}
    console.log("product id ye hai bhai", ProductId);


    const [orderList, setOrderList] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(selectedOrderNo || null);
    const [products, setProducts] = useState([]);

    const [showProductsModal, setShowProductsModal] = useState(false) // ✅ Modal for products
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null)
    const [productsLoading, setProductsLoading] = useState(false)
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchTimeout, setSearchTimeout] = useState(null)

    // API call to fetch orders
    const listOrders = async (staffId) => {
        if (!staffId) return

        setLoading(true)
        try {
            const url = `${Constant.URL}${Constant.OtherURL.staff_wise_order_list}`
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customer_id: staffId }),
            })
            const result = await response.json()
            if (result.code == '200') {
                const formatted = result.Payload.map(item => ({
                    label: `Order no ${item.order_no}`,
                    value: String(item.order_no),
                    order_no: item.order_no,
                    customer_name: item.customer_name || '',
                    order_date: item.order_date || '',
                    status: item.status || 'Pending',
                    order_id: item.order_id
                }))
                setOrderList(formatted)
                setFilteredOrders(formatted)
            } else {
                setOrderList([])
                setFilteredOrders([])
            }
        } catch (error) {
            console.log('Network error in listOrders:', error)
            setOrderList([])
            setFilteredOrders([])
        } finally {
            setLoading(false)
        }
    }

    const fetchOrderProducts = async (orderNo) => {
        if (!orderNo) return

        setProductsLoading(true)
        try {
            const url = `${Constant.URL}${Constant.OtherURL.orderno_wise_orderlist}`
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_no: orderNo }),
            })
            const result = await response.json()

            if (result.code == 200 && result.payload) {

                setProducts(result.payload)
                setShowProductsModal(true)

            } else {
                setProducts([])
                ToastAndroid.show('No products found for this order', ToastAndroid.SHORT)
            }
        } catch (error) {
            console.log('Error fetching products:', error)
            ToastAndroid.show('Failed to load products', ToastAndroid.SHORT)
        } finally {
            setProductsLoading(false)
        }
    }


    // ✅ Handle product selection
    const handleProductSelect = (product) => {
        setShowProductsModal(false)
        navigation.navigate('AddService', {
            OrderId: selectedOrderDetails?.order_id || product.order_id,
            orderNo: selectedOrderDetails?.order_no,
            customerid: customerid,
            customerName: customerName,
            productId: product.product_id,
            productName: product.item_name,
            service: route.params?.service || null,
            staffName: staffName
        })
    }

    // Handle search functionality
    const handleSearchChange = (text) => {
        setSearchTerm(text)

        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        const newTimeout = setTimeout(() => {
            if (text.trim() === '') {
                setFilteredOrders(orderList)
            } else {
                const filtered = orderList.filter(order =>
                    order.order_no.toLowerCase().includes(text.toLowerCase())
                    // order.company_name.toLowerCase().includes(text.toLowerCase()) ||
                    // order.label.toLowerCase().includes(text.toLowerCase())
                )
                setFilteredOrders(filtered)
            }
        }, 300)

        setSearchTimeout(newTimeout)
    }

    // Handle order selection
    // ✅ Handle order selection - Show products instead of going directly to service
    const handleOrderSelect = (order) => {
        setSelectedOrderDetails(order)
        fetchOrderProducts(order.order_no)
    }

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
    }

    // Get status color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return '#FFA500'
            case 'loading': return '#007BFF'
            case 'delivered': return '#28A745'
            case 'cancelled': return '#DC3545'
            case 'on the way': return '#17A2B8'
            case 'advanced': return '#6F42C1'
            default: return '#6C757D'
        }
    }

    useFocusEffect(
        useCallback(() => {
            if (customerid) {
                listOrders(customerid)
            }
        }, [customerid])
    )

    const renderProductItem = ({ item, index }) => {
        // ✅ Check if both order_no AND product_id match
        const isSelected = selectedOrder === item.order_no && ProductId === item.product_id;

        return (
            <TouchableOpacity
                style={{
                    backgroundColor: isSelected ? '#e0e9ff' : '#FFFFFF',
                    borderRadius: 10,
                    padding: 15,
                    marginHorizontal: 10,
                    marginBottom: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 3,
                    borderLeftWidth: 4,
                    borderLeftColor: isSelected ? '#007BFF' : '#173161'
                }}
                onPress={() => handleProductSelect(item)}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontFamily: 'Inter-Bold',
                            fontSize: 16,
                            color: isSelected ? '#007BFF' : '#173161',
                            marginBottom: 6
                        }}>
                            {item.item_name || 'Product Name'}
                            {isSelected && (
                                <Text style={{
                                    fontSize: 12,
                                    color: '#007BFF',
                                    fontFamily: 'Inter-Regular'
                                }}>
                                    {' '}✓ Selected
                                </Text>
                            )}
                        </Text>

                        {item.product_id && (
                            <Text style={{
                                fontFamily: 'Inter-Regular',
                                fontSize: 14,
                                color: '#666',
                                marginBottom: 4
                            }}>
                                Order date: {formatDate(item.order_date)}
                            </Text>
                        )}

                        {item.item_qty && (
                            <Text style={{
                                fontFamily: 'Inter-Regular',
                                fontSize: 14,
                                color: isSelected ? '#007BFF' : '#666',
                                marginBottom: 4
                            }}>
                                Qty: {item.item_qty}
                            </Text>
                        )}

                        {item.item_price && (
                            <Text style={{
                                fontFamily: 'Inter-Medium',
                                fontSize: 14,
                                color: isSelected ? '#007BFF' : '#28A745'
                            }}>
                                ₹{item.item_price}
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={() => handleProductSelect(item)}
                        style={{
                            backgroundColor: isSelected ? '#007BFF20' : '#17316120',
                            padding: 8,
                            borderRadius: 50,
                            marginLeft: 10
                        }}
                    >
                        <Ionicons
                            name={isSelected ? "checkmark-circle" : "construct-outline"}
                            size={20}
                            color={isSelected ? '#007BFF' : '#173161'}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    }
    // Render each order item
    const renderOrderItem = ({ item, index }) => (
        <TouchableOpacity
            style={{
                backgroundColor: selectedOrder === item.order_no ? '#e0e9ff' : '#FFFFFF',
                borderRadius: 10,
                padding: 15,
                marginHorizontal: 15,
                marginBottom: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 3,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}
            onPress={() => handleOrderSelect(item)}
        >
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontFamily: 'Inter-Bold',
                            fontSize: 16,
                            color: '#173161',
                            marginBottom: 4
                        }}>
                            {item.label}
                        </Text>
                        <Text style={{
                            fontFamily: 'Inter-Regular',
                            fontSize: 14,
                            color: '#666',
                            marginBottom: 8
                        }}>
                            {item.customer_name}
                        </Text>
                    </View>
                    <View style={{
                        backgroundColor: getStatusColor(item.status),
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        marginLeft: 10
                    }}>
                        <Text style={{
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontFamily: 'Inter-Medium'
                        }}>
                            {item.status || 'Pending'}
                        </Text>
                    </View>
                </View>

                {/* <Text style={{
                    fontFamily: 'Inter-Regular',
                    fontSize: 12,
                    color: '#999'
                }}>
                    Order Date: {formatDate(item.order_date)}
                </Text> */}
            </View>

            <TouchableOpacity
                onPress={() => handleOrderSelect(item)}
                style={{
                    marginLeft: 10,
                    backgroundColor: '#17316120',
                    padding: 8,
                    borderRadius: 50
                }}
            >
                <Ionicons name="list-outline" size={20} color="#173161" />
            </TouchableOpacity>
        </TouchableOpacity>
    )

    // Render empty state
    const renderEmptyState = () => (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 100
        }}>
            <Ionicons name="document-text-outline" size={80} color="#173161" />
            <Text style={{
                fontFamily: 'Inter-Bold',
                fontSize: 16,
                color: '#173161',
                marginTop: 16,
                marginBottom: 8
            }}>
                No orders available
            </Text>
            <Text style={{
                fontFamily: 'Inter-Regular',
                fontSize: 14,
                color: '#666',
                textAlign: 'center'
            }}>
                {customerid ? 'No orders found for this customer' : 'Customer ID not provided'}
            </Text>
        </View>
    )

    return (
        <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
            <StatusBar backgroundColor="#173161" barStyle="light-content" />

            {/* Header */}
            <View style={{
                backgroundColor: '#173161',
                flexDirection: 'row',
                height: 60,
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 15
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={{
                    color: '#FFF',
                    fontFamily: 'Inter-Bold',
                    fontSize: 16,
                    flex: 1,
                    textAlign: 'center'
                }}>
                    Select Order
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Bar */}
            <View style={{
                padding: 15,
                backgroundColor: '#FFF',
                borderBottomWidth: 1,
                borderBottomColor: '#E0E0E0'
            }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F8F8F8',
                    borderRadius: 10,
                    paddingHorizontal: 15,
                    borderWidth: 1,
                    borderColor: '#E0E0E0'
                }}>
                    <Ionicons name="search" size={18} color="#666" style={{ marginRight: 10 }} />
                    <TextInput
                        placeholder="Search by order no"
                        value={searchTerm}
                        onChangeText={handleSearchChange}
                        placeholderTextColor="#999"
                        style={{
                            flex: 1,
                            height: 45,
                            fontFamily: 'Inter-Regular',
                            fontSize: 14,
                            color: '#333'
                        }}
                    />
                </View>
            </View>

            {/* Orders Count */}
            {filteredOrders.length > 0 && (
                <View style={{
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                    backgroundColor: '#FFF'
                }}>
                    <Text style={{
                        fontFamily: 'Inter-Medium',
                        fontSize: 14,
                        color: '#666'
                    }}>
                        {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
                    </Text>
                </View>
            )}

            {/* Orders List */}
            <View style={{ flex: 1 }}>
                {loading ? (
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <ActivityIndicator size="large" color="#173161" />
                        <Text style={{
                            fontFamily: 'Inter-Medium',
                            fontSize: 14,
                            color: '#666',
                            marginTop: 10
                        }}>
                            Loading orders...
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredOrders}
                        renderItem={renderOrderItem}
                        keyExtractor={(item, index) => `${item.value}-${index}`}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingVertical: 10,
                            paddingBottom: 80
                        }}
                        ListEmptyComponent={renderEmptyState}
                    />
                )}
            </View>
            <View style={{
                position: 'absolute',
                bottom: 15,
                alignSelf: 'center',
                zIndex: 10,
            }}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                        navigation.navigate('AddService', {
                            customerid: customerid,
                            customerName: customerName,
                            staffName: staffName
                        })
                    }
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#173161',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 25,
                        elevation: 6,
                        shadowColor: '#000',
                        shadowOpacity: 0.2,
                        shadowOffset: { width: 0, height: 3 },
                        shadowRadius: 4,
                    }}>
                    <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                    <Text
                        style={{
                            color: '#fff',
                            fontSize: 16,
                            fontFamily: 'Inter-SemiBold',
                        }}>
                        New Service
                    </Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={showProductsModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowProductsModal(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'flex-end'
                }}>
                    <View style={{
                        backgroundColor: '#FFF',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        maxHeight: '80%',
                        paddingBottom: 20
                    }}>
                        {/* Modal Header */}
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 20,
                            borderBottomWidth: 1,
                            borderBottomColor: '#E0E0E0'
                        }}>
                            <View>
                                <Text style={{
                                    fontFamily: 'Inter-Bold',
                                    fontSize: 18,
                                    color: '#173161'
                                }}>
                                    Select Product
                                </Text>
                                <Text style={{
                                    fontFamily: 'Inter-Regular',
                                    fontSize: 14,
                                    color: '#666',
                                    marginTop: 4
                                }}>
                                    Order: {selectedOrderDetails?.order_no}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowProductsModal(false)}
                                style={{
                                    padding: 5
                                }}
                            >
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Products List */}
                        <View>
                            {productsLoading ? (
                                <View style={{
                                    padding: 40,
                                    alignItems: 'center'
                                }}>
                                    <ActivityIndicator size="large" color="#173161" />
                                    <Text style={{
                                        fontFamily: 'Inter-Medium',
                                        fontSize: 14,
                                        color: '#666',
                                        marginTop: 10
                                    }}>
                                        Loading products...
                                    </Text>
                                </View>
                            ) : products.length > 0 ? (
                                <FlatList
                                    data={products}
                                    renderItem={renderProductItem}
                                    keyExtractor={(item, index) => `product-${item.product_id}-${index}`}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{
                                        paddingVertical: 10
                                    }}
                                />
                            ) : (
                                <View style={{
                                    padding: 40,
                                    alignItems: 'center'
                                }}>
                                    <Ionicons name="cube-outline" size={60} color="#CCC" />
                                    <Text style={{
                                        fontFamily: 'Inter-Medium',
                                        fontSize: 16,
                                        color: '#666',
                                        marginTop: 10,
                                        textAlign: 'center'
                                    }}>
                                        No products found in this order
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    )
}

export default OrderListService

const styles = StyleSheet.create({})