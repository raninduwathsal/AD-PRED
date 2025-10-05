First clone this repo to your local machine

Create MySQL server use the password and user account in env to configure your server or replace with your username and password in the env file

!!!!!! WARNING !!!!!!!!
Never commit your actual .env files to repositories everybody can see it, this is just for demonstration

Run the table creation and seed data adding schema to generate sample test data into the database

You need to run the Repetition Engine v1 Flask microservice

To test the LLM integration engine you need to run the Integration Engine Microservice separately 

This microservice approach is to make sure the app is plug and play and if an entitiy needs to deploy the app without one feature since the development was done so that each component can be run independantly.

Eg: 

    - Integration engine and Flashcard App Can be Run seperately they are conencrtedd by the database
    - Flashcard App Can Run without the Repetition engine Microservice by using card difficulty as a fallback value to determine order of question displaying


# How to Run app (Different Microservices Run In Diferent Instructions )

TODO  [ ] Create A Script That Will Run The Microservice Collection in One Executable


---------

Clone Repo Each Microservice Is In Its each different folder
### Repo Structure
```
RepetitionEngineV1Synthetic\    
Server\ 
frontned\
IntegrationMicroservice\server
IntegrationMicroservice\
````
Repitition  Engine Hosts the AI model we use for predicting a users ability to answer each question correctly.

## NOTE : Run Each Step In A new Terminal (Powershell)

> Server\ is the backend for the flashcard app

### 0. create .env files
```bash
# root .env file
DB_URL=mysql://root:password@localhost:3306/dbname
FLASK_URL=http://localhost:5000/predict
PORT=3001

```
```bash
# .env file in the Integration Engine Microservice Folder
# Backend server port (optional)
PORT=4000

# MySQL connection URL
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL=mysql://root:pass@localhost:3306/dbname

# Alternative variable names (server will also read these if set)
# MYSQL_URL=
# CLEARDB_DATABASE_URL=
# JAWSDB_URL=

# Gemini API Key for content generation
GEMINI_API_KEY= Enter key here 

```
### 1. to run the flashcard backend
```bash
#in \server\ directory
npm install
npm run dev
```

### 2. to run the flashcard frontend
>frontend\ is the frontend for the flashcard app
```bash
# in \frontend directory run 
npm install
npm run dev
```
### 3. to run the repetition engine (Ml Model For Individual User Prediction)
```bash
pip install flask  # cant remember exact requirments try running once python should recomend needed req

python app.py
```
alternate
```bash
cd .\RepetitionEngineV1Synthetic\ 
pip install -r requirements.txt
python app.py
```
### 4. Integration Engine Frontend And Backend
```bash
#If errors happen make sure .env has the api key and db urls
# run serveer
npm run server
#in new terminal
npm run dev  #runs frontend with server connected
```

__________________
______________


Linux-specific setup (Python 3.12)

```bash
# create a new virtual environment with Python 3.12
python3.12 -m venv venv

# activate the virtual environment
source venv/bin/activate

# install dependencies inside the venv
pip install -r requirements.txt

# run the Flask microservice
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
