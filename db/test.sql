-- PRAGMA foreign_keys=OFF;
-- BEGIN TRANSACTION;
CREATE TABLE users (id integer PRIMARY KEY, username tinytext UNIQUE, hash binary(60), email tinytext UNIQUE);

INSERT INTO users(username, hash, email) VALUES ('Dreaded_X', '$2a$04$n1HDt05pOeT.J4WPffSOmufDWRR1La/M.jVQu/GqDmNzSQyOGjPie', 'tim.huizinga@gmail.com');
INSERT INTO users(username, hash, email) VALUES ('TimHuizinga', '$2a$04$n1HDt05pOeT.J4WPffSOmufDWRR1La/M.jVQu/GqDmNzSQyOGjPie', 'tim@mtgames.nl');

-- COMMIT;
