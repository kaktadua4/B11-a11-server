const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World! this is athletic hub server side application');
});

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.3tpdxno.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const eventsCollection = client.db('athleticHub').collection('events');
    const bannerCollection = client.db('athleticHub').collection('banner');
    const benefitsCollection = client.db('athleticHub').collection('benefits');
    const userCollection = client.db('athleticHub').collection('user');
    const testimonialsCollection = client.db('athleticHub').collection('testimonials');
    const bookingsCollection = client.db('athleticHub').collection('bookings');

    // Events endpoint
    app.get('/events', async (req, res) => {
      const cursor = eventsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // eventdetails endpoint
    app.get('/events/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const event = await eventsCollection.findOne(query);
      res.send(event);
    });



    // Banner endpoint
    app.get('/banner', async (req, res) => {
      const cursor = bannerCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Benefits endpoint
    app.get('/benefits', async (req, res) => {
      const cursor = benefitsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // testimonials endpoint
    app.get('/testimonials', async (req, res) => {
      const cursor = testimonialsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });


    // User endpoint
    app.get('/user', async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // add a user
    app.post('/user', async (req, res) => {
      try {
        const userData = req.body;

        const existingUser = await userCollection.findOne({ email: userData.email });
        if (existingUser) {
          return res.status(400).send({ error: 'User already exists' });
        }
        const result = await userCollection.insertOne(userData);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to register user' });
      }
    });

    // bookings endpoint
    // add a new booking
    app.post('/bookings', async (req, res) => {
      try {
        const bookingData = req.body;
        if (!bookingData.userId || !bookingData.eventId) {
          return res.status(400).send({ error: 'Missing required fields: userId or eventId' });
        }
        const result = await bookingsCollection.insertOne({
          ...bookingData,
          eventId: new ObjectId(bookingData.eventId), // Convert to ObjectId
          bookingDate: new Date(),
          status: 'confirmed'
        });
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to create booking' });
      }
    })
    // GET all bookings (for debugging/admin)
    app.get('/bookings', async (req, res) => {
      const cursor = bookingsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });


    // get bookings by user email
    app.get('/bookings/:userId', async (req, res) => {
      const userId = req.params.userId;
      const query = { userId: userId };
      const cursor = bookingsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // delete a booking
    app.delete('/bookings/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await bookingsCollection.deleteOne(query);
        if (result.deletedCount === 0) {
          return res.status(404).send({ error: 'Booking not found' });
        }
        res.send({ message: 'Booking deleted successfully' });
      } catch (error) {
        res.status(500).send({ error: 'Failed to delete booking' });
      }
    });


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.listen(port, () => {
      console.log(`Athletic Hub server is running on port: ${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

run().catch(console.dir);