provider "aws" {
  region = "us-east-1"  # Adjust to your desired region
}

# DynamoDB Table
resource "aws_dynamodb_table" "metaphoto" {
  name           = "metaphoto_internal_api"
  billing_mode   = "PAY_PER_REQUEST"  # On-demand billing
  hash_key       = "PK"  # Partition Key
  range_key      = "SK"  # Sort Key

  attribute {
    name = "PK"
    type = "S"  # String
  }

  attribute {
    name = "SK"
    type = "S"  # String
  }

  # GSI for querying all users, albums, or photos by entity_type
  global_secondary_index {
    name               = "GSI_EntityType"
    hash_key           = "entity_type"  # Partition Key for GSI
    range_key          = "PK"  # Sort Key for GSI
    projection_type    = "ALL"  # Project all attributes
  }

  # GSI for querying users by email
  global_secondary_index {
    name               = "GSI_UsersByEmail"
    hash_key           = "entity_type"  # Partition Key for GSI
    range_key          = "email"  # Sort Key for GSI
    projection_type    = "ALL"  # Project all attributes
  }

  # GSI for querying albums by title
  global_secondary_index {
    name               = "GSI_AlbumsByTitle"
    hash_key           = "entity_type"  # Partition Key for GSI
    range_key          = "title"  # Sort Key for GSI
    projection_type    = "ALL"  # Project all attributes
  }

  # GSI for querying photos by title
  global_secondary_index {
    name               = "GSI_PhotosByTitle"
    hash_key           = "entity_type"  # Partition Key for GSI
    range_key          = "title"  # Sort Key for GSI
    projection_type    = "ALL"  # Project all attributes
  }

  # Table Attributes
  attribute {
    name = "entity_type"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "title"
    type = "S"
  }

  tags = {
    Name        = "metaphoto_internal_api"
    Environment = "production"
  }
}
