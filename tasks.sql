--Warning 

DROP DATABASE books_app;
CREATE DATABASE books_app;
\c books_app;
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(255),
    isbn NUMERIC,
    image_url VARCHAR(255),
    description TEXT,
    
);

