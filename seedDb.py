import boto3
import json
import argparse

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

# Parse command-line arguments for table_name and seed_route
parser = argparse.ArgumentParser(description="Insert items into DynamoDB from a JSON seed file.")
parser.add_argument('--table_name', required=True, help="The name of the DynamoDB table")
parser.add_argument('--seed_route', required=True, help="The path to the JSON seed file")
parser.add_argument('--aws_region', required=True, help="The region where you want your table")

args = parser.parse_args()

# Initialize a session using Amazon DynamoDB with the provided table name
dynamodb = boto3.resource('dynamodb', region_name=args.aws_region)
table = dynamodb.Table(args.table_name)

# Load the data from the provided seed file path (seed_route)
with open(args.seed_route, 'r') as f:
    data = json.load(f)

# Extract the actual items from the "Items" field
items = data.get('Items', [])

# Iterate over each item, convert, and insert into DynamoDB
for idx, item in enumerate(items):
    python_item = dynamodb_json_to_python(item)  # Convert to Python dict
    try:
        table.put_item(Item=python_item)  # Insert into DynamoDB
    except Exception as e:
        print(f"Failed to insert item {idx + 1}: {e}")

print("Items successfully inserted into DynamoDB.")