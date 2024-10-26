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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
