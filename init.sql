CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  grade VARCHAR(1) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO students (name, age, grade, email) VALUES
  ('John Doe', 20, 'A', 'john@school.com'),
  ('Jane Smith', 21, 'B', 'jane@school.com');
  ('Mike Johnson', 19, 'A', 'mike@school.com');
  ('Sarah Wilson', 22, 'C', 'sarah@school.com');
CREATE INDEX idx_students_grade ON students(grade);
