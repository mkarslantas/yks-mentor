const database = require('../config/database');
const { formatDate } = require('../utils/helpers');

class MockExam {
  static async create(examData) {
    console.log('MockExam.create called with:', examData);
    const {
      student_id,
      exam_type,
      exam_date,
      exam_name,
      // Net values
      turkce_net,
      matematik_net,
      sosyal_net,
      fen_net,
      edebiyat_net,
      matematik_ayt_net,
      fizik_net,
      kimya_net,
      biyoloji_net,
      tarih_net,
      cografya_net,
      dil_net,
      // Correct/Wrong values
      turkce_correct,
      turkce_wrong,
      matematik_correct,
      matematik_wrong,
      sosyal_correct,
      sosyal_wrong,
      fen_correct,
      fen_wrong,
      edebiyat_correct,
      edebiyat_wrong,
      matematik_ayt_correct,
      matematik_ayt_wrong,
      fizik_correct,
      fizik_wrong,
      kimya_correct,
      kimya_wrong,
      biyoloji_correct,
      biyoloji_wrong,
      tarih_correct,
      tarih_wrong,
      cografya_correct,
      cografya_wrong,
      dil_correct,
      dil_wrong,
      // Scores
      tyt_score,
      ayt_score,
      ranking,
      notes
    } = examData;

    const values = [
      student_id, 
      exam_type, 
      formatDate(exam_date), 
      exam_name || null,
      turkce_net || null, 
      matematik_net || null, 
      sosyal_net || null, 
      fen_net || null,
      edebiyat_net || null, 
      matematik_ayt_net || null, 
      fizik_net || null, 
      kimya_net || null, 
      biyoloji_net || null,
      tarih_net || null, 
      cografya_net || null, 
      dil_net || null,
      turkce_correct || 0, 
      turkce_wrong || 0, 
      matematik_correct || 0, 
      matematik_wrong || 0,
      sosyal_correct || 0, 
      sosyal_wrong || 0, 
      fen_correct || 0, 
      fen_wrong || 0,
      edebiyat_correct || 0, 
      edebiyat_wrong || 0, 
      matematik_ayt_correct || 0, 
      matematik_ayt_wrong || 0,
      fizik_correct || 0, 
      fizik_wrong || 0, 
      kimya_correct || 0, 
      kimya_wrong || 0,
      biyoloji_correct || 0, 
      biyoloji_wrong || 0, 
      tarih_correct || 0, 
      tarih_wrong || 0,
      cografya_correct || 0, 
      cografya_wrong || 0, 
      dil_correct || 0, 
      dil_wrong || 0,
      tyt_score || null, 
      ayt_score || null, 
      ranking || null, 
      notes || null
    ];
    
    console.log('Values array length:', values.length);
    console.log('Values:', values);

    const result = await database.run(`
      INSERT INTO mock_exams (
        student_id, exam_type, exam_date, exam_name,
        turkce_net, matematik_net, sosyal_net, fen_net,
        edebiyat_net, matematik_ayt_net, fizik_net, kimya_net, biyoloji_net,
        tarih_net, cografya_net, dil_net,
        turkce_correct, turkce_wrong, matematik_correct, matematik_wrong,
        sosyal_correct, sosyal_wrong, fen_correct, fen_wrong,
        edebiyat_correct, edebiyat_wrong, matematik_ayt_correct, matematik_ayt_wrong,
        fizik_correct, fizik_wrong, kimya_correct, kimya_wrong,
        biyoloji_correct, biyoloji_wrong, tarih_correct, tarih_wrong,
        cografya_correct, cografya_wrong, dil_correct, dil_wrong,
        tyt_score, ayt_score, ranking, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, values);

    return await this.findById(result.id);
  }

  static async findById(id) {
    return await database.get('SELECT * FROM mock_exams WHERE id = ?', [id]);
  }

  static async findByStudent(studentId, options = {}) {
    let query = 'SELECT * FROM mock_exams WHERE student_id = ?';
    const params = [studentId];

    if (options.examType) {
      query += ' AND exam_type = ?';
      params.push(options.examType);
    }

    if (options.startDate && options.endDate) {
      query += ' AND exam_date BETWEEN ? AND ?';
      params.push(formatDate(options.startDate), formatDate(options.endDate));
    }

    query += ' ORDER BY exam_date DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    return await database.all(query, params);
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id' && key !== 'student_id') {
        if (key === 'exam_date') {
          fields.push(`${key} = ?`);
          values.push(formatDate(updateData[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);

    await database.run(
      `UPDATE mock_exams SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  static async delete(id) {
    const result = await database.run('DELETE FROM mock_exams WHERE id = ?', [id]);
    return result.changes > 0;
  }

  static async getProgress(studentId, examType = null) {
    let query = `
      SELECT 
        exam_date,
        exam_type,
        exam_name,
        turkce_net,
        matematik_net,
        sosyal_net,
        fen_net,
        edebiyat_net,
        matematik_ayt_net,
        fizik_net,
        kimya_net,
        biyoloji_net,
        tarih_net,
        cografya_net,
        tyt_score,
        ayt_score,
        ranking
      FROM mock_exams 
      WHERE student_id = ?
    `;
    const params = [studentId];

    if (examType) {
      query += ' AND exam_type = ?';
      params.push(examType);
    }

    query += ' ORDER BY exam_date';

    return await database.all(query, params);
  }

  static async getLatestExam(studentId, examType) {
    return await database.get(`
      SELECT * FROM mock_exams 
      WHERE student_id = ? AND exam_type = ?
      ORDER BY exam_date DESC
      LIMIT 1
    `, [studentId, examType]);
  }

  static async getAverageNets(studentId, examType, lastNExams = null) {
    let query = `
      SELECT 
        AVG(turkce_net) as avg_turkce,
        AVG(matematik_net) as avg_matematik,
        AVG(sosyal_net) as avg_sosyal,
        AVG(fen_net) as avg_fen,
        AVG(edebiyat_net) as avg_edebiyat,
        AVG(matematik_ayt_net) as avg_matematik_ayt,
        AVG(fizik_net) as avg_fizik,
        AVG(kimya_net) as avg_kimya,
        AVG(biyoloji_net) as avg_biyoloji,
        AVG(tarih_net) as avg_tarih,
        AVG(cografya_net) as avg_cografya,
        COUNT(*) as exam_count
      FROM mock_exams 
      WHERE student_id = ? AND exam_type = ?
    `;
    const params = [studentId, examType];

    if (lastNExams) {
      query = `
        SELECT 
          AVG(turkce_net) as avg_turkce,
          AVG(matematik_net) as avg_matematik,
          AVG(sosyal_net) as avg_sosyal,
          AVG(fen_net) as avg_fen,
          AVG(edebiyat_net) as avg_edebiyat,
          AVG(matematik_ayt_net) as avg_matematik_ayt,
          AVG(fizik_net) as avg_fizik,
          AVG(kimya_net) as avg_kimya,
          AVG(biyoloji_net) as avg_biyoloji,
          AVG(tarih_net) as avg_tarih,
          AVG(cografya_net) as avg_cografya,
          COUNT(*) as exam_count
        FROM (
          SELECT * FROM mock_exams 
          WHERE student_id = ? AND exam_type = ?
          ORDER BY exam_date DESC
          LIMIT ?
        )
      `;
      params.push(lastNExams);
    }

    return await database.get(query, params);
  }

  static async calculateTotalNet(examData) {
    const { exam_type } = examData;
    let totalNet = 0;

    if (exam_type === 'TYT') {
      totalNet = (examData.turkce_net || 0) + 
                 (examData.matematik_net || 0) + 
                 (examData.sosyal_net || 0) + 
                 (examData.fen_net || 0);
    } else if (exam_type === 'AYT') {
      totalNet = (examData.edebiyat_net || 0) + 
                 (examData.matematik_ayt_net || 0) + 
                 (examData.fizik_net || 0) + 
                 (examData.kimya_net || 0) + 
                 (examData.biyoloji_net || 0) + 
                 (examData.tarih_net || 0) + 
                 (examData.cografya_net || 0);
    }

    return Math.round(totalNet * 100) / 100;
  }

  static async getComparisonData(studentId, examType, months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return await database.all(`
      SELECT 
        exam_date,
        turkce_net,
        matematik_net,
        sosyal_net,
        fen_net,
        edebiyat_net,
        matematik_ayt_net,
        fizik_net,
        kimya_net,
        biyoloji_net,
        tarih_net,
        cografya_net,
        tyt_score,
        ayt_score
      FROM mock_exams 
      WHERE student_id = ? AND exam_type = ? AND exam_date >= ?
      ORDER BY exam_date
    `, [studentId, examType, formatDate(startDate)]);
  }

  // Gelişmiş deneme sınavı istatistikleri
  static async getDetailedStats(studentId, { examType, months }) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const query = `
      SELECT 
        exam_date,
        exam_name,
        exam_type,
        turkce_net,
        matematik_net,
        sosyal_net,
        fen_net,
        (turkce_net + matematik_net + sosyal_net + fen_net) as tyt_total_net,
        edebiyat_net,
        matematik_ayt_net,
        fizik_net,
        kimya_net,
        biyoloji_net,
        tarih_net,
        cografya_net,
        (CASE 
          WHEN exam_type = 'ayt' OR exam_type = 'tyt_ayt' 
          THEN edebiyat_net + matematik_ayt_net + fizik_net + kimya_net + biyoloji_net + tarih_net + cografya_net
          ELSE 0 
        END) as ayt_total_net,
        tyt_score,
        ayt_score,
        ranking
      FROM mock_exams 
      WHERE student_id = ? 
        AND (exam_type = ? OR ? IS NULL)
        AND exam_date >= ?
      ORDER BY exam_date
    `;
    
    const exams = await database.all(query, [
      studentId, 
      examType, 
      examType,
      formatDate(startDate)
    ]);
    
    // Calculate trends and averages
    const subjectTrends = {};
    const subjects = examType === 'tyt' ? 
      ['turkce', 'matematik', 'sosyal', 'fen'] :
      ['matematik_ayt', 'fizik', 'kimya', 'biyoloji', 'edebiyat', 'tarih', 'cografya'];
    
    subjects.forEach(subject => {
      subjectTrends[subject] = exams.map(exam => ({
        date: exam.exam_date,
        net: exam[`${subject}_net`] || 0
      }));
    });
    
    return {
      exams,
      subjectTrends,
      summary: {
        totalExams: exams.length,
        averageTytNet: exams.reduce((sum, e) => sum + (e.tyt_total_net || 0), 0) / exams.length,
        averageAytNet: exams.reduce((sum, e) => sum + (e.ayt_total_net || 0), 0) / exams.length,
        bestTytNet: Math.max(...exams.map(e => e.tyt_total_net || 0)),
        bestAytNet: Math.max(...exams.map(e => e.ayt_total_net || 0))
      }
    };
  }
}

module.exports = MockExam;