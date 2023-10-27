import mongoose from "mongoose";
async function connectDb() {
  try {
    await mongoose.connect(
      "mongodb+srv://arorasahil074:kNd71q8R9soM82Mm@cluster0.7dyklld.mongodb.net/"
    );
    const connection = mongoose.connection;
    connection.on("connected", () => {
      console.log("connected to mongodb");
    });
    connection.on("error", (error) => {
      console.log(`db error ${error}`);
    });
  } catch (err) {
    console.log(`Error in connecting with database ${err}`);
  }
}

export default connectDb;
