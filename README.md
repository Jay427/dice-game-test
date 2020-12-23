# Dice-Game

### Pre-Request
- Install node js and mongodb on local server.

### Server start process
```
Copy ./dice-game-test/.env.dist to ./dice-game-test/.env. Change according to your needs.

npm install

npm start
```

### Base URL
- http://localhost:4000/

### Overview playing
- Open four tabs in the browser using this URL http://localhost:4000/ and give a player name in the popup.
- According to document 30 second timer start for each in that time duration user can click on dice.
- If a user does not take turn timer will expire and take a turn from the backend.
- If the user gets dice value 3 . the score will multiply by 2 with dice value. So the score will increase with 3*2=6. 