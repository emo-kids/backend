CREATE DATABASE emokids;

CREATE TABLE emotions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sid VARCHAR(184) NOT NULL,
  angry DOUBLE NOT NULL,
  sad DOUBLE NOT NULL,
  surprised DOUBLE NOT NULL,
  happy DOUBLE NOT NULL,
  timestamp TIMESTAMP NOT NULL
);

SELECT (angry+sad+surprised+happy)/4
FROM (
  SELECT sid, angry, sad, surprised, happy, MAX(timestamp)
  FROM emotions
  GROUP BY sid
  ) as average;