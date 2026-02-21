require("dotenv").config();
const express=require("express");
const app=express();
const users=[];

const routes=require("./routes/authRoutes");
const { errorMiddleware } = require("./middlewares/errorMiddleware");

app.use(express.json());
app.use("/",routes);


app.use(errorMiddleware);

app.listen(8080,()=>{
    console.log("Server is listening to port: 8080");
})