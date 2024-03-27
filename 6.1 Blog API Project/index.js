import express from "express";
import bodyParser from "body-parser";
import pgPromise from "pg-promise";
import { config } from 'dotenv';
import pg from 'pg';  
const { Pool } = pg;
config();

// set up db connection
const pgp = pgPromise();
const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "postgres",
  password: process.env.DB_PASSWORD, 

}); 
pool.connect()
  .then(client => {
// Create table in the Postgres database
const createTableQuery=`
  CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL
  )
`;

// Execute the create table query
return client.query(createTableQuery)
  .then(() => {
    console.log('Table "blog_posts" created successfully');
    // You can perform further operations here if needed
    client.release; // 
  })
  .catch((error) => {
    console.error('Error creating table:', error);
    client.release; // 
  });
  }).catch((error) => {
    console.error('Error connecting to the database:', error);
  });

const app = express();
app.use(bodyParser.json());
const port = 4005;
// CHALLENGE 6: Add posts to the database
app.post("/addpost", async (req, res) => {
  try {
    const { title, content, author, date } = req.body;
    const query = "INSERT INTO posts (title, content, author, date) VALUES ($1, $2, $3, $4) RETURNING *";
    const values = [title, content, author, date];
    const result = await db.one(query, values);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add post to the database" });
  }
});
// In-memory data store
let posts = [
  {
    id: 1,
    title: "The Rise of Decentralized Finance",
    content:
      "Decentralized Finance (DeFi) is an emerging and rapidly evolving field in the blockchain industry. It refers to the shift from traditional, centralized financial systems to peer-to-peer finance enabled by decentralized technologies built on Ethereum and other blockchains. With the promise of reduced dependency on the traditional banking sector, DeFi platforms offer a wide range of services, from lending and borrowing to insurance and trading.",
    author: "Alex Thompson",
    date: "2023-08-01T10:00:00Z",
  },
  {
    id: 2,
    title: "The Impact of Artificial Intelligence on Modern Businesses",
    content:
      "Artificial Intelligence (AI) is no longer a concept of the future. It's very much a part of our present, reshaping industries and enhancing the capabilities of existing systems. From automating routine tasks to offering intelligent insights, AI is proving to be a boon for businesses. With advancements in machine learning and deep learning, businesses can now address previously insurmountable problems and tap into new opportunities.",
    author: "Mia Williams",
    date: "2023-08-05T14:30:00Z",
  },
  {
    id: 3,
    title: "Sustainable Living: Tips for an Eco-Friendly Lifestyle",
    content:
      "Sustainability is more than just a buzzword; it's a way of life. As the effects of climate change become more pronounced, there's a growing realization about the need to live sustainably. From reducing waste and conserving energy to supporting eco-friendly products, there are numerous ways we can make our daily lives more environmentally friendly. This post will explore practical tips and habits that can make a significant difference.",
    author: "Samuel Green",
    date: "2023-08-10T09:15:00Z",
  },
];

let lastId = 3;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Write your code here//

//CHALLENGE 1: GET All posts
app.get("/allposts", (req, res) => {
  console.log(posts);
  res.json(posts);
});
//CHALLENGE 2: GET a specific post by id
app.get("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
});

//CHALLENGE 3: POST a new post
app.post("/posts/:id", (req, res) => {
  const newId = Number(req.params.id);
  if (isNaN(newId)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const existingPost = posts.find((p) => p.id === newId);
  if (existingPost) {
    return res.status(409).json({ message: "Post with the same ID already exists" });
  }

  const post = {
    id: newId,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
  };
  posts.push(post);
  res.json(post);
});
//CHALLENGE 4: PATCH a post when you just want to update one parameter
app.patch("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ message: "Post not found" });
  post.title = req.body.title;
  post.content = req.body.content;
  post.author = req.body.author;
  res.json(post);
});

//CHALLENGE 5: DELETE a specific post by providing the post id.
app.delete("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ message: "Post not found" });
  const index = posts.indexOf(post);
  posts.splice(index, 1);
  res.json(post);
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
