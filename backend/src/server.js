const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "../.env")
});

const app = require("./app.js");
const connectDB = require("./config/database.js");
const PORT = process.env.PORT;

connectDB();

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})