const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middle ware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mp2awoi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db("taskDb");
    const userCollection = database.collection("user");
    const taskCollection = database.collection("task");

    //   user creating and storing api
    app.post("/api/v1/create-user", async (req, res) => {
      const nwUser = req.body;
      const isExist = await userCollection.findOne({ email: nwUser.email });
      if (isExist) {
        return res.status(201).send({ message: "Email Already exist" });
      }
      const result = await userCollection.insertOne(nwUser);
      res.send(result);
    });

    // api To get user spcific task
    app.get("/api/v1/get-task/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });

    // Api for updating task
    app.patch("/api/v1/update-task/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const updatedTask = req.body;
      console.log(updatedTask);
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          title: updatedTask.title,
          deadline: updatedTask.deadline,
          description: updatedTask.description,
        },
      };

      const result = await taskCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    // Api for updating task tag
    app.put("/api/v1/update-tag/:id", async (req, res) => {
      const id = req.params.id;
      const { tag } = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          tag: tag,
        },
      };

      const result = await taskCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // Api for deleting task
    app.delete("/api/v1/delete-task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });

    // Task create api
    app.post("/api/v1/create-task", async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Task Manegment server is running....");
});

app.listen(port, () => {
  console.log(`Task Manegment Server running on port ${port}`);
});
