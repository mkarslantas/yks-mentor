const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'));

// Test kullanıcısı ID'si (genellikle 1)
const STUDENT_ID = 1;

// Son 30 günlük çalışma kayıtları ekle
function addStudyRecords() {
  return new Promise((resolve, reject) => {
    const subjects = ['matematik', 'fizik', 'kimya', 'biyoloji', 'turkce'];
    const records = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Her gün 2-3 farklı dersten çalışma
      const subjectsToday = subjects.slice(0, Math.floor(Math.random() * 3) + 2);
      
      subjectsToday.forEach(subject => {
        const duration = Math.floor(Math.random() * 120) + 30; // 30-150 dakika
        const questions = Math.floor(Math.random() * 50) + 10; // 10-60 soru
        const correct = Math.floor(questions * (0.6 + Math.random() * 0.3)); // %60-90 doğru
        const wrong = Math.floor((questions - correct) * 0.8); // Yanlışların %80'i
        const empty = questions - correct - wrong;
        
        records.push([
          STUDENT_ID,
          dateStr,
          subject,
          `${subject} konuları`,
          duration,
          questions,
          correct,
          wrong,
          empty,
          `${dateStr} tarihinde ${subject} çalışması`,
          Math.floor(Math.random() * 5) + 1 // mood 1-5
        ]);
      });
    }
    
    const query = `
      INSERT INTO study_records 
      (student_id, date, subject, topic, duration_minutes, questions_solved, 
       correct_answers, wrong_answers, empty_answers, notes, mood)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    let completed = 0;
    records.forEach(record => {
      db.run(query, record, (err) => {
        if (err) {
          console.error('Study record insert error:', err);
          return reject(err);
        }
        completed++;
        if (completed === records.length) {
          console.log(`${records.length} çalışma kaydı eklendi`);
          resolve();
        }
      });
    });
  });
}

// Son 3 aylık deneme sınavı kayıtları ekle
function addMockExams() {
  return new Promise((resolve, reject) => {
    const examTypes = ['tyt', 'ayt', 'tyt_ayt'];
    const exams = [];
    
    for (let i = 90; i >= 0; i -= 7) { // Haftada bir deneme
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const examType = examTypes[Math.floor(Math.random() * examTypes.length)];
      
      // Net skorları (zamanla gelişim gösterecek şekilde)
      const improvement = (90 - i) / 90 * 0.3; // %30 gelişim
      const basePerformance = 0.5 + improvement;
      
      const turkce_net = Math.max(0, Math.min(40, Math.floor((25 + Math.random() * 15) * basePerformance)));
      const matematik_net = Math.max(0, Math.min(40, Math.floor((20 + Math.random() * 20) * basePerformance)));
      const sosyal_net = Math.max(0, Math.min(20, Math.floor((12 + Math.random() * 8) * basePerformance)));
      const fen_net = Math.max(0, Math.min(20, Math.floor((10 + Math.random() * 10) * basePerformance)));
      
      let aytNets = {};
      if (examType === 'ayt' || examType === 'tyt_ayt') {
        aytNets = {
          edebiyat_net: Math.max(0, Math.min(24, Math.floor((15 + Math.random() * 9) * basePerformance))),
          matematik_ayt_net: Math.max(0, Math.min(40, Math.floor((25 + Math.random() * 15) * basePerformance))),
          fizik_net: Math.max(0, Math.min(14, Math.floor((8 + Math.random() * 6) * basePerformance))),
          kimya_net: Math.max(0, Math.min(13, Math.floor((7 + Math.random() * 6) * basePerformance))),
          biyoloji_net: Math.max(0, Math.min(13, Math.floor((7 + Math.random() * 6) * basePerformance))),
          tarih_net: Math.max(0, Math.min(10, Math.floor((6 + Math.random() * 4) * basePerformance))),
          cografya_net: Math.max(0, Math.min(6, Math.floor((3 + Math.random() * 3) * basePerformance)))
        };
      }
      
      const tyt_score = Math.floor(200 + (turkce_net + matematik_net + sosyal_net + fen_net) * 8);
      const ayt_score = examType !== 'tyt' ? Math.floor(100 + Object.values(aytNets).reduce((a, b) => a + b, 0) * 5) : null;
      
      exams.push([
        STUDENT_ID,
        examType,
        dateStr,
        `${examType.toUpperCase()} Denemesi ${Math.floor(i/7) + 1}`,
        turkce_net,
        matematik_net,
        sosyal_net,
        fen_net,
        aytNets.edebiyat_net || null,
        aytNets.matematik_ayt_net || null,
        aytNets.fizik_net || null,
        aytNets.kimya_net || null,
        aytNets.biyoloji_net || null,
        aytNets.tarih_net || null,
        aytNets.cografya_net || null,
        tyt_score,
        ayt_score,
        Math.floor(Math.random() * 50000) + 10000, // ranking
        `${dateStr} deneme sınavı notları`
      ]);
    }
    
    const query = `
      INSERT INTO mock_exams 
      (student_id, exam_type, exam_date, exam_name, turkce_net, matematik_net, 
       sosyal_net, fen_net, edebiyat_net, matematik_ayt_net, fizik_net, 
       kimya_net, biyoloji_net, tarih_net, cografya_net, tyt_score, 
       ayt_score, ranking, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    let completed = 0;
    exams.forEach(exam => {
      db.run(query, exam, (err) => {
        if (err) {
          console.error('Mock exam insert error:', err);
          return reject(err);
        }
        completed++;
        if (completed === exams.length) {
          console.log(`${exams.length} deneme sınavı kaydı eklendi`);
          resolve();
        }
      });
    });
  });
}

async function main() {
  try {
    console.log('Test verileri ekleniyor...');
    await addStudyRecords();
    await addMockExams();
    console.log('Tüm test verileri başarıyla eklendi!');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    db.close();
  }
}

main();