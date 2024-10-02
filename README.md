## Development environment

This application was created on an WSL2 instance of Ubuntu 24.04. In order to work and debug this application locally you will need to install in your environment:

-  ``Terraform  v1.9.6]``
- ``Python3 and pip3``
- ``NodeJs v 20``
- ``Docker and Docker compose``
- ``AWS CLI``

In order to use dynamo and also the terraform setup on terraform cloud you would need a set of access keys ``aws_access_key``  and ``aws_secret_access_key``

It's important that your access keys have these policies attached to them:

```
AmazonEC2FullAccess
AmazonDynamoDBFullAccess
```
It doesn't need to be that broad, but you need something that allows you to manipulate dynamo tables and get ec2 metadata since it's needed by terraform cloud for some reason.

If you are working on Ubuntu 24.04 or any Debian distribution you need to remember, after installing the AWS CLI to create this folder ``~/.aws`` and add the ``config`` and ``credentials`` file and make them at least readable ``chmod 600 credentials``  ``chmod 600 config config ``

## Database
So, you don't have to setup a database I included a secondary terraform folder named ``/terraform_db`` that creates a table in dynamo so you can use that in your development environment.
To run this terraform script you need to supply a ``terraform.tfvars`` file with the following variables and values:
```
aws_access_key  ="<your aws access key>"

aws_secret_access_key  ="<your aws secret access key>"

aws_region  ="<your aws region name>"

dynamo_table_name  =<the name you want for your table>
```
You will need to have python3 and pip3 installed in your development environment if you want to run this terraform script since it uses a python script to seed your database with the data I included in the file ``dynamo_data.json`` file.

The other thing you might need to change if you don't work with Ubuntu or Debian, it's the path of the dynamo_data.json that I reference inside ``metaphoto_test/terraform_db/seed_db.sh`` in the line 14:
``cd  /home/${USER}/metaphoto_test``

after that you just have to run the basic terraform commands
```
terraform init
terraform validate
terraform plan
terraform apply
```
After that you should have a dynamodb table with the project schema ready to be referenced in your code.

## Internal API
Internal API it's a node 20 express web API written using Javascript.
To run this application, you need to provide an **.env** file into ```metaphoto_test/internal_api``` root folder with the following keys:
```
AWS_ACCESS_KEY_ID=<your aws access key>

AWS_SECRET_ACCESS_KEY=<your aws secret access key>

AWS_REGION=<your aws region>

DYNAMO_TABLE_NAME=<your table name>
```
Those keys are basically the same as the ones described in the previous sections.

You must setup a database with the correct schema described in the previous section or ``metaphoto_test/terraform_db/main.tf``

After that you only need to use docker and the Dockerfile provided in ``metaphoto_test/internal_api``  by using ``docker build -t metaphoto_internal_api .`` to the image.
Then use ``docker run -p 3000:3000 metaphoto_internal_api`` to run the image using the port 3000.
You should be able to access this API with ``http://localhost:3000/``


## External API
External API it's a node 20 express web API written using Javascript.
To run this application, you don't need any environment variables, but **Internal API docker image must be running on port 3000** of your host so this API can access it.

After that you only need to use docker and the Dockerfile provided in ``metaphoto_test/external_api``  by using ``docker build -t metaphoto_external_api .`` to the image.
Then use ``docker run -p 4000:4000 metaphoto_external_api`` to run the image using the port 4000.

You should be able to access this API with ``http://localhost:4000/externalapi/``

## WebApp
WebApp it's a basic web application written using node 20, express and basic Javascript, CSS and html

To run this application, you need to provide a **.env** file into ``metaphoto_test/webapp`` with the following keys:
```
OPENAI_API_KEY=<your openapi api access key>
```
WebApp **uses   External API services running on port 5000**. That implies **Internal API must be running also on port 3000** so webapp can work.

After those requirements are met, you only need to use docker and the Dockerfile provided in ``metaphoto_test/webapp``  by using ``docker build -t metaphoto_webapp .`` to the image.
Then use ``docker run -p 5000:5000 metaphoto_webapp`` to run the image using the port 5000.


## RUN THE WHOLE PROJECT LOCALLY

If you want to run the 3 services that composes this project, just provide each service folder with their respective .env file if needed and use docker compose to build and configure the three services using the docker-compose.yml file provided at ``metaphoto/ `` root path. 

Before building the compose file **you need to change the paths on the env_file properties to the actual path in your host for the internal_api/.env and webapp/.env files**

The path that you see there its needed for the CI/DI pipeline so don't commit those changes.

After that is ready just:
```
docker compose build
docker compose up
```
You should be able to use the webapp on port:5000 as usual.

### warning
if your host environment is using port 80, **you will need to change docker-compose.yml file to use port:5000 or whatever other port you want the webapp to be exposed onto**. Just change the port number in the webapp section inside the docker-compose.yml

Currently is using port 80 so the web app can be exposed to the internet using a domain.
