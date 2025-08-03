import { get, post, put, del, getWithParams } from './api';

export const studentService = {
  async getDashboard() {
    const response = await get('/student/dashboard');
    return response.data;
  },

  async getStudyRecords(params = {}) {
    const response = await getWithParams('/student/study-records', params);
    return response.data;
  },

  async createStudyRecord(recordData) {
    const response = await post('/student/study-record', recordData);
    return response.data;
  },

  async updateStudyRecord(id, recordData) {
    const response = await put(`/student/study-record/${id}`, recordData);
    return response.data;
  },

  async deleteStudyRecord(id) {
    const response = await del(`/student/study-record/${id}`);
    return response.data;
  },

  async getStatistics(params = {}) {
    const response = await getWithParams('/student/statistics', params);
    return response.data;
  },

  async getStreak() {
    const response = await get('/student/statistics/streak');
    return response.data;
  },

  async getMockExams(params = {}) {
    const response = await getWithParams('/student/mock-exams', params);
    return response.data;
  },

  async createMockExam(examData) {
    const response = await post('/student/mock-exam', examData);
    return response.data;
  },

  async getMockExam(id) {
    const response = await get(`/student/mock-exam/${id}`);
    return response.data;
  },

  async updateMockExam(id, examData) {
    const response = await put(`/student/mock-exam/${id}`, examData);
    return response.data;
  },

  async deleteMockExam(examId) {
    const response = await del(`/student/mock-exam/${examId}`);
    return response.data;
  },

  async getTasks(params = {}) {
    const response = await getWithParams('/student/tasks', params);
    return response.data;
  },

  async completeTask(id) {
    const response = await put(`/student/task/${id}/complete`, {});
    return response;
  },

  async updateTaskTime(id, timeData) {
    const response = await put(`/student/task/${id}/time`, timeData);
    return response.data;
  },

  async updateTaskNotes(id, notesData) {
    const response = await put(`/student/task/${id}/notes`, notesData);
    return response.data;
  },

  async getStudyHistory(params = {}) {
    const response = await getWithParams('/student/study-history', params);
    return response.data;
  },

  async getRandomQuote() {
    const response = await get('/student/quote/random');
    return response.data;
  },

  // Advanced Statistics Endpoints
  async getDailyQuestionsBySubject(params = {}) {
    const response = await getWithParams('/student/statistics/daily-questions-by-subject', params);
    return response.data;
  },

  async getSubjectPerformanceComparison(params = {}) {
    const response = await getWithParams('/student/statistics/subject-performance-comparison', params);
    return response.data;
  },

  async getStudyTimeDistribution(params = {}) {
    const response = await getWithParams('/student/statistics/study-time-distribution', params);
    return response.data;
  },

  async getMockExamDetailedStats(params = {}) {
    const response = await getWithParams('/student/statistics/mock-exam-detailed', params);
    return response.data;
  }
};