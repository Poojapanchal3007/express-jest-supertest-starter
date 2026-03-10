import dotenv from "dotenv"; // To load environment variables
dotenv.config();
import app from "./app.js"; // Import the Express app

// Set the port to either the value from .env file or default to 3001
const port = process.env.PORT || 3001;

// Start the server on the specified port
app.listen(port, () => console.log(`Server running on port: ${port}`));