import jwt from "jsonwebtoken"; // Import jsonwebtoken — used to verify JWT tokens attached to requests.

/**
 * Authentication middleware.
 *
 * Protects API routes by checking for a valid JWT token before the route handler runs.
 *
 * @param {object} req  - Express request object. Contains information about the incoming request.
 * @param {object} res  - Express response object. Used to send responses back to the client.
 * @param {function} next - Calls the next middleware or route handler in the chain.
 */
export const auth = (req, res, next) => {
  // 1. Read the 'Authorization' header and strip off a possible Bearer prefix.
  const rawHeader = req.headers["authorization"];

  // 2. Reject immediately if no header was provided.
  if (!rawHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Accept either "Bearer <token>" or the raw token string.
  const token = rawHeader.startsWith("Bearer ")
    ? rawHeader.slice(7)
    : rawHeader;

  // 3. Verify the token using the JWT secret.
  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    // 4. Handle a failed verification.
    if (err) {
      return res.status(401).json({ message: "Failed to authenticate token" });
    }

    // 5. Token is valid — move on.
    next();
  });
};
