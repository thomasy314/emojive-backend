db = db.getSiblingDB('emojive_message_db');

// Create a collection
db.createCollection('messages');

// Optionally, add some initial data
// db.messages.insertMany([
//   {
//     message: 'Initial message 1',
//     timestamp: new Date(),
//     user: 'system'
//   },
//   {
//     message: 'Initial message 2',
//     timestamp: new Date(),
//     user: 'system'
//   }
// ]);

// // Create any indexes you need
// db.messages.createIndex({ "timestamp": 1 });

// // If you need to create additional collections
// db.createCollection('users');

// // Grant roles if needed
// db = db.getSiblingDB('admin');
// db.createUser({
//   user: process.env.MONGODB_ROOT_USER,
//   pwd: process.env.MONGODB_ROOT_PASSWORD,
//   roles: [
//     { role: "readWrite", db: "emojive_db" }
//   ]
// });
