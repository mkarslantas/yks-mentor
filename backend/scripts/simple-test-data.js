const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database.db'));

console.log('📊 Basit test verileri ekleniyor...');

// Demo kullanıcı ID = 1 (seed script'ten biliyoruz)
const studentId = 1;

// Mevcut verileri temizle
db.run('DELETE FROM study_records WHERE student_id = ?', [studentId]);
db.run('DELETE FROM mock_exams WHERE student_id = ?', [studentId]);

// Son 15 günlük çalışma kayıtları
const subjects = ['matematik', 'fizik', 'kimya', 'biyoloji', 'turkce'];
let insertCount = 0;
const totalRecords = 15 * 3; // 15 gün x 3 ders

for (let i = 14; i >= 0; i--) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split('T')[0];
  
  // Her gün 3 dersten çalışma
  for (let j = 0; j < 3; j++) {
    const subject = subjects[j];
    const duration = 60 + Math.random() * 120; // 60-180 dakika
    const questions = Math.floor(20 + Math.random() * 40); // 20-60 soru
    const correct = Math.floor(questions * (0.6 + Math.random() * 0.3)); // %60-90
    const remaining = questions - correct;
    const wrong = Math.floor(remaining * 0.7);
    const empty = remaining - wrong;
    
    db.run(`
      INSERT INTO study_records 
      (student_id, date, subject, topic, duration_minutes, questions_solved, 
       correct_answers, wrong_answers, empty_answers, notes, mood)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      studentId, dateStr, subject, `${subject} konuları`, 
      Math.floor(duration), Math.floor(questions), correct, wrong, empty,
      `${dateStr} ${subject} çalışması`, ['motivated', 'normal', 'tired', 'stressed'][Math.floor(Math.random() * 4)]
    ], function(err) {
      if (err) {
        console.error('Study record error:', err);
      } else {
        insertCount++;
        if (insertCount === totalRecords) {
          console.log(`✅ ${insertCount} çalışma kaydı eklendi`);
          addMockExams();
        }
      }
    });
  }
}

// Deneme sınavları ekle
function addMockExams() {
  let examCount = 0;
  const totalExams = 6; // 6 deneme sınavı
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7)); // Haftada bir
    const dateStr = date.toISOString().split('T')[0];
    
    const examType = 'TYT';
    const improvement = (5 - i) * 0.1; // Zamanla gelişim
    
    const turkce_net = Math.min(40, Math.floor((10 + Math.random() * 15) * (1 + improvement)));
    const matematik_net = Math.min(30, Math.floor((8 + Math.random() * 15) * (1 + improvement)));
    const sosyal_net = Math.min(15, Math.floor((5 + Math.random() * 8) * (1 + improvement)));
    const fen_net = Math.min(15, Math.floor((4 + Math.random() * 8) * (1 + improvement)));
    const tyt_score = 150 + (turkce_net + matematik_net + sosyal_net + fen_net) * 8;
    
    db.run(`
      INSERT INTO mock_exams 
      (student_id, exam_type, exam_date, exam_name, turkce_net, matematik_net, 
       sosyal_net, fen_net, tyt_score, ranking, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      studentId, examType, dateStr, `TYT Denemesi ${6-i}`,
      turkce_net, matematik_net, sosyal_net, fen_net, Math.floor(tyt_score),
      Math.floor(Math.random() * 50000) + 10000, `${dateStr} deneme sınavı`
    ], function(err) {
      if (err) {
        console.error('Mock exam error:', err);
      } else {
        examCount++;
        if (examCount === totalExams) {
          console.log(`✅ ${examCount} deneme sınavı kaydı eklendi`);
          console.log('🎉 Tüm test verileri başarıyla eklendi!');
          db.close();
        }
      }
    });
  }
}