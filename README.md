# Boutique Server Application Project by Tung Nguyen

## Technologies 

- ExpressJS 4.18.3 
- Mongoose 8.2.1
- Sendgrid/Nodemailer 6.9.12

## How to configure and run
- Clone code from GitHub
- Open code in Visual Studio Code
- Install all packages by typing "npm install" in command line
- If you are in development mode create nodemon.json file and set enviroment variables :
- "MONGO_DATABASE_URL" : "YOUR MONGO DATABASE URL"
- "PORT" : "YOUR PORT (DEFAULT IS 3000)"
- "SENDGRID_API_KEY" : "YOUR SENDGRID API KEY" (to send mail)
- "SENDGRID_EMAIL" : "YOUR SENDGRID EMAIL"
- "SERVER_DOMAIN" : "YOUR SERVER DOMAIN"
- After setting your enviroment variables, type "-npm run start:dev" in command line to start the server
