require("dotenv").config({
    path: "../.env"
});

const app = require("./app.js");
const connectDB = require("./config/database.js");
const PORT = process.env.PORT;

connectDB();

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})