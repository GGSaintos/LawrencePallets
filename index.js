const express = require("express")
const app = express()

app.set("view engine","pug")
app.use(express.static("public"))

require("./routes/routes")(app)

app.listen(3000,()=>{
console.log("E-Huddle running on port 3000")
})