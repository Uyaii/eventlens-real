import express, { json } from "express";
import dotenv from "dotenv";
import supabase from "./connectDB.js";
import cors from 'cors'



const app = express();
app.use(json());
app.use(cors())
dotenv.config();

const port = process.env.PORT || 3000;
const startServer = async () => {
  try {
    app.listen(port, () => {
      console.log(`App Connected and Running on port ${port}`);
    });
    const { data, error } = await supabase.from("tenants").select("*");
    if (data) {
      console.log(`Database connected`);
    } else {
      return console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
};

startServer();
