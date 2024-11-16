const db = require('../database/connection');
const moment = require('moment-timezone');



const getAllPayments = () => {
  const SQLQuery = `select * from payments`

  return db.execute(SQLQuery)
};

const getAllProducts = () => {
    const SQLQuery = `
      SELECT p.*, pd.tgl, pd.price
      FROM products p
      LEFT JOIN product_detail pd ON p.id = pd.productid
    `;
  
    return db.execute(SQLQuery)
      .then(([rows]) => {
        if (!Array.isArray(rows)) {
          return Promise.reject(new Error('Hasil query bukan array'));
        }
  
        const groupedData = rows.reduce((acc, row) => {
          const { id, ...rest } = row;
          console.log(rest)
          acc[id] = acc[id] || {
            id: id,
            name: row.name,
            pricehistory: [],
            is_active: row.is_active,
            createdate: row.createdate,
            createby: row.createby,
            updatedate: row.updatedate,
            updateby: row.updateby
          };
          acc[id].pricehistory.push({ tgl: rest.tgl, price: rest.price });
          return acc;
        }, {});
  
        const products = Object.values(groupedData);
        // products.forEach(product => {
        //     console.log(product);
        //   });
        return products; 
      })
      .catch(error => {
        console.error('Terjadi kesalahan saat mengambil data produk:', error);
        return Promise.reject(error);
      });
  };

// const getProductWithID = (productId) =>{
//     const SQLQuery =`SELECT * FROM products WHERE id = '${productId}'`;

//     return db.execute(SQLQuery);
// };

const getProductWithID = (productId) => {
    const SQLQuery = `
      SELECT a.*, b.tgl, b.price
      FROM products a
      LEFT JOIN product_detail b ON a.id = b.productid where a.id = '${productId}'
      order by b.tgl desc
    `;
  
    return db.execute(SQLQuery)
      .then(([rows]) => {
        if (!Array.isArray(rows)) {
          return Promise.reject(new Error('Hasil query bukan array'));
        }
     
        const groupedData = rows.reduce((acc, row) => {
          const { id, ...rest } = row;
          acc[id] = acc[id] || {
            id: id,
            name: row.name,
            pricehistory: [],
            is_active: row.is_active,
            createdate: row.createdate,
            createby: row.createby,
            updatedate: row.updatedate,
            updateby: row.updateby
          };
          acc[id].pricehistory.push({ tgl: moment.utc(rest.tgl).tz('Asia/Jakarta').format('YYYY-MM-DD'), price: rest.price });
          return acc;
        }, {});
  
        const products = Object.values(groupedData);
        // products.forEach(product => {
        //     console.log(product);
        //   });
        return products; 
      })
      .catch(error => {
        console.error('Terjadi kesalahan saat mengambil data produk:', error);
        return Promise.reject(error); 
      });
  };


const addProduct = (body) =>{
    //const createdate = new Date();

    const SQLQuery =`INSERT INTO products (name, is_active, createdate, createby) VALUES ('${body.name}', ${body.is_active}, now(), '${body.createby}')`;

    //console.log(SQLQuery);
    return db.execute(SQLQuery);
};

const updateProduct = (productId,body) =>{
    //const updatedate = new Date();

    const SQLQuery =`UPDATE products SET name = '${body.name}', price = '${body.price}', is_active = ${body.is_active}, updatedate = now(), updateby = '${body.updateby}' WHERE id = '${productId}'`;

    return db.execute(SQLQuery);
};



const updatePriceHistory = async (productId, body) => {
    try {
        const selectIdQuery = `
            SELECT id AS priceHistoryId
            FROM product_detail
            WHERE productid = ${productId}
            ORDER BY tgl DESC
            LIMIT 1 OFFSET ${body.selectedIndex}
        `;

        const [results] = await db.execute(selectIdQuery);

        if (results.length > 0) {
            const priceHistoryId = results[0].priceHistoryId;

            const updatePriceQuery = `
                UPDATE product_detail
                SET price = ${body.newPrice}
                WHERE id = ${priceHistoryId}
            `;

            await db.execute(updatePriceQuery);

            return {
                status: 'success',
                message: 'Harga produk berhasil diperbarui'
            };
        } else {
            return {
                status: 'error',
                message: 'Riwayat harga dengan selectedIndex yang diberikan tidak ditemukan'
            };
        }
    } catch (error) {
        console.error('Terjadi kesalahan saat memperbarui harga:', error);
        return {
            status: 'error',
            message: 'Terjadi kesalahan internal server'
        };
    }
};

const deleteProduct = (productId) =>{
    
    const SQLQuery =`DELETE FROM products WHERE id = '${productId}'`;

    return db.execute(SQLQuery);
};

module.exports = {
    getAllProducts,
    getProductWithID,
    addProduct,
    updateProduct,
    updatePriceHistory,
    deleteProduct,
    getAllPayments
}