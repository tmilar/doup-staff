/**
 * Wrapper for async handlers for express.
 *
 * @param {function} fn - the async function to be wrapped.
 * @returns {function(*=, *=, *=): *} - the express handler that will run the async handler and pass errors.
 */
const asyncHandler = fn => (req, res, next) =>
  Promise
    .resolve(fn(req, res, next))
    .catch(next)

module.exports = asyncHandler
