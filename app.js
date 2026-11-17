const http = require('http');
const dayjs = require('dayjs');
const {
    getAllStudents,
    getStudentById,
    getStudentsByGrade,
    getAverageAge,
    getGradeDistribution
} = require('./students');

const GRADE_COLOURS = { A: '#11998e', B: '#2563eb', C: '#f59e0b', D: '#ef4444', F: '#6b7280' };

function renderPage(students, avgAge, gradeDistribution) {
    const rows = students.map(s => {
        const comour = GRADE_COLOURS[s.grade] || '#6b7280';
        return `<tr>
        <td>${s.id}</td>
        <td>${s.name}</td>
        <td>${s.age}</td>
        <td><span class="badge" style="background:${colour}">${s.grade}</span></td>
        <td>${s.email}</td>
        </tr>`;
        }).join('');

        return `<!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Student Profile System</title>
        <style>
          :root{--bg:#f1f5f9;--panel:#ffffff;--text:#1c2530;--muted:#64748b;--border:#e228f0;}
          *{box-sizing:border-box;}
          body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:var(--bg);color:var(--text);}
          .hero{background:linear-gradient(135deg,#11998e,#2563eb);color:#fff;padding:40px 24px;text-align:center;}
          .hero h1{margin:0 0 8px;font-size:1.9rem;}
          .hero p{margin:0;opacity:0.9;font-size:0.95rem;}
          .wrap{max-width:900px;margin:-24px auto 40px;padding:0 16px;}
          .card{background:var(--panel);border-radius:12px;box-shadow:0 4px 18px rgba(0,0,0,0.08);padding:24px;}
          .stats{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px;}
          .stat{flex:1;min-width:140px;background:var(--bg);border-radius:10px;padding:14px 16px;}
          .stat .label{font-size:0.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.04em;}
          .stat .value{font-size:1.5rem;font-weight:700;margin-top:2px;}
          table{border-collapse:collapse;width:100%;font-size:0.92rem;}
          th,td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--border);}
          th{color:var(--muted);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.03em;}
          tr:hover td{background:#f8fafc;}
          .badge{display:inline-block;color;#fff;font-weight:600;font-size:0.8rem;padding:2px 10px;border-radius:999px;}
          .footer-note{margin-top:18px;font-size:0.8rem;color:var(--muted);display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;}
          .pg-badge{display:inline-flex;align-items:center;gap:6px;background:#eef2ff;color:#3730a3;padding:3px 10px;border-radius:999px;font-weight:600;}
        </style>
        </head>
        <body>
          <div class="hero">
            <h1>Student Profile System</h1>
            <p>Backed by PostgreSQL Module 6 Onward</p>
          </div>
          <div class="wrap">
            <div class="card">
              <div class="stats">
                <div class="stat"><div class="label">Total Students</div><div class="value">${students.length}</div></div>
                <div class="stat"><div class="label">Average Age</div><div class="value">${avgAge.toFixed(1)}</div></div>
                <div class="stat"><div class="label">Grade A</div><div class="value">${gradeDistribution['A'] || 0}</div></div>
              </div>
              <table>
                <tr><th>ID</th><th>Name</th><th>Age</th><th>Grade</th><th>Email</th></tr>
                ${rows}
              </table>
              <div class="footer-note">
                <span class"pg-badge">&#9679; PostgreSQL</span>
                <span>Server time: $(dayjs().format('YYYY-MM-DD HH:mm:ss')}</span>
              </div>
            </div>
          </div>
        </body>
      </html>`;
}

function createServer() {
    return http.createServer(async (req, res) => {
      try {
        if (req.url === '/' && req.method === 'GET') {
          const students = await getAllStudents();
          const avgAge = await getAverageAge();
          const gradeDistribution = await getGradeDistribution();
          res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.end(renderPage(students, avgAge, gradeDistribution));
       } else if (req.url === '/api/students' && req.method === 'GET') {
          const students = await getAllStudents();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, data: students }));
       } else if (req.url.match(/\/api\/students\/\d+/) && req.method === 'GET') {
          const id = parseInt(req.url.split('/')[3]);
          try {
            const student = await getStudentById(id);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: student }));
          } catch (error) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error:.message }));
          }
       } else if (req.url.match(/\/api\/students\/grade\/[A-F]/) && req.method === 'GET') {
         const grade = req.url.split('/')[4];
         const students = await getStudentsByGrade(grade);
         res.writeHead(200, { 'Content-Type': 'application/json' });
         res.end(JSON.stringify({ success: true, data: students }));
       } else {
         res.writeHead(404, { 'Content-Type': 'text/plain' });
         res.end('Page not found');
       }
     } catch (error) {
         res.writeHead(500, { 'Content-Type': 'application/json' });
         res.end(JSON.stringify({ success: false, error: 'Database error: ' + error.message }));
     }
    });
}

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`Student Profile System (PostgreSQL) running on http://localhost:#{PORT}`);
  });
}

module.exports = { createServer };
