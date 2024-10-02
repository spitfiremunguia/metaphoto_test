#!/bin/bash

# Check if the correct number of parameters are provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <table_name> <aws_region>"
    exit 1
fi

# Assign the arguments to variables
table_name=$1
aws_region=$2

# Navigate to the script directory
cd /home/${USER}/metaphoto_test

# Run the Python script with the passed arguments
python3 seedDb.py --table_name "$table_name" --seed_route dynamo_data.json  --aws_region "$aws_region"