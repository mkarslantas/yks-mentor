const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'));

function addTestData() {
  return new Promise((resolve, reject) => {
    console.log('📊 Chart test verileri ekleniyor...');
    
    // Test kullanıcısının ID'sini al
    db.get('SELECT id FROM users WHERE email = ?', ['student@demo.com'], async (err, user) => {
      if (err) {
        reject(err);
        return;
      }
    
    if (!user) {
      console.error('Demo kullanıcı bulunamadı!');
      return;
    }
    
    const studentId = user.id;
    console.log(`👨‍🎓 Student ID: ${studentId}`);

    // Mevcut verileri temizle
    await database.run('DELETE FROM study_records WHERE student_id = ?', [studentId]);
    await database.run('DELETE FROM mock_exams WHERE student_id = ?', [studentId]);
    
    // Son 30 günlük çalışma kayıtları
    const subjects = ['matematik', 'fizik', 'kimya', 'biyoloji', 'turkce'];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Her gün 2-4 dersten çalışma
      const todaySubjects = subjects.slice(0, Math.floor(Math.random() * 3) + 2);
      
      for (const subject of todaySubjects) {
        // Zamanla gelişim gösterecek şekilde veri
        const progressFactor = 1 + (29 - i) * 0.02; // %2'lik günlük gelişim
        
        const duration = Math.floor((60 + Math.random() * 120) * progressFactor); // 60-180 dakika
        const questions = Math.floor((20 + Math.random() * 40) * progressFactor); // 20-60 soru
        const baseAccuracy = 0.6 + (subject === 'matematik' ? 0.1 : 0) + Math.random() * 0.2; // %60-80 başarı
        const correct = Math.floor(questions * (baseAccuracy * progressFactor));
        const wrong = Math.floor((questions - correct) * 0.7);
        const empty = questions - correct - wrong;
        
        await database.run(`
          INSERT INTO study_records 
          (student_id, date, subject, topic, duration_minutes, questions_solved, 
           correct_answers, wrong_answers, empty_answers, notes, mood)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          studentId, dateStr, subject, `${subject} konuları`, 
          duration, questions, correct, wrong, empty,
          `${dateStr} ${subject} çalışması`, Math.floor(Math.random() * 5) + 1
        ]);
      }
    }
    
    // Son 3 aylık deneme sınavları (haftada bir)
    for (let i = 84; i >= 0; i -= 7) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const examType = Math.random() > 0.5 ? 'tyt' : 'tyt_ayt';
      const weekNumber = Math.floor((84 - i) / 7) + 1;
      
      // Zamanla artan net skorları
      const improvement = (84 - i) / 84 * 0.4; // %40 gelişim
      const basePerformance = 0.4 + improvement;
      
      // TYT Netleri
      const turkce_net = Math.max(0, Math.min(40, Math.floor((15 + Math.random() * 20) * basePerformance)));
      const matematik_net = Math.max(0, Math.min(40, Math.floor((12 + Math.random() * 25) * basePerformance)));
      const sosyal_net = Math.max(0, Math.min(20, Math.floor((8 + Math.random() * 12) * basePerformance)));
      const fen_net = Math.max(0, Math.min(20, Math.floor((6 + Math.random() * 12) * basePerformance)));
      
      let aytData = {};
      if (examType === 'tyt_ayt') {
        aytData = {
          edebiyat_net: Math.max(0, Math.min(24, Math.floor((10 + Math.random() * 14) * basePerformance))),
          matematik_ayt_net: Math.max(0, Math.min(40, Math.floor((15 + Math.random() * 20) * basePerformance))),
          fizik_net: Math.max(0, Math.min(14, Math.floor((5 + Math.random() * 9) * basePerformance))),
          kimya_net: Math.max(0, Math.min(13, Math.floor((4 + Math.random() * 9) * basePerformance))),
          biyoloji_net: Math.max(0, Math.min(13, Math.floor((4 + Math.random() * 9) * basePerformance))),
          tarih_net: Math.max(0, Math.min(10, Math.floor((3 + Math.random() * 7) * basePerformance))),
          cografya_net: Math.max(0, Math.min(6, Math.floor((2 + Math.random() * 4) * basePerformance)))
        };
      }
      
      const tyt_score = Math.floor(150 + (turkce_net + matematik_net + sosyal_net + fen_net) * 8);
      const ayt_score = examType === 'tyt_ayt' ? 
        Math.floor(80 + Object.values(aytData).reduce((a, b) => a + b, 0) * 6) : null;
      
      await database.run(`
        INSERT INTO mock_exams 
        (student_id, exam_type, exam_date, exam_name, turkce_net, matematik_net, 
         sosyal_net, fen_net, edebiyat_net, matematik_ayt_net, fizik_net, 
         kimya_net, biyoloji_net, tarih_net, cografya_net, tyt_score, 
         ayt_score, ranking, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        studentId, examType, dateStr, `${examType.toUpperCase()} Denemesi ${weekNumber}`,
        turkce_net, matematik_net, sosyal_net, fen_net,
        aytData.edebiyat_net || null, aytData.matematik_ayt_net || null,
        aytData.fizik_net || null, aytData.kimya_net || null,
        aytData.biyoloji_net || null, aytData.tarih_net || null,
        aytData.cografya_net || null, tyt_score, ayt_score,
        Math.floor(Math.random() * 100000) + 10000,
        `${dateStr} deneme sınavı notları`
      ]);
    }
    
    console.log('✅ Test verileri başarıyla eklendi!');
    
    // Eklenen veri sayılarını göster
    const studyCount = await database.get('SELECT COUNT(*) as count FROM study_records WHERE student_id = ?', [studentId]);
    const examCount = await database.get('SELECT COUNT(*) as count FROM mock_exams WHERE student_id = ?', [studentId]);
    
    console.log(`📚 ${studyCount.count} çalışma kaydı eklendi`);
    console.log(`📝 ${examCount.count} deneme sınavı kaydı eklendi`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

addTestData();