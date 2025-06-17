const express = require("express")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const bcrypt = require('bcryptjs')

const app = express();
const JWT_SECRET = "bbnos"

app.use(express.json());
app.use(cors());

const users = [
    {
        id: 1, 
        username: 'admin', 
        hashedPassword: "$2b$10$TBV0AWoR6vynoqOhr/GwgOSWmP3MPswyf8MJmsvb5GSEDLtYcDomi",
        plan: 'free'
    }
]

// login endpoint
app.post('/api/login',(req, res) => {
    console.log(req.body)
    const { username, hash } = req.body;

    const user = users.find(u => u.username === username);

    if(!user){
        return res.status(401).json({error: "Invalid username or password"})
    }

    console.log(hash, user.hashedPassword);
    console.log(users)
    const passwordMatch = bcrypt.compare(hash, user.hashedPassword);

    if(!passwordMatch){
        return res.status(401).json({error: "Invalid username or password"})
    }

    const token = jwt.sign({userId: user.id, username: user.username, plan: user.plan}, JWT_SECRET, {
        expiresIn: '1h'
    });

    res.json({token, user: {id: user.id, username: user.username, plan: user.plan}});
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log(token);

    if(!token){
        return res.status(401).json({error: "Access token required"});
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if(err){
            return res.status(403).json({error: "Invalid token"});
        }
        req.user = user;
        next();
    });
};

// signup endpoint
app.post('/api/signup', (req, res) => {
    console.log(req.body);
    const { username, hash } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
    }
    
    // Create new user
    const newUser = {
        id: users.length + 1, // Simple ID generation - consider using UUID in production
        username: username,
        hashedPassword: hash,
        plan: 'free'
    };

    users.push(newUser);
    
    console.log(hash, newUser.hashedPassword);
    console.log(users)

    // Generate JWT token
    const token = jwt.sign(
        { userId: newUser.id, username: newUser.username }, 
        JWT_SECRET, 
        { expiresIn: '1h' }
    );
    
    // Return token and user info (without password)
    res.status(201).json({
        token, 
        user: { id: newUser.id, username: newUser.username }
    });
});

// chat endpoint
app.post('/api/chat', authenticateToken, async (req, res) => {
    console.log(req.body);
    const { message } = req.body;
    
    try {
        const response = await fetch('http://143.198.81.147:3001/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        // Check if response is ok before parsing JSON
        if (!response.ok) {
            console.error(`Python server error: ${response.status} ${response.statusText}`);
            return res.status(500).json({
                response: "AI model is currently unavailable. Please try again later."
            });
        }
        
        const data = await response.json();
        
        res.status(200).json({
            response: data.response
        });
        
    } catch (error) {
        console.error('Error calling Python server:', error);
        res.status(500).json({
            response: "Sorry, I'm having trouble connecting to the AI model."
        });
    }
});


// payment endpoint
app.post('/api/payment', authenticateToken, async (req, res) => {
  const { plan } = req.body;
  const userId = req.user.userId;
  const denyAllPaymentRequests = false; // Set to false to allow payments
  
  console.log(`Payment request for user ${userId}, plan: ${plan}`);
  
  // Check if all payments should be denied
  if (denyAllPaymentRequests) {
    return res.status(403).json({
      success: false,
      error: "Payment processing is currently unavailable",
      message: "We're temporarily unable to process payments. Please try again later."
    });
  }
  
  // Validate plan type
  const validPlans = ['Pro', 'Enterprise'];
  if (!validPlans.includes(plan)) {
    return res.status(400).json({ error: "Invalid plan type" });
  }
  
  // Find user and update their plan
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Update user's plan
  user.plan = plan.toLowerCase();
  
  // Generate new token with updated plan
  const token = jwt.sign({
    userId: user.id, 
    username: user.username, 
    plan: user.plan
  }, JWT_SECRET, {
    expiresIn: '1h'
  });
  
  if (plan === 'Pro') {
    res.json({
      success: true,
      plan: plan,
      amount: 20,
      message: "Payment successful! Pro plan activated.",
      userPlan: user.plan,
      token: token,
      user: {id: user.id, username: user.username, plan: user.plan}
    });
    
  } else if (plan === 'Enterprise') {
    res.json({
      success: true,
      plan: plan,
      message: "Enterprise plan activated! Our team will contact you within 24 hours.",
      userPlan: user.plan,
      token: token,
      user: {id: user.id, username: user.username, plan: user.plan}
    });
  }
  
  console.log(`User ${userId} plan updated to: ${user.plan}`);
});

app.listen(3002, () => {
    console.log("Nodejs server running on port 3002")
});





