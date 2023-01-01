const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const { response } = require("express");
require("colors");

const app = express();

// middleware
app.use(express.json());
app.use(cors());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function dbConnect() {
  try {
    await client.connect();
    console.log("Database Connected".yellow.italic);
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
}
dbConnect();

const productCollection = client.db("foodPanda").collection("products");
const userCollection = client.db("foodPanda").collection("users");

//endpoints
// create product using this endpoint
app.post("/product", async (req, res) => {
  try {
    const result = await productCollection.insertOne(req.body);

    if (result.insertedId) {
      res.send({
        success: true,
        message: `successfully created the ${req.body.name} with id ${result.insertedId}`,
      });
    } else {
      res.send({
        success: false,
        message: "Couldn't create the product",
      });
    }
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);

    res.send({
      success: false,
      error: error.message,
    });
  }
});

//get product using this endpoint
app.get("/product", async (req, res) => {
  try {
    const product = await productCollection.find({}).toArray();
    // const product = await cursor.toArray()
    res.send({
      success: true,
      message: "Successfully Got The Data",
      data: product,
    });
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// delete data from the database
app.delete("/product/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await productCollection.findOne({ _id: ObjectId(id) });

    if (!product?._id) {
      res.send({
        success: false,
        error: "Product Doesn't exist",
      });
      return;
    }

    const result = await productCollection.deleteOne({ _id: ObjectId(id) });

    if (result.deletedCount) {
      res.send({
        success: true,
        message: `Successfully Deleted The ${product.name}`,
      });
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.get("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productCollection.findOne({ _id: ObjectId(id) });
    res.send({
      success: true,
      data: product,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});


// update product
app.patch("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await productCollection.updateOne(
      { _id: ObjectId(id) },
      { $set: req.body }
    );

    if (result.modifiedCount) {
      res.send({
        success: true,
        message: `Successfully edited ${req.body.name}`,
      });
    }else{
      res.send({
        success: false,
        error: error.message
      })
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.listen(5000, () => console.log("Server up and running".cyan.bold));
