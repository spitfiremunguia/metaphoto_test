import boto3
import json

dynamodb = boto3.resource('dynamodb', region_name='us-eas-1')
table = dynamodb.Table('Metaphoto_test')

# Load the data from dynamo_data.json
with open('./dynamo_data.json', 'r') as f:
    items = json.load(f)  # This loads the JSON as a Python list

# Ensure each item is a dictionary before inserting
for item in items:
    if isinstance(item, dict):
        table.put_item(Item=item)  # Each item must be a dictionary
    else:
        print(f"Invalid item format: {item}")