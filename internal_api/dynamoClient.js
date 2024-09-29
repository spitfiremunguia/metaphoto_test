const AWS = require('aws-sdk');
require('dotenv').config();
const returnLimit =25;

// Initialize DynamoDB client
const dynamoClient = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

//gsi_type-index

const getAllForAnEntity = async (type) => {
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'gsi_type-index',
    KeyConditionExpression: "#type = :type",
    ExpressionAttributeNames: {
      "#type": "type",
    },
    ExpressionAttributeValues: {
      ":type": type,  // Querying all users
    },
    Limit:returnLimit
  };

  try {
    const data = await dynamoClient.query(params).promise();
    return data.Items;
  } catch (error) {
    console.error("Error querying DynamoDB:", error);
    throw new Error("Error querying DynamoDB");
  }
};


// Function to get a specific user by ID
const getUserById = async (user_id) => {
    PK = `user_${user_id}`
    SK = 'profile'
    const params = {

        TableName: TABLE_NAME,
        Key: { 
            PK,
            SK},
    };
    return await dynamoClient.get(params).promise();
};



// Function to get a specific user by ID
const getAlbumById = async (user_id) => {
    PK = `album_${user_id}`
    SK = 'metadata'
    const params = {

        TableName: TABLE_NAME,
        Key: { 
          PK,
          SK},
    };
    return await dynamoClient.get(params).promise();
};


const getPhotoById = async (user_id) => {
    PK = `photo_${user_id}`
    SK = 'metadata'
    const params = {

        TableName: TABLE_NAME,
        Key: { 
            PK,
            SK},
    };
    return await dynamoClient.get(params).promise();
};



module.exports = {
  getAllForAnEntity,
  getUserById,
  getAlbumById,
  getPhotoById
};