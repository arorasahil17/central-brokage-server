import mongoose from "mongoose";
async function connectDb() {
  try {
    await mongoose.connect(
      "mongodb+srv://arorasahil074:kNd71q8R9soM82Mm@cluster0.7dyklld.mongodb.net/"
    );
    console.log("Connected to database");
  } catch (err) {
    console.log(`Error in connecting with database ${err}`);
  }
}

export default connectDb;
