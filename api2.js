const express = require('express');
const db = require('./connection');

const app = express();
const port = 3000;

app.use(express.json());

// FUNGSI RUNSQL UNTUK SETIAP END POINT 

async function runSQL(sql, params = []) {
    try {
        const [results] = await db.execute(sql, params);
        return results;
    } catch (err) {
        throw err;  
    }
}


// INI TAMPIL SEMUA DATA
app.get('/products', async (req, res) => {
    const sql = 'SELECT * FROM products';
    try {
        const [results] = await runSQL(sql);
        res.status(200).json({
            status: 'success',
            message: 'Data produk berhasil diambil',
            data: results
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan saat mengambil data produk',
            error: error.message
        });
    }
});

// INI TAMPIL DATA BERDASARKAN ID
app.get('/products/:id', async (req, res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM products WHERE id = ?';
    try {
        const [result] = await runSQL(sql,[productId]);

        if (result.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Produk tidak ditemukan'
            });
        } else {
            res.status(200).json({
                status: 'success',
                message: 'Produk berhasil ditemukan',
                data: result[0]
            });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan saat mengambil produk',
            error: error.message
        });
    }
});

// INI TAMBAH DATA
app.post('/products', async (req, res) => {
    const { name, price, is_active, createby } = req.body;
    const createdate = new Date();
  
    // Validations (unchanged)
  
    const sql = 'INSERT INTO products (name, price, is_active, createdate, createby) VALUES (?, ?, ?, ?, ?)';
    try {
      const results = await runSQL(sql, [name, price, is_active, createdate, createby]);
      // Assuming result is the first element of the returned array (result[0])
      res.status(201).json({
        status: 'success',
        message: 'Produk berhasil ditambahkan',
        data: {
          id: results.insertId, // Assuming result has an insertId property
          name,
          price,
          is_active,
          createdate,
          createby
        }
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan saat menambahkan produk',
        error: error.message
      });
    }
  });

// INI EDIT DATA
app.put('/products/:id', async (req, res) => {
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

    sql = 'UPDATE products SET name = ?, price = ?, is_active = ?, updatedate = ?, updateby = ? WHERE id = ?';
    try {
        const [result] = await runSQL(sql,[name, price, is_active, updatedate, updateby, productId]);
        
        if (result.affectedRows === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Produk tidak ditemukan'
            });
        } else {
            res.status(200).json({
                status: 'success',
                message: 'Produk berhasil diperbarui'
            });
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan saat memperbarui produk',
            error: error.message
        });
    }
});


// INI HAPUS DATA
app.delete('/products/:id', async (req, res) => {
    const productId = req.params.id;
    sql = 'DELETE FROM products WHERE id = ?';
    try {
        const [result] = await runSQL (sql,[productId]);
        if (result.affectedRows === 0) {
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
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan saat menghapus produk',
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});