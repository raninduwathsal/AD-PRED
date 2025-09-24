First clone this repo to your local machine

Create MySQL server use the password and user account in env to configure your server or replace with your username and password in the env file

!!!!!! WARNING !!!!!!!!
Never commit your actual .env files to repositories everybody can see it, this is just for demonstration

Run the table creation and seed data adding schema to generate sample test data into the database


You need to run the Repetition Engine v1 Flask microservice
```bash
cd .\RepetitionEngineV1Synthetic\ 
pip install -r requirements.txt
python app.py
```
Run the server for the backend
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