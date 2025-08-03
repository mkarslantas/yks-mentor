const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const database = require('../src/config/database');

const importQuotes = async () => {
  try {
    console.log('🔄 Starting quotes import...');
    
    // Connect to database
    await database.connect();
    
    // Clear existing quotes
    await database.run('DELETE FROM quotes');
    console.log('🗑️  Cleared existing quotes');
    
    const quotesEn = [];
    const quotesTr = [];
    
    // Read English quotes
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, '../../quotes/quotes.csv'))
        .pipe(csv())
        .on('data', (row) => {
          quotesEn.push({
            author: row.Author?.trim(),
            quote: row.Quote?.trim()
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    // Read Turkish quotes
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, '../../quotes/quotes_tr.csv'))
        .pipe(csv())
        .on('data', (row) => {
          quotesTr.push({
            author: row.Yazar?.trim(),
            quote: row['Alıntı']?.trim()
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`📊 Found ${quotesEn.length} English quotes`);
    console.log(`📊 Found ${quotesTr.length} Turkish quotes`);
    
    // Match quotes by index (assuming same order)
    const minLength = Math.min(quotesEn.length, quotesTr.length);
    
    for (let i = 0; i < minLength; i++) {
      const enQuote = quotesEn[i];
      const trQuote = quotesTr[i];
      
      // Skip if missing data
      if (!enQuote.author || !enQuote.quote || !trQuote.quote) {
        console.log(`⚠️  Skipping incomplete quote at index ${i}`);
        continue;
      }
      
      try {
        await database.run(`
          INSERT INTO quotes (author, quote_en, quote_tr) 
          VALUES (?, ?, ?)
        `, [enQuote.author, enQuote.quote, trQuote.quote]);
        
        if (i % 10 === 0) {
          console.log(`📝 Imported ${i + 1} quotes...`);
        }
      } catch (error) {
        console.error(`❌ Error importing quote ${i}:`, error.message);
      }
    }
    
    // Get final count
    const result = await database.get('SELECT COUNT(*) as count FROM quotes');
    console.log(`✅ Successfully imported ${result.count} quotes!`);
    
    // Show some examples
    const examples = await database.all('SELECT * FROM quotes LIMIT 3');
    console.log('📖 Examples:');
    examples.forEach((quote, i) => {
      console.log(`${i + 1}. ${quote.author}`);
      console.log(`   EN: "${quote.quote_en}"`);
      console.log(`   TR: "${quote.quote_tr}"`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    if (database.db) {
      await database.close();
    }
  }
};

// Install csv-parser if not already installed
const checkDependencies = () => {
  try {
    require('csv-parser');
    return true;
  } catch (error) {
    console.log('📦 Installing csv-parser...');
    const { execSync } = require('child_process');
    execSync('npm install csv-parser', { stdio: 'inherit' });
    return true;
  }
};

if (checkDependencies()) {
  importQuotes();
}