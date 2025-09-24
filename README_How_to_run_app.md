first clone this repo to your local machine

create my sql server use the password adn user account in env to configure your server or replace with your username and password in the env file

!!!!!! WARNING !!!!!!!!
Never commit your actual .env files to repositories everybody can see it, this is just for demonstration

run the table creation and seed data adding schema to generate sample test data into the databse


You need to run the Repetition Engine v1 flask microservice
```bash
cd .\RepetitionEngineV1Synthetic\ 
pyton app.py
```
run the server for the backend
```bash
cd server
npm install
npm run dev
```
Run the frontend
```bash
cd .\frontend
npm install
npm run dev
```