const express = require('express');
const db = require('./connection');

const app = express();
const port = 3000;

app.use(express.json());

function runSQL(sql, params) {

try {
    return new Promise((resolve, reject) => {
        db.execute(sql, params, (err, result) => {
            if (err) {
                return reject(err); 
            }
            resolve(result);  
        });
    });
}
    catch (err) {
        throw err;  
    }
}

// INI TAMPIL SEMUA DATA

app.get('/products', (req, res) => {
  db.execute('SELECT * FROM products')
    .then(([results]) => {
      res.status(200).json({
        status: 'success',
        message: 'Data produk berhasil diambil',
        data: results
      });
    })
    .catch(error => {
      console.error('Error fetching products:', error);
      res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan saat mengambil data produk',
        error: error.message
      });
    });
});

// INI TAMPIL DATA BERDASARKAN ID
app.get('/products/:id', (req, res) => {
  const productId = req.params.id;

  return new Promise((resolve, reject) => {
    db.execute('SELECT * FROM products WHERE id = ?', [productId])
      .then(([result]) => {
        if (result.length === 0) {
          reject({
            status: 'error',
            message: 'Produk tidak ditemukan'
          });
        } else {
          resolve({
            status: 'success',
            message: 'Produk berhasil ditemukan',
            data: result[0]
          });
        }
      })
      .catch(error => {
        reject(error);
      });
  })
  .then(data => {
    res.status(200).json(data);
  })
  .catch(error => {
    console.error('Error fetching product:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan saat mengambil produk',
      error: error.message
    });
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

  return new Promise((resolve, reject) => {
    db.execute('INSERT INTO products (name, price, is_active, createdate, createby) VALUES (?, ?, ?, ?, ?)',
      [name, price, is_active, createdate, createby])
      .then(([result]) => {
        resolve({
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
      })
      .catch(error => {
        reject(error);
      });
  })
  .then(data => {
    res.status(201).json(data);
  })
  .catch(error => {
    console.error('Error creating product:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan saat menambahkan produk',
      error: error.message
    });
  });
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

  return new Promise((resolve, reject) => {
    db.execute('UPDATE products SET name = ?, price = ?, is_active = ?, updatedate = ?, updateby = ? WHERE id = ?',
      [name, price, is_active, updatedate, updateby, productId])
      .then(([result]) => {
        if (result.affectedRows === 0) {
          reject({
            status: 'error',
            message: 'Produk tidak ditemukan'
          });
        } else {
          resolve({
            status: 'success',
            message: 'Produk berhasil diperbarui'
          });
        }
      })
      .catch(error => {
        reject(error);
      });
  })
  .then(data => {
    res.status(201).json(data);
  })
  .catch(error => {
    console.error('Error updating product:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan saat memperbarui produk',
      error: error.message
    });
  });
});

// INI HAPUS DATA
app.delete('/products/:id', (req, res) => {
  const productId = req.params.id;

  return new Promise((resolve, reject) => {
    db.execute('DELETE FROM products WHERE id = ?', [productId])
      .then(([result]) => {
        if (result.affectedRows === 0) {
          reject({
            status: 'error',
            message: 'Produk tidak ditemukan'
          });
        } else {
          resolve({
            status: 'success',
            message: 'Produk berhasil dihapus'
          });
        }
      })
      .catch(error => {
        reject(error);
      });
  })
  .then(data => {
    res.status(200).json(data);
  })
  .catch(error => {
    console.error('Error deleting product:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan saat menghapus produk',
      error: error.message
    });
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});