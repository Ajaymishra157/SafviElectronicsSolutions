const functions = require('firebase-functions');
const admin = require('firebase-admin');
const mysql = require('mysql2/promise');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ✅ MySQL config – REPLACE with your own credentials
const dbConfig = {
  host: '193.203.184.176',
  // host: 'srv1741.hstgr.io',
  user: 'u812634718_haashh_dev',
  password: 'Haashh@123',
  database: 'u812634718_haashh_dev',
};

// ✅ Cloud Function to send order notification
exports.sendOrderNotification = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = context.params.orderId;
    console.log('Order data received:', order);

    // Connect to MySQL
    let connection;
    try {
      console.log('Connecting to MySQL...');
      connection = await mysql.createConnection(dbConfig);
      console.log('Connected to MySQL');
    } catch (err) {
      console.error('Error connecting to MySQL:', err);
      return null;
    }

    // Query users with voice note permission
    let rows;
    try {
      [rows] = await connection.execute(
        `SELECT ml.admin_id, ml.fcm_token 
         FROM permision p
         JOIN manage_login ml ON ml.admin_id = p.user_id
         WHERE p.menu_permission = 'voice note'
           AND ml.fcm_token IS NOT NULL 
           AND ml.fcm_token != ''`
      );
      console.log(`MySQL query returned ${rows.length} users`);
    } catch (err) {
      console.error('Error querying MySQL:', err);
      await connection.close();
      return null;
    }

    if (rows.length === 0) {
      console.log('No users with "voice note" permission found.');
      await connection.close();
      return null;
    }

    // Send notifications
    for (const { admin_id, fcm_token } of rows) {
      const message = {
        token: fcm_token,
        notification: {
          title: 'नया ऑर्डर किया गया!',
          // title: 'New Order Created!',
          // body: `${order.createdBy} द्वारा ${order.customername} में ${order.totalAmount} का ऑर्डर किया गया है`,
          body: `${order.createdBy} has placed an order worth ${order.totalAmount} for ${order.customername}`,
        },
        data: {
          title: 'नया ऑर्डर किया गया!',
          body: `${order.createdBy} has placed an order worth ${order.totalAmount} for ${order.customername}`,
          orderId: orderId,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      };

      try {
        console.log(`Sending notification to user ${admin_id} with token: ${fcm_token}`);
        console.log('Sending payload:', JSON.stringify(message, null, 2));
        const response = await admin.messaging().send(message);

        console.log(`Notification sent to user ${admin_id}:`, response);
      } catch (err) {
        console.error(`🔥 Error sending notification to user ${admin_id}:`);
        console.error('Code:', err.code);
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);
      }
    }

    await connection.close();
    return null;
  });

