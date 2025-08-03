import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Renkler
const colors = {
  matematik: '#3B82F6',
  fizik: '#10B981', 
  kimya: '#F59E0B',
  biyoloji: '#EF4444',
  turkce: '#8B5CF6',
  edebiyat: '#EC4899',
  tarih: '#14B8A6',
  cografya: '#F97316',
  sosyal: '#6366F1', // TYT sosyal bilimler
  fen: '#059669',    // TYT fen bilimleri
  felsefe: '#7C2D12',
  // AYT özel dersler
  tarih1: '#0891B2',   // Tarih-1
  tarih2: '#0E7490',   // Tarih-2  
  cografya1: '#EA580C', // Coğrafya-1
  cografya2: '#C2410C', // Coğrafya-2
  din: '#7C3AED',      // Din Kültürü
  ydt: '#BE185D'       // YDT (Yabancı Dil Testi)
};

export const LineChart = ({ data, title, height = 300, stacked = false }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            
            // Deneme sınavı chartı için net puan göster
            if (title && title.includes('Deneme Sınavı')) {
              return `${label}: ${value} net`;
            }
            
            // Günlük soru chartı için soru sayısı göster
            if (title && title.includes('Günlük Soru')) {
              if (label === 'Toplam Soru') {
                return `${label}: ${value} soru (günlük toplam)`;
              }
              return `${label}: ${value} soru`;
            }
            
            if (title && title.includes('Çalışma Süresi')) {
              // Dakikayı saat ve dakikaya çevir
              const hours = Math.floor(value / 60);
              const minutes = value % 60;
              if (hours > 0 && minutes > 0) {
                return `${label}: ${hours}sa ${minutes}dk`;
              } else if (hours > 0) {
                return `${label}: ${hours}sa`;
              } else {
                return `${label}: ${minutes}dk`;
              }
            }
            
            // Varsayılan format
            return `${label}: ${value}`;
          }
        }
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        stacked: stacked,
        grid: {
          color: '#F3F4F6'
        },
        title: {
          display: title && (title.includes('Günlük Soru') || title.includes('Çalışma Süresi')),
          text: title && title.includes('Günlük Soru') ? 'Ders Bazlı Soru Sayısı' : 'Çalışma Süresi (Dakika)'
        }
      },
      y1: {
        type: 'linear',
        display: title && title.includes('Günlük Soru'),
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false, // Sadece sol Y ekseni grid çizgilerini göster
          color: '#F3F4F6'
        },
        title: {
          display: true,
          text: 'Toplam Soru Sayısı'
        }
      },
      x: {
        stacked: stacked,
        grid: {
          color: '#F3F4F6'
        }
      }
    }
  };

  return (
    <div style={{ height: `${height}px`, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export const BarChart = ({ data, title, height = 300, stacked = false }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,  
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            
            if (stacked && title && title.includes('Günlük Soru')) {
              return `${label}: ${value} soru`;
            }
            
            if (stacked && title && title.includes('Deneme Sınavı')) {
              return `${label}: ${value} net`;
            }
            
            if (stacked && title && title.includes('Çalışma Süresi')) {
              // Dakikayı saat ve dakikaya çevir
              const hours = Math.floor(value / 60);
              const minutes = value % 60;
              if (hours > 0 && minutes > 0) {
                return `${label}: ${hours}sa ${minutes}dk`;
              } else if (hours > 0) {
                return `${label}: ${hours}sa`;
              } else {
                return `${label}: ${minutes}dk`;
              }
            }
            
            return `${label}: ${value}`;
          },
          footer: function(tooltipItems) {
            if (stacked) {
              let total = 0;
              tooltipItems.forEach(item => total += item.parsed.y);
              
              if (title && title.includes('Günlük Soru')) {
                return `Toplam: ${total} soru`;
              }
              
              if (title && title.includes('Deneme Sınavı')) {
                return `Toplam Net: ${total}`;
              }
              
              if (title && title.includes('Çalışma Süresi')) {
                const hours = Math.floor(total / 60);
                const minutes = total % 60;
                if (hours > 0 && minutes > 0) {
                  return `Toplam: ${hours}sa ${minutes}dk`;
                } else if (hours > 0) {
                  return `Toplam: ${hours}sa`;
                } else {
                  return `Toplam: ${minutes}dk`;
                }
              }
            }
            return '';
          }
        }
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: stacked,
        grid: {
          color: '#F3F4F6'
        },
        title: {
          display: stacked && title && (title.includes('Günlük Soru') || title.includes('Çalışma Süresi')),
          text: title && title.includes('Günlük Soru') ? 'Günlük Soru Sayısı' : 'Çalışma Süresi (Dakika)'
        }
      },
      x: {
        stacked: stacked,
        grid: {
          color: '#F3F4F6'
        }
      }
    }
  };

  return (
    <div style={{ height: `${height}px`, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export const DoughnutChart = ({ data, title, height = 300 }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    }
  };

  return (
    <div style={{ height: `${height}px`, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

// Utility functions
export const formatChartData = {
  // Günlük soru sayıları - stacked bar chart
  dailyQuestionsBySubject: (rawData) => {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    const dates = [...new Set(rawData.map(item => item.date))].sort();
    const subjects = [...new Set(rawData.map(item => item.subject))].filter(Boolean);
    
    // Her ders için stacked dataset
    const datasets = subjects.map(subject => ({
      label: subject && typeof subject === 'string' ? subject.charAt(0).toUpperCase() + subject.slice(1) : 'Bilinmeyen',
      data: dates.map(date => {
        const item = rawData.find(r => r.date === date && r.subject === subject);
        return item ? item.questions : 0;
      }),
      backgroundColor: colors[subject] || '#6B7280',
      borderColor: colors[subject] || '#6B7280',
      borderWidth: 1
    }));

    return {
      labels: dates.map(date => new Date(date).toLocaleDateString('tr-TR', { 
        month: 'short', 
        day: 'numeric' 
      })),
      datasets
    };
  },

  // Günlük çalışma süreleri - stacked bar chart
  dailyStudyDuration: (rawData) => {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    const dates = [...new Set(rawData.map(item => item.date))].sort();
    const subjects = [...new Set(rawData.map(item => item.subject))].filter(Boolean);
    
    // Her ders için stacked dataset (bar chart için)
    const datasets = subjects.map(subject => ({
      label: subject && typeof subject === 'string' ? subject.charAt(0).toUpperCase() + subject.slice(1) : 'Bilinmeyen',
      data: dates.map(date => {
        const item = rawData.find(r => r.date === date && r.subject === subject);
        return item ? item.duration : 0; // Dakika olarak sakla, tooltip'te formatlanacak
      }),
      backgroundColor: colors[subject] || '#6B7280',
      borderColor: colors[subject] || '#6B7280',
      borderWidth: 1
    }));

    return {
      labels: dates.map(date => new Date(date).toLocaleDateString('tr-TR', { 
        month: 'short', 
        day: 'numeric' 
      })),
      datasets
    };
  },

  // Ders bazlı performans karşılaştırması
  subjectPerformanceComparison: (rawData) => {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    const subjects = rawData.map(item => item.subject && typeof item.subject === 'string' ? item.subject.charAt(0).toUpperCase() + item.subject.slice(1) : 'Bilinmeyen');
    const accuracies = rawData.map(item => item.accuracy_rate || 0);

    return {
      labels: subjects,
      datasets: [{
        label: 'Başarı Oranı (%)',
        data: accuracies,
        backgroundColor: subjects.map((_, index) => {
          const subject = rawData[index].subject;
          return colors[subject] || '#6B7280';
        }),
        borderColor: subjects.map((_, index) => {
          const subject = rawData[index].subject;
          return colors[subject] || '#6B7280';
        }),
        borderWidth: 1
      }]
    };
  },

  // Çalışma süresi dağılımı
  studyTimeDistribution: (rawData) => {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    const subjects = rawData.map(item => item.subject && typeof item.subject === 'string' ? item.subject.charAt(0).toUpperCase() + item.subject.slice(1) : 'Bilinmeyen');
    const percentages = rawData.map(item => item.percentage || 0);

    return {
      labels: subjects,
      datasets: [{
        data: percentages,
        backgroundColor: subjects.map((_, index) => {
          const subject = rawData[index].subject;
          return colors[subject] || '#6B7280';
        }),
        borderColor: '#FFFFFF',
        borderWidth: 2
      }]
    };
  },

  // Deneme sınavı net gelişimi - stacked bar chart
  mockExamProgress: (rawData) => {
    if (!rawData || !rawData.subjectTrends) return { labels: [], datasets: [] };

    const subjects = Object.keys(rawData.subjectTrends);
    const dates = rawData.subjectTrends[subjects[0]]?.map(item => item.date) || [];

    // Her ders için stacked dataset
    const datasets = subjects.map(subject => ({
      label: subject && typeof subject === 'string' ? subject.charAt(0).toUpperCase() + subject.slice(1) : 'Bilinmeyen',
      data: rawData.subjectTrends[subject]?.map(item => item.net) || [],
      backgroundColor: colors[subject] || '#6B7280',
      borderColor: colors[subject] || '#6B7280',
      borderWidth: 1
    }));

    return {
      labels: dates.map(date => new Date(date).toLocaleDateString('tr-TR', { 
        month: 'short', 
        day: 'numeric' 
      })),
      datasets
    };
  }
};

export default { LineChart, BarChart, DoughnutChart, formatChartData };