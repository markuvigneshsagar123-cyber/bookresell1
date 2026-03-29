import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = 'your-secret-key-for-bookresell';
const db = new Database('bookresell.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    displayName TEXT,
    email TEXT UNIQUE,
    password TEXT,
    photoURL TEXT,
    bio TEXT,
    location TEXT,
    role TEXT DEFAULT 'user',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT,
    author TEXT,
    price REAL,
    category TEXT,
    condition TEXT,
    description TEXT,
    imageUrl TEXT,
    sellerId TEXT,
    sellerName TEXT,
    status TEXT DEFAULT 'Available',
    quantity INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sellerId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    buyerId TEXT,
    buyerName TEXT,
    bookId TEXT,
    bookTitle TEXT,
    sellerId TEXT,
    sellerName TEXT,
    amount REAL,
    status TEXT DEFAULT 'Requested',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(buyerId) REFERENCES users(id),
    FOREIGN KEY(bookId) REFERENCES books(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    orderId TEXT,
    senderId TEXT,
    text TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(orderId) REFERENCES orders(id),
    FOREIGN KEY(senderId) REFERENCES users(id)
  );
`);

// Migrations for existing tables
const tableInfo = db.prepare("PRAGMA table_info(orders)").all();
const columns = tableInfo.map((c: any) => c.name);
if (!columns.includes('buyerName')) {
  try { db.exec('ALTER TABLE orders ADD COLUMN buyerName TEXT'); } catch (e) { console.error('Migration error (buyerName):', e); }
}
if (!columns.includes('bookTitle')) {
  try { db.exec('ALTER TABLE orders ADD COLUMN bookTitle TEXT'); } catch (e) { console.error('Migration error (bookTitle):', e); }
}

const bookTableInfo = db.prepare("PRAGMA table_info(books)").all();
const bookColumns = bookTableInfo.map((c: any) => c.name);
if (!bookColumns.includes('quantity')) {
  try { db.exec('ALTER TABLE books ADD COLUMN quantity INTEGER DEFAULT 1'); } catch (e) { console.error('Migration error (quantity):', e); }
}

const userTableInfo = db.prepare("PRAGMA table_info(users)").all();
const userColumns = userTableInfo.map((c: any) => c.name);
if (!userColumns.includes('bio')) {
  try { db.exec('ALTER TABLE users ADD COLUMN bio TEXT'); } catch (e) { console.error('Migration error (bio):', e); }
}
if (!userColumns.includes('location')) {
  try { db.exec('ALTER TABLE users ADD COLUMN location TEXT'); } catch (e) { console.error('Migration error (location):', e); }
}

const app = express();
app.use(express.json());
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Ensure uploads directory exists at startup
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Serve static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = Math.random().toString(36).substr(2, 9);
    const role = email === 'vigneshsagar666@gmail.com' ? 'admin' : 'user';
    
    const stmt = db.prepare('INSERT INTO users (id, displayName, email, password, role) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, name, email, hashedPassword, role);
    
    const token = jwt.sign({ id, email, name, role }, JWT_SECRET);
    res.json({ token, user: { id, email, displayName: name, role } });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Ensure the specific user is always admin
    let role = user.role;
    if (user.email === 'vigneshsagar666@gmail.com' && role !== 'admin') {
      role = 'admin';
      db.prepare('UPDATE users SET role = ? WHERE id = ?').run('admin', user.id);
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, name: user.displayName, role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, role, bio: user.bio, location: user.location, photoURL: user.photoURL } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/users/:id', (req, res) => {
  try {
    const user = db.prepare('SELECT id, displayName, photoURL, bio, location, role, createdAt FROM users WHERE id = ?').get(req.params.id) as any;
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

app.put('/api/users/profile', (req, res) => {
  const { id, displayName, bio, location, photoURL } = req.body;
  try {
    db.prepare('UPDATE users SET displayName = ?, bio = ?, location = ?, photoURL = ? WHERE id = ?')
      .run(displayName, bio, location, photoURL, id);
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    res.json({ 
      id: updatedUser.id, 
      email: updatedUser.email, 
      displayName: updatedUser.displayName, 
      role: updatedUser.role,
      bio: updatedUser.bio,
      location: updatedUser.location,
      photoURL: updatedUser.photoURL
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// --- BOOK ROUTES ---

app.get('/api/books', (req, res) => {
  const { q, category, condition, minPrice, maxPrice, sellerId } = req.query;
  let sql = 'SELECT * FROM books WHERE 1=1';
  const params: any[] = [];

  if (q) {
    sql += ' AND (title LIKE ? OR author LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }
  if (category && category !== 'All') {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (condition && condition !== 'All') {
    sql += ' AND condition = ?';
    params.push(condition);
  }
  if (minPrice) {
    sql += ' AND price >= ?';
    params.push(Number(minPrice));
  }
  if (maxPrice) {
    sql += ' AND price <= ?';
    params.push(Number(maxPrice));
  }
  if (sellerId) {
    sql += ' AND sellerId = ?';
    params.push(sellerId);
  }

  sql += ' ORDER BY createdAt DESC';
  const books = db.prepare(sql).all(...params);
  res.json(books);
});

app.get('/api/books/:id', (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});

app.post('/api/books', upload.single('image'), (req, res) => {
  const { title, author, price, category, condition, description, sellerId, sellerName, quantity, imageUrl: bodyImageUrl } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : bodyImageUrl || null;
  const id = Math.random().toString(36).substr(2, 9);

  try {
    const stmt = db.prepare(`
      INSERT INTO books (id, title, author, price, category, condition, description, imageUrl, sellerId, sellerName, quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, title, author, Number(price), category, condition, description, imageUrl, sellerId, sellerName, Number(quantity || 1));
    res.json({ id, title, imageUrl });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'Error adding book to database' });
  }
});

// --- ORDER & REQUEST ROUTES ---

app.post('/api/orders', (req, res) => {
  const { buyerId, buyerName, bookId, bookTitle, sellerId, sellerName, amount } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  
  if (!buyerId || !bookId || !sellerId) {
    console.error('Missing required fields for order:', { buyerId, bookId, sellerId });
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const orderAmount = Number(amount);
  if (isNaN(orderAmount)) {
    console.error('Invalid amount for order:', amount);
    return res.status(400).json({ message: 'Invalid amount' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO orders (id, buyerId, buyerName, bookId, bookTitle, sellerId, sellerName, amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Requested')
    `);
    stmt.run(id, buyerId, buyerName, bookId, bookTitle, sellerId, sellerName || 'Verified Seller', orderAmount);
    
    res.json({ id, status: 'Requested' });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating request in database' });
  }
});

app.get('/api/orders', (req, res) => {
  const { buyerId, sellerId } = req.query;
  let sql = 'SELECT * FROM orders WHERE 1=1';
  const params: any[] = [];

  if (buyerId) {
    sql += ' AND buyerId = ?';
    params.push(buyerId);
  }
  if (sellerId) {
    sql += ' AND sellerId = ?';
    params.push(sellerId);
  }

  sql += ' ORDER BY createdAt DESC';
  const orders = db.prepare(sql).all(...params);
  res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ message: 'Request not found' });
  res.json(order);
});

app.patch('/api/orders/:id', (req, res) => {
  const { status } = req.body;
  try {
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    
    if (status === 'Approved') {
      const order = db.prepare('SELECT bookId FROM orders WHERE id = ?').get(req.params.id) as any;
      const book = db.prepare('SELECT quantity FROM books WHERE id = ?').get(order.bookId) as any;
      
      const newQuantity = Math.max(0, (book.quantity || 1) - 1);
      const newStatus = newQuantity === 0 ? 'Sold Out' : 'Available';
      
      db.prepare('UPDATE books SET quantity = ?, status = ? WHERE id = ?').run(newQuantity, newStatus, order.bookId);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error updating request' });
  }
});

// --- MESSAGE ROUTES ---

app.get('/api/messages/:orderId', (req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM messages WHERE orderId = ? ORDER BY createdAt ASC').all(req.params.orderId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

app.post('/api/messages', (req, res) => {
  const { orderId, senderId, text } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  try {
    db.prepare('INSERT INTO messages (id, orderId, senderId, text) VALUES (?, ?, ?, ?)').run(id, orderId, senderId, text);
    res.json({ id, orderId, senderId, text, createdAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// --- VITE INTEGRATION ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
