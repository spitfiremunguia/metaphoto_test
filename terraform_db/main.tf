terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  access_key = var.aws_access_key
  secret_key = var.aws_secret_access_key
  region     = var.aws_region
}


# Environment Variables for AWS and DynamoDB
variable "aws_access_key" {
  type      = string
}

variable "aws_secret_access_key" {
  type      = string
}

variable "aws_region" {
  type = string
}

variable "dynamo_table_name" {
  type = string
}


#create dynamotable
resource "aws_dynamodb_table" "metaphoto_test_dev" {
  name           = "${var.dynamo_table_name}"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "PK" # Partition key
  range_key      = "SK" # Sort key

  lifecycle {
    prevent_destroy = false
  }

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "related_to"
    type = "S"
  }

  attribute {
    name = "relation_type"
    type = "S"
  }

  attribute {
    name = "title"
    type = "S"
  }

  attribute {
    name = "type"
    type = "S"
  }

  # Global Secondary Index: gsi_type-index
  global_secondary_index {
    name            = "gsi_type-index"
    hash_key        = "type"
    range_key       = "PK"
    projection_type = "ALL"

    read_capacity  = 5
    write_capacity = 5
  }

  # Global Secondary Index: gsi_related_to-index
  global_secondary_index {
    name            = "gsi_related_to-index"
    hash_key        = "related_to"
    range_key       = "relation_type"
    projection_type = "ALL"

    read_capacity  = 5
    write_capacity = 5
  }

  # Global Secondary Index: gsi_title-index
  global_secondary_index {
    name            = "gsi_title-index"
    hash_key        = "type"
    range_key       = "title"
    projection_type = "ALL"

    read_capacity  = 5
    write_capacity = 5
  }

  # Global Secondary Index: gsi_email-index
  global_secondary_index {
    name            = "gsi_email-index"
    hash_key        = "email"
    range_key       = "PK"
    projection_type = "ALL"

    read_capacity  = 5
    write_capacity = 5
  }

  tags = {
    Name = "${var.dynamo_table_name}"
  }
 
}

resource "null_resource" "run_local_command" {
    # Run the Python script to seed the DynamoDB table
  provisioner "local-exec" {
    
      command = "sudo cdchmod 700 ./seed_db.sh && ./seed_db.sh ${var.dynamo_table_name} ${var.aws_region}"
    
  }
  
}