import boto3
import json

# Function to convert DynamoDB JSON format to Python dict
def dynamodb_json_to_python(item):
    result = {}
    for key, value in item.items():
        if 'S' in value:
            result[key] = value['S']  # String
        elif 'N' in value:
            result[key] = value['N']  # Number
        elif 'M' in value:
            result[key] = dynamodb_json_to_python(value['M'])  # Map (nested object)
        elif 'L' in value:
            result[key] = [dynamodb_json_to_python(v) if isinstance(v, dict) else v for v in value['L']]  # List
        # Add additional type checks (e.g., 'BOOL', 'NULL') as needed
    return result

# Initialize a session using Amazon DynamoDB
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('Metaphoto_test')  # Update with your table name

# Load the data from dynamo_data.json
with open('./dynamo_data.json', 'r') as f:
    data = json.load(f)

# Extract the actual items from the "Items" field
items = data.get('Items', [])

# Iterate over each item, convert, and insert into DynamoDB
for item in items:
    python_item = dynamodb_json_to_python(item)  # Convert to Python dict
    table.put_item(Item=python_item)  # Insert into DynamoDB

print("Items successfully inserted into DynamoDB.")