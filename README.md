# Blog-API-project

This project is a Blog API built with Express.js. It provides endpoints to manage blog posts, including creating, reading, updating, and deleting posts. The project uses an in-memory data store for sample data and PostgreSQL for persistent storage.

## Features

- **GET /posts**: Retrieve all blog posts.
- **GET /posts/:id**: Retrieve a specific blog post by ID.
- **POST /posts**: Create a new blog post.
- **PATCH /posts/:id**: Update a specific blog post by ID.
- **DELETE /posts/:id**: Delete a specific blog post by ID.

## Setup

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/Blog-API-Project.git
    cd Blog-API-Project
    ```

2. Install dependencies:
    ```sh
    npm install
    ```