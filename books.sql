
DROP DATABASE books_app;
CREATE DATABASE books_app;
\c books_app;
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(255),
    isbn NUMERIC,
    image_url VARCHAR(255),
    description VARCHAR(3000)
);

INSERT INTO books (
    title,
    author,
    isbn,
    image_url,
    description
)
VALUES (
    'Think Like a Cat',
    'Pam Johnson-Bennett',
    9781101552674,
    'http://books.google.com/books/content?id=I_oU6Ib9nt8C&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api',
    'America''s favorite cat behavior expert, author of Catwise and Cat vs. Cat, offers the most complete resource for cat owners of all stripes, now fully updated and revised. \"The queen of cat behavior\" - Steve Dale, author of My Pet World Think it''s impossible to train a cat? Think again! By learning how to think like a cat, you''ll be amazed at just how easy it is. Whether you are a veteran cat lover, a brand-new owner of a sweet kitten, or the frustrated companion of a feline whose driving you crazy, Pam Johnson-Bennett will help you understand what makes your cat tick (as well as scratch and purr). Topics range from where to get a cat to securing a vet; from basic health care to treating more serious problems; choosing an inrresistible scratching post and avoiding litterbox problems. A comprehensive guide to cat care and training, she helps you understand the instincts that guide feline behavior. Using behavior modification and play therapy techniques, she shares successful methods that will help you and your cat build a great relationship. From the Trade Paperback edition.'
);

INSERT INTO books (
    title,
    author,
    isbn,
    image_url
    description
)
VALUES (
    'The Behaviour of the Domestic Cat',
    'John W. S. Bradshaw',
    1780641206,
    'http://books.google.com/books/content?id=CMQdnrR0xEsC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    'Describing feline behaviour from both a mechanistic and functional approach, this textbook provides an accessible overview of this fascinating subject. The book begins by addressing physiological, developmental and psychological aspects, with chapters on domestication, the development of the senses, learning, communication and feeding behaviour. The authors then build on this foundation to discuss social behaviour, hunting and predation, cat-human interactions and welfare. Fully updated throughout, this new edition also includes two new chapters on behavioural disorders due to pathologies and.'

);