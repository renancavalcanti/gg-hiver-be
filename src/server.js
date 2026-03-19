const { connectDB } = require("./config/db");
const app = require("./app");

const startServer = async () => {
    try{
        await connectDB();

        app.listen(5000, () => {
            console.log("Server running....");
        });
    }
    catch(error){
        console.error("Failed to start server: ", error);
        process.exit(1);
    }
}

startServer();