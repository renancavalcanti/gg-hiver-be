GG Hiver

renancavalcanti_db_user
aukO8kTGQc7cGkUy

mongodb+srv://renancavalcanti_db_user:aukO8kTGQc7cGkUy@cluster0.tuzzeep.mongodb.net/?appName=Cluster0



TEST ENDPOINT:

app.get("/", (req, res) => {
    console.log(req);
    //res.send('<h1>some html</h1>');
    return res.json({
        message: "Bonjour!"
    });
});

app.post("/test", (req, res) => {
    return res.json({
        message: "Test works!",
        data: {
            ok: true,
            age: 44
        }
    });
});

LISTEN APP.JS

// app.listen(5000, () => {
//     console.log("Server running....");
// });
