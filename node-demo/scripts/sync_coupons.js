// const pool = require('../db');

// async function syncCouponCounts() {
//     try {
//         console.log('Starting coupon usage count sync...');

//         const query = `
//             UPDATE coupons c
//             SET used_count = (
//                 SELECT COUNT(*)
//                 FROM orders o
//                 WHERE o.coupon_id = c.coupon_id
//             );
//         `;

//         const result = await pool.query(query);
//         console.log(`Synced coupon counts. Rows affected: ${result.rowCount}`);

//         // Verify some data
//         const verification = await pool.query(`
//             SELECT c.code, c.used_count, COUNT(o.order_id) as actual_orders
//             FROM coupons c
//             LEFT JOIN orders o ON c.coupon_id = o.coupon_id
//             GROUP BY c.coupon_id
//             limit 5
//         `);
//         console.table(verification.rows);

//     } catch (error) {
//         console.error('Error syncing coupon counts:', error);
//     } finally {
//         await pool.end();
//     }
// }

// syncCouponCounts();
