const database = require('../config/database');

class Quote {
  static async getRandomQuote() {
    return await database.get(`
      SELECT * FROM quotes 
      WHERE is_active = 1 
      ORDER BY RANDOM() 
      LIMIT 1
    `);
  }

  static async getAll(options = {}) {
    let query = `
      SELECT * FROM quotes 
      WHERE is_active = 1
    `;
    const params = [];

    if (options.category) {
      query += ' AND category = ?';
      params.push(options.category);
    }

    query += ' ORDER BY author, id';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    return await database.all(query, params);
  }

  static async findById(id) {
    return await database.get(`
      SELECT * FROM quotes WHERE id = ?
    `, [id]);
  }

  static async create(quoteData) {
    const {
      author,
      quote_en,
      quote_tr,
      category = 'motivation'
    } = quoteData;

    const result = await database.run(`
      INSERT INTO quotes (author, quote_en, quote_tr, category) 
      VALUES (?, ?, ?, ?)
    `, [author, quote_en, quote_tr, category]);

    return await this.findById(result.id);
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);

    await database.run(
      `UPDATE quotes SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  static async delete(id) {
    const result = await database.run('DELETE FROM quotes WHERE id = ?', [id]);
    return result.changes > 0;
  }

  static async getCategories() {
    const result = await database.all(`
      SELECT DISTINCT category FROM quotes 
      WHERE is_active = 1 
      ORDER BY category
    `);
    return result.map(row => row.category);
  }
}

module.exports = Quote;