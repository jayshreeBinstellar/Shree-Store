// const pool = require('../db');

// async function createTrigger() {
//     try {
//         console.log('Creating coupon usage trigger...');

//         const client = await pool.connect();
//         try {
//             await client.query('BEGIN');

//             // 1. Create the function
//             await client.query(`
//                 CREATE OR REPLACE FUNCTION update_coupon_usage() RETURNS TRIGGER AS $$
//                 BEGIN
//                     IF NEW.coupon_id IS NOT NULL THEN
//                         UPDATE coupons SET used_count = used_count + 1 WHERE coupon_id = NEW.coupon_id;
//                     END IF;
//                     RETURN NEW;
//                 END;
//                 $$ LANGUAGE plpgsql;
//             `);

//             // 2. Drop existing trigger if any
//             await client.query(`
//                 DROP TRIGGER IF EXISTS trigger_update_coupon_usage ON orders;
//             `);

//             // 3. Create the trigger
//             await client.query(`
//                 CREATE TRIGGER trigger_update_coupon_usage
//                 AFTER INSERT ON orders
//                 FOR EACH ROW
//                 EXECUTE FUNCTION update_coupon_usage();
//             `);

//             await client.query('COMMIT');
//             console.log('Trigger created successfully.');
//         } catch (error) {
//             await client.query('ROLLBACK');
//             throw error;
//         } finally {
//             client.release();
//         }

//     } catch (error) {
//         console.error('Error creating trigger:', error);
//     } finally {
//         await pool.end();
//     }
// }

// createTrigger();
