//require('dotenv').config();
const express = require('express');
//const jwt = require('jsonwebtoken');
const ProductModel = require('./models/productmodel');
const UserModel = require('./models/usermodel');
const { authenticateToken, blacklist, jwt, secretKey } = require('./middleware/auth');


const app = express();
const port = 3000;

app.use(express.json());


//INI LOGIN

app.post('/login', async (req, res) => {
    const { body } = req;
  
    try {
      const [result] = await UserModel.checkLoginCredential(body);
  
      if (result.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'User atau password tidak ditemukan'
        });
      }
       const user = result[0];

       if(user.token){
        return res.status(400).json({
            status: 'error',
            message: 'Anda Sudah Login'
        });
       }
   
      const token = jwt.sign({ userId: user.userid, role: user.role }, secretKey, { expiresIn: '10m' });
    
      await UserModel.updateToken(token,user.userid);

  
      res.status(200).json({
        status: 'success',
        message: 'Berhasil Login',
        token,
        role: result[0].role
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan saat login',
        error: error.message
      });
    }
  });

//   INI LOGOUT
  app.post('/logout', authenticateToken, async (req, res) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
  
    blacklist.push(token);
    console.log(blacklist)
  

    res.status(200).json({
        status: 'success',
        message: 'Logout berhasil. Silakan hapus token dari penyimpanan lokal Anda'
      });
});

// INI TAMPIL SEMUA DATA
app.get('/products',authenticateToken, async (req, res) => {
    try {
        const products = await ProductModel.getAllProducts();
        res.status(200).json({
            status: 'success',
            message: 'Data produk berhasil diambil',
            data: products
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan saat mengambil data produk',
            error: error.message
        });
    }
});

app.get('/payments', authenticateToken, async (req, res) => {
    try {
        const [result] = await ProductModel.getAllPayments();
        res.status(200).json({
            status: 'success',
            message: 'Data payments berhasil diambil',
            data: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan saat mengambil data payments',
            error: error.message
        });
    }
});

// INI TAMPIL DATA BERDASARKAN ID
app.get('/products/:id',authenticateToken, async (req, res) => {
    const productId = req.params.id;
    try {
        //const products = await ProductModel.getAllProducts();
        const result = await ProductModel.getProductWithID(productId);
        if (result.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Produk tidak ditemukan'
            });
        } else {
            res.status(200).json({
                status: 'success',
                message: 'Produk berhasil ditemukan',
                data: result
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan saat mengambil produk',
            error: error.message
        });
    }
});

// INI TAMBAH DATA
app.post('/products',authenticateToken, async (req, res) => {
    const { body } = req;

    console.log(body);

    // Validasi data
    if (!body.name) {
        return res.status(400).json({
            status: 'error',
            message: 'Nama produk tidak boleh kosong'
        });
    }
    if (!body.createby) {
        return res.status(400).json({
            status: 'error',
            message: 'Create By Tidak Boleh Kosong'
        });
    }
    // if (!body.price || isNaN(body.price)) {
    //     return res.status(400).json({
    //         status: 'error',
    //         message: 'Harga produk harus berupa angka'
    //     });
    // }

    try {
        const [result] = await ProductModel.addProduct(body);
        res.status(201).json({
            status: 'success',
            message: 'Produk berhasil ditambahkan',
            data: {
                id: result.insertId,
                ...body
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan saat menambahkan produk',
            error: error.message
        });
    }
});


app.put('/products/:id', authenticateToken, async (req, res) => {
    const productId = req.params.id;
    const { body } = req;

    console.log(body);
  
    if (typeof body.selectedIndex !== 'number' || body.selectedIndex < 0) {
        return res.status(400).json({
            status: 'error',
            message: 'selectedIndex harus berupa angka positif'
        });
    }
    
    if (!body.newPrice) {
      return res.status(400).json({
        status: 'error',
        message: 'selectedIndex dan newPrice harus diisi'
      });
    }
  
    try {
        const result = await ProductModel.updatePriceHistory(productId, body);

        return res.status(result.status === 'success' ? 200 : 404).json(result);
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan internal server'
        });
    }
  });


// INI HAPUS DATA
app.delete('/products/:id', authenticateToken, async (req, res) => {
    const productId = req.params.id;

    try {
        const [result] = await ProductModel.deleteProduct(productId);
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