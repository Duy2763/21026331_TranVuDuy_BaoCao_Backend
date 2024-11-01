const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const connection = require('./db');
const path = require('path');
const cors = require('cors');


app.use(cors());
app.use(bodyParser.json());
app.use('/assets/products', express.static(path.join(__dirname, 'assets/products')));

// Configure multer for file uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage: storage });

app.post('/accounts', (req, res) => {
    console.log('Request body:', req.body); // Log the request body
    const { name, password } = req.body;
    const query = "INSERT INTO account (name, password) VALUES (?, ?)";
    connection.query(query, [name, password], (err, result) => {
        if (err) {
            console.error('Error inserting account:', err); // Log the error
            res.status(500).send('Error inserting account');
            return;
        }
        res.status(201).send('Account created successfully');
    });
});


app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Lấy danh sách tài khoản
app.get('/accounts', (req, res) => {
    const query = "SELECT * FROM account";
    connection.query(query, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

// app.get('/products', (req, res) => {
//     const { categoryId, attribute } = req.query;
//     let query = `
//         SELECT p.name, p.url , p.price, p.id
//         FROM products p
//         JOIN categories c ON p.category_id = c.id
//         JOIN product_attributes pa ON p.id = pa.product_id
//         WHERE c.id = ?
//     `;
//     const params = [categoryId];

//     if (attribute) {
//         query += ' AND pa.attribute_type = ?';
//         params.push(attribute);
//     }

//     connection.query(query, params, (err, results) => {
//         if (err) throw err;
//         res.json(results);
//     });
// });
app.get('/products', (req, res) => {
    const { categoryId } = req.query;
    let query = `
        SELECT p.name, p.url , p.price, p.id, p.category_id, pa.attribute_type
        FROM products p
        JOIN categories c ON p.category_id = c.id
        JOIN product_attributes pa ON p.id = pa.product_id
        WHERE c.id = ?
    `;
    connection.query(query, [categoryId], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});


app.patch('/accounts/:id/password', (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ error: 'New password is required' });
    }

    const checkQuery = "SELECT * FROM account WHERE id = ?";
    connection.query(checkQuery, [id], (err, results) => {
        if (err) {
            console.error('Error checking account:', err);
            return res.status(500).json({ error: 'Error checking account' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const updateQuery = "UPDATE account SET password = ? WHERE id = ?";
        connection.query(updateQuery, [newPassword, id], (err, result) => {
            if (err) {
                console.error('Error updating password:', err);
                return res.status(500).json({ error: 'Error updating password' });
            }

            res.json({ message: 'Password updated successfully' });
        });
    });
});


app.get('/accounts/login', (req, res) => {
    const { name, password } = req.query;
    console.log(`Received login request for name: ${name}, password: ${password}`); // Ghi nhật ký
    const query = "SELECT * FROM account WHERE name = ? AND password = ?";
    connection.query(query, [name, password], (err, result) => {
        if (err) {
            console.error('Error fetching account:', err);
            return res.status(500).json({ error: 'Error fetching account' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        res.json(result[0]);
    });
});




app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
