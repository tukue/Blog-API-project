import express from "express";
import bodyParser from "body-parser";
import pgPromise from "pg-promise";
import { config } from 'dotenv';
import pg from 'pg';  
const { Pool } = pg;
config({path: './.env'});

const pgp = pgPromise();
// set up db connection
const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "postgres",
  user: process.env.DB_USER,
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
        client.release(); 
      })
      .catch((error) => {
        console.error('Error creating table:', error);
        client.release(); 
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
    const query = "INSERT INTO blog_posts (title, content, author, date) VALUES ($1, $2, $3, $4) RETURNING *";
    const values = [title, content, author, date];
    const result = await pool.one(query, values); // Replace 'db' with 'pool'
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add post to the database" });
  }
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

//CHALLENGE 1: GET All posts
app.get("/allposts", (req, res) => {
  pool.query('SELECT * FROM blog_posts')
    .then(result => {
      res.json(result.rows);
    })
    .catch(error => {
      console.error('Error retrieving posts from database:', error);
      res.status(500).json({ message: "Failed to retrieve posts from the database" });
    });
});
//CHALLENGE 2: GET a specific post by id
app.get("/posts/:id", (req, res) => {
   // read from db
  const query = "SELECT * FROM blog_posts WHERE id = $1";
  const values = [req.params.id];
  return pool.query(query, values)
    .then(result => {
      if (result.rows.length === 0) {
        res.status(404).json({ message: "Post not found" });
      } else {
        res.json(result.rows[0]);
      }
    })
    .catch(error => {
      console.error('Error retrieving post from database:', error);
      res.status(500).json({ message: "Failed to retrieve post from the database" });
    });

});

//CHALLENGE 3: POST a new post
app.post("/posts/:id", (req, res) => {
  const { title, content, author, date } = req.body;
  const query = "INSERT INTO blog_posts (title, content, author, date) VALUES ($1, $2, $3, $4) RETURNING *";
  const values = [title, content, author, date];
  pool.query(query, values)
    .then(result => {
      res.json(result.rows[0]);
    })
    .catch(error => {
      console.error('Error adding post to database:', error);
      res.status(500).json({ message: "Failed to add post to the database" });
    });
});
//CHALLENGE 4: PATCH a post when you just want to update one parameter
app.patch("/posts/:id", (req, res) => {
  const postId = parseInt(req.params.id);
  const { title, content, author } = req.body;
  const query = "UPDATE blog_posts SET title = $1, content = $2, author = $3 WHERE id = $4 RETURNING *";
  const values = [title, content, author, postId];
  pool.query(query, values)
    .then(result => {
      if (result.rows.length === 0) {
        res.status(404).json({ message: "Post not found" });
      } else {
        res.json(result.rows[0]);
      }
    })
    .catch(error => {
      console.error('Error updating post in database:', error);
      res.status(500).json({ message: "Failed to update post in the database" });
    });
});

//CHALLENGE 5: DELETE a specific post by providing the post id.
app.delete("/posts/:id", (req, res) => {
  const postId = parseInt(req.params.id);
  const query = "DELETE FROM blog_posts WHERE id = $1 RETURNING *";
  const values = [postId];
  pool.query(query, values)
    .then(result => {
      if (result.rows.length === 0) {
        res.status(404).json({ message: "Post not found" });
      } else {
        res.json(result.rows[0]);
      }
    })
    .catch(error => {
      console.error('Error deleting post from database:', error);
      res.status(500).json({ message: "Failed to delete post from the database" });
    });
});

app.listen(port, () => { // Start the server and listen on the specified port
  console.log(`API is running at http://localhost:${port}`);
});