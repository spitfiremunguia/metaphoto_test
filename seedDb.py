import boto3
import json

dynamodb = boto3.resource('dynamodb', region_name='us-eas-1')
table = dynamodb.Table('Metaphoto_test')

# Load the data from the JSON file
with open('dynamo_data.json') as f:
    data = json.load(f)

# Insert each item into the new DynamoDB table
for item in data:
    table.put_item(Item=item)

print("Data successfully seeded")