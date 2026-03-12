//

module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next); // If any error occurs in the async function, it will be caught and passed to the next middleware (error handler)
    };
};
