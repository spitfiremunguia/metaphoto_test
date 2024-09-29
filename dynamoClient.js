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

const getUsers = async () => {
  entity_type = 'profile'
  const params = {
    TableName: TABLE_NAME,
    Limit:returnLimit,
    Key:{
        entity_type
    }
  };
  return await dynamoClient.scan(params).promise();
};


// Function to get a specific user by ID
const getUserById = async (user_id) => {
    id = `user_${user_id}`
    entity_type = 'profile'
    const params = {

        TableName: TABLE_NAME,
        Key: { 
            id,
            entity_type},
    };
    return await dynamoClient.get(params).promise();
};



// Function to get a specific user by ID
const getAlbumById = async (user_id) => {
    id = `album_${user_id}`
    entity_type = 'metadata'
    const params = {

        TableName: TABLE_NAME,
        Key: { 
            id,
            entity_type},
    };
    return await dynamoClient.get(params).promise();
};


const getPhotoById = async (user_id) => {
    id = `photo_${user_id}`
    entity_type = 'metadata'
    const params = {

        TableName: TABLE_NAME,
        Key: { 
            id,
            entity_type},
    };
    return await dynamoClient.get(params).promise();
};



module.exports = {
  getUserById,
  getAlbumById,
  getPhotoById
};