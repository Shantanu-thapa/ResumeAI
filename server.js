require("dotenv").config();

const express = require ("express");
const cors = require("cors");
const app = express();

const connectDB = require("./config/db");
connectDB();



//middleware
app.use(cors());

app.use(express.json());

//route Connection;
const router = require ("./routes/routes")
const resumeRoutes = require("./routes/resumeRoutes")
app.use("/api/v1/auth", router);
app.use("/api/resumes", resumeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT , () => {
    console.log(`App is Running on ${PORT}`);
})

app.get('/',(req,res) => {
    //message by route
    res.json({
        message: "API is running "
    })
});

const aiRoutes = require("./routes/aiRoutes")

app.use("/api/ai", aiRoutes);