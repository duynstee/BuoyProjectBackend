const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const SECRET_KEY = 'your_secret_key';

app.use(bodyParser.json());

const corsOptions = {
  origin: "https://buoyproject-awb6hvh3c8c3dmdw.westeurope-01.azurewebsites.net", // Frontend URL
  methods: ["GET", "POST"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

const users = [
  { username: 'admin', password: 'groep3' },
  // Add more users as needed
];

function verifyToken(req, res, next) {
  if (req.method === 'OPTIONS') {
    return next(); // Skip token verification for preflight requests
  }

  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
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

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  try {
    users.push({ username, password });
    res.status(201).json({ message: 'User added successfully' });
  } catch (error) {
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
