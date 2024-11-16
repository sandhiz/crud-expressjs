const express = require('express');
const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nvp'
});

const app = express();
const port = 3000;

app.use(express.json());

// INI TAMPIL SEMUA DATA
app.get('/products', (req, res) => {
    db.execute('SELECT * FROM products', (err, results) => {
        if (err) {
          console.error('Error fetching products:', err);
          res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan saat mengambil data produk',
            error: err.message
          });
        } else {
          res.status(200).json({
            status: 'success',
            message: 'Data produk berhasil diambil',
            data: results
          });
        }
      });
});

// INI TAMPIL DATA BERDASARKAN ID
app.get('/products/:id', (req, res) => {
  const productId = req.params.id;

  db.execute('SELECT * FROM products WHERE id = ?', [productId], (err, result) => {
    if (err) {
      console.error('Error fetching product:', err);
      res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan saat mengambil produk',
        error: err.message
      });
    } else if (result.length === 0) {
      res.status(404).json({
        status: 'error',
        message :"Produk tidak ditemukan"
      });
    } else {
      res.status(200).json({
        status: 'success',
        message: 'Produk berhasil ditemukan',
        data: result[0]
      });
    }
  });
});

// INI TAMBAH DATA
app.post('/products', (req, res) => {
  const { name, price, is_active, createby } = req.body;
  const createdate = new Date();

 // Validasi data
 if (!name) {
    return res.status(400).json({
        status: 'error',
        message: 'Nama produk tidak boleh kosong'
    });
}
if (!createby) {
    return res.status(400).json({
        status: 'error',
        message: 'Create By Tidak Boleh Kosong'
    });
}
if (!price || isNaN(price)) {
    return res.status(400).json({
        status: 'error',
        message: 'Harga produk harus berupa angka'
    });
}

  db.execute('INSERT INTO products (name, price, is_active, createdate, createby) VALUES (?, ?, ?, ?, ?)',
    [name, price, is_active, createdate, createby], (err, result) => {
      if (err) {
        console.error('Error creating product:', err);
        res.status(500).json({
          status: 'error',
          message: 'Terjadi kesalahan saat menambahkan produk',
          error: err.message
        });
      } else {
        res.status(201).json({
          status: 'success',
          message: 'Produk berhasil ditambahkan',
          data: {
            id: result.insertId,
            name,
            price,
            is_active,
            createdate,
            createby
          }
        });
      }
    }
  );
});

// INI EDIT DATA
app.put('/products/:id', (req, res) => {
  const productId = req.params.id;
  const { name, price, is_active, updateby } = req.body;
  const updatedate = new Date();

  // Validasi data
  if (!name) {
    return res.status(400).json({
        status: 'error',
        message: 'Nama produk tidak boleh kosong'
    });
}
if (!updateby) {
    return res.status(400).json({
        status: 'error',
        message: 'Update By Tidak Boleh Kosong'
    });
}
if (!price || isNaN(price)) {
    return res.status(400).json({
        status: 'error',
        message: 'Harga produk harus berupa angka'
    });
}

  db.execute('UPDATE products SET name = ?, price = ?, is_active = ?, updatedate = ?, updateby = ? WHERE id = ?',
    [name, price, is_active, updatedate, updateby, productId], (err, result) => {
      if (err) {
        console.error('Error updating product:', err);
        res.status(500).json({
          status: 'error',
          message: 'Terjadi kesalahan saat memperbarui produk',
          error: err.message
        });
      } else if (result.affectedRows === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Produk tidak ditemukan'
        });
      } else {
        res.status(201).json({
          status: 'success',
          message: 'Produk berhasil diperbarui'
        });
      }
    }
  );
});

// INI HAPUS DATA
app.delete('/products/:id', (req, res) => {
  const productId = req.params.id;

  db.execute('DELETE FROM products WHERE id = ?', [productId], (err, result) => {
    if (err) {
      console.error('Error deleting product:', err);
      res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan saat menghapus produk',
        error: err.message
      });
    } else if (result.affectedRows === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Produk tidak ditemukan'
        });
    } else {
      res.status(200).json({
        status: 'success',
        message: 'Produk berhasil dihapus'
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});