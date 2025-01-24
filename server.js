// filepath: /backend/server.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const SECRET_KEY = 'your_secret_key';

app.use(bodyParser.json());

const corsOptions = {
  origin:
    "https://buoyproject-awb6hvh3c8c3dmdw.westeurope-01.azurewebsites.net/", // Replace with your frontend's Azure URL
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

const users = [
  { username: 'admin', password: 'groep3' },
  // Add more users as needed
];

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(403).json({ message: 'No token provided' });
    }
  
    jwt.verify(token.split('')[1], SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to authenticate token' });
      }
      req.userId = decoded.id;
      next();
    });
  }  

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/addUser', verifyToken, (req, res) => {
  const { username, password } = req.body;
  console.log('Received request to add user:', username,);

  if (users.find(u => u.username === username)) {
    console.log('User already exists', username);	
    return res.status(400).json({ message: 'User already exists' });
  }

  try {
    users.push({ username, password });
    console.log('User added successfully:', username);
    res.status(201).json({ message: 'User added successfully' });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'This is a protected route' });
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});