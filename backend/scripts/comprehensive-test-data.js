const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database.db'));

console.log('📚 Kapsamlı test verileri ekleniyor...');

const studentId = 1;

// Tüm YKS dersleri
const tytSubjects = ['matematik', 'turkce', 'fizik', 'kimya', 'biyoloji', 'tarih', 'cografya', 'felsefe'];
const aytSubjects = ['matematik', 'fizik', 'kimya', 'biyoloji', 'edebiyat', 'tarih', 'cografya'];

// Mevcut verileri temizle
db.run('DELETE FROM study_records WHERE student_id = ?', [studentId]);
db.run('DELETE FROM mock_exams WHERE student_id = ?', [studentId]);

console.log('🗑️ Mevcut veriler temizlendi');

// Son 60 günlük çalışma kayıtları
let insertCount = 0;
const totalRecords = 60 * 4; // 60 gün x 4 ders

for (let i = 59; i >= 0; i--) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split('T')[0];
  
  // Her gün 3-5 dersten çalışma
  const todaySubjectsCount = Math.floor(Math.random() * 3) + 3; // 3-5 ders
  const todaySubjects = [...tytSubjects].sort(() => 0.5 - Math.random()).slice(0, todaySubjectsCount);
  
  for (const subject of todaySubjects) {
    // Zamanla gelişim gösterecek şekilde veri
    const progressFactor = 1 + (59 - i) * 0.01; // %1'lik günlük gelişim
    
    const duration = Math.floor((45 + Math.random() * 90) * progressFactor); // 45-135 dakika
    const questions = Math.floor((15 + Math.random() * 35) * progressFactor); // 15-50 soru
    const baseAccuracy = 0.55 + (subject === 'matematik' ? 0.1 : 0) + Math.random() * 0.25; // %55-80 başarı
    const correct = Math.min(questions, Math.floor(questions * (baseAccuracy * progressFactor)));
    const remaining = questions - correct;
    const wrong = Math.max(0, Math.floor(remaining * 0.7));
    const empty = Math.max(0, remaining - wrong);
    
    db.run(`
      INSERT INTO study_records 
      (student_id, date, subject, topic, duration_minutes, questions_solved, 
       correct_answers, wrong_answers, empty_answers, notes, mood)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      studentId, dateStr, subject, `${subject} konuları`, 
      duration, questions, correct, wrong, empty,
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

// Deneme sınavları ekle (hem TYT hem AYT)
function addMockExams() {
  let examCount = 0;
  const totalExams = 16; // 8 TYT + 8 AYT
  
  // TYT sınavları (son 8 hafta)
  for (let i = 7; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7)); // Haftada bir
    const dateStr = date.toISOString().split('T')[0];
    
    const examType = 'TYT';
    const improvement = (7 - i) * 0.12; // Zamanla gelişim
    
    // TYT net hesaplamaları (database kısıtlarına uygun)
    const turkce_net = Math.max(0, Math.min(40, Math.floor((8 + Math.random() * 12) * (1 + improvement))));
    const matematik_net = Math.max(0, Math.min(30, Math.floor((6 + Math.random() * 14) * (1 + improvement))));
    const sosyal_net = Math.max(0, Math.min(15, Math.floor((4 + Math.random() * 8) * (1 + improvement))));
    const fen_net = Math.max(0, Math.min(15, Math.floor((3 + Math.random() * 9) * (1 + improvement))));
    const tyt_score = 150 + (turkce_net + matematik_net + sosyal_net + fen_net) * 8;
    
    db.run(`
      INSERT INTO mock_exams 
      (student_id, exam_type, exam_date, exam_name, turkce_net, matematik_net, 
       sosyal_net, fen_net, tyt_score, ranking, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      studentId, examType, dateStr, `TYT Denemesi ${8-i}`,
      turkce_net, matematik_net, sosyal_net, fen_net, Math.floor(tyt_score),
      Math.floor(Math.random() * 80000) + 20000, `${dateStr} TYT denemesi`
    ], function(err) {
      if (err) {
        console.error('TYT exam error:', err);
      } else {
        examCount++;
        if (examCount === totalExams) {
          console.log(`✅ ${totalExams} deneme sınavı kaydı eklendi (8 TYT + 8 AYT)`);
          console.log('🎉 Tüm kapsamlı test verileri başarıyla eklendi!');
          showStats();
        }
      }
    });
  }
  
  // AYT sınavları (son 8 hafta)
  for (let i = 7; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7 + 3)); // TYT'den 3 gün sonra
    const dateStr = date.toISOString().split('T')[0];
    
    const examType = 'AYT';
    const improvement = (7 - i) * 0.1;
    
    // AYT net hesaplamaları
    const edebiyat_net = Math.max(0, Math.min(24, Math.floor((8 + Math.random() * 14) * (1 + improvement))));
    const matematik_ayt_net = Math.max(0, Math.min(40, Math.floor((12 + Math.random() * 20) * (1 + improvement))));
    const fizik_net = Math.max(0, Math.min(14, Math.floor((4 + Math.random() * 9) * (1 + improvement))));
    const kimya_net = Math.max(0, Math.min(13, Math.floor((3 + Math.random() * 9) * (1 + improvement))));
    const biyoloji_net = Math.max(0, Math.min(13, Math.floor((3 + Math.random() * 9) * (1 + improvement))));
    const tarih_net = Math.max(0, Math.min(10, Math.floor((2 + Math.random() * 7) * (1 + improvement))));
    const cografya_net = Math.max(0, Math.min(6, Math.floor((1 + Math.random() * 4) * (1 + improvement))));
    
    const ayt_score = 80 + (edebiyat_net + matematik_ayt_net + fizik_net + kimya_net + biyoloji_net + tarih_net + cografya_net) * 6;
    
    db.run(`
      INSERT INTO mock_exams 
      (student_id, exam_type, exam_date, exam_name, edebiyat_net, matematik_ayt_net, 
       fizik_net, kimya_net, biyoloji_net, tarih_net, cografya_net, ayt_score, ranking, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      studentId, examType, dateStr, `AYT Denemesi ${8-i}`,
      edebiyat_net, matematik_ayt_net, fizik_net, kimya_net, biyoloji_net, 
      tarih_net, cografya_net, Math.floor(ayt_score),
      Math.floor(Math.random() * 60000) + 15000, `${dateStr} AYT denemesi`
    ], function(err) {
      if (err) {
        console.error('AYT exam error:', err);
      } else {
        examCount++;
        if (examCount === totalExams) {
          console.log(`✅ ${totalExams} deneme sınavı kaydı eklendi (8 TYT + 8 AYT)`);
          console.log('🎉 Tüm kapsamlı test verileri başarıyla eklendi!');
          showStats();
        }
      }
    });
  }
}

// İstatistikleri göster
function showStats() {
  db.get('SELECT COUNT(*) as count FROM study_records WHERE student_id = ?', [studentId], (err, row) => {
    if (!err) console.log(`📚 Toplam çalışma kaydı: ${row.count}`);
  });
  
  db.get('SELECT COUNT(*) as count FROM mock_exams WHERE student_id = ?', [studentId], (err, row) => {
    if (!err) console.log(`📝 Toplam deneme sınavı: ${row.count}`);
  });
  
  db.all('SELECT subject, COUNT(*) as count FROM study_records WHERE student_id = ? GROUP BY subject', [studentId], (err, rows) => {
    if (!err) {
      console.log('\n📖 Dersler:');
      rows.forEach(row => console.log(`  ${row.subject}: ${row.count} kayıt`));
    }
    db.close();
  });
}