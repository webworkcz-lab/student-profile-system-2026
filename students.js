const { pool } = require('./db');

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function getAllStudents() {
    const result = await pool.query('SELECT id, name, age, grade, email FROM students ORDER BY id');
    return result.rows;
}

async function getStudentById(id) {
    const result = await pool.query('SELECT id, name, age, grade, email FROM students WHERE id = $1', [id]);
    if (result.rows.length === 0) {
        throw new Error('Student not found');
    }
    return result.rows[0];
}

async function getStudentsByGrade(grade) {
    const result = await pool.query('SELECT id, name, age, grade, email FROM students WHERE grade = $1 ORDER BY id', [grade]);
    return result.rows;
}

async function getAverageAge() {
    const result = await pool.query('SELECT AVG(age) AS avg_age FROM students');
    return result.rows[0].avg_age ? parseFloat(result.rows[0].avg_age) : 0;
}

async function getGradeDistribution() {
    const result = await pool.query('SELECT grade, COUNT(*) AS count FROM students GROUP BY grade ORDER BY grade');
    return result.rows.reduce((acc, row) => {
        acc[row.grade] = parseInt(row.count, 10);
        return acc;
    }, {});
}

async function addStudent(name, age, grade, email) {
    if (!isValidEmail(email)) {
        throw new Error('Invalid email address');
    }
    const result = await pool.query(
        'INSERT INTO students (name, age, grade, email) VALUES ($1, $2, $3, $4) RETURNING id, name, age, grade, email',
        [name, age, grade, email]
    );
    return result.rows[0];
}

async function validateAllEmails() {
    const students = await getAllStudents();
    return students
        .filter(s => !isValidEmail(s.email))
        .map(s => ({ id: s.id, name: s.name, email: s.email}));
}

module.exports = {
    getAllStudents,
    getStudentById,
    getStudentByGrade,
    getAverageAge,
    getGradeDistribution,
    addStudent,
    isValidEmail,
    validateAllEmails
};

