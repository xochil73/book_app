DROP TABLE IF EXISTS books;

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(255),
    isbn VARCHAR(255),
    image_url VARCHAR(255),
    description TEXT 
);


INSERT INTO books (title, author, isbn, image_url, description) 
VALUES('The Shining','Stephen King',9780385528863,'https://www.googleapis.com/books/v1/volumes/8VnJLu3AvvQC','With an excerpt from the sequel, Doctor Sleep. Terrible events occur at an isolated hotel in the off season, when a small boy with psychic powers struggles to hold his own against the forces of evil that are driving his father insane.');

INSERT INTO books (title, author, isbn, image_url, description) 
VALUES('Demons','Fyodor Dostoyevsky',9781773139821,'https://www.googleapis.com/books/v1/volumes/3Nt8DwAAQBAJ','Demons is an anti-nihilistic novel by Fyodor Dostoyevsky. It is the third of the four great novels written by Dostoyevsky after his return from Siberian exile, the others being Crime and Punishment, The Idiot and The Brothers Karamazov. Demons is a social and political satire, a psychological drama, and large scale tragedy.');
