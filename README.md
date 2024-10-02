## Internal API
Internal API it's a node 20 express web API written using Javascript.
To run this application, you need to provide an **.env** file into ```metaphoto_test/internal_api``` root folder with the following keys:
```
AWS_ACCESS_KEY_ID=<your aws access key>

AWS_SECRET_ACCESS_KEY=<your aws secret access key>

AWS_REGION=<your aws region>

DYNAMO_TABLE_NAME=<your table name>
```
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
