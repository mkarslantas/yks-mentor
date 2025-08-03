import { get, post, put, del, getWithParams } from './api';
import axios from 'axios';

export const coachService = {
  async getDashboard() {
    const response = await get('/coach/dashboard');
    return response.data;
  },

  async getStudents(params = {}) {
    console.log('🔍 coachService.getStudents: Starting request with params:', params);
    try {
      const response = await getWithParams('/coach/students', params);
      console.log('✅ coachService.getStudents: Response received:', response);
      return response;
    } catch (error) {
      console.error('❌ coachService.getStudents: Error occurred:', error);
      throw error;
    }
  },

  async getStudent(studentId) {
    console.log('🔍 coachService.getStudent: Starting request for studentId:', studentId);
    try {
      const response = await get(`/coach/student/${studentId}`);
      console.log('✅ coachService.getStudent: Response received:', response);
      return response.data;
    } catch (error) {
      console.error('❌ coachService.getStudent: Error occurred:', error);
      throw error;
    }
  },

  async getStudentTasks(studentId) {
    console.log('🔍 coachService.getStudentTasks: Starting request for studentId:', studentId);
    try {
      const response = await get(`/coach/student/${studentId}/tasks`);
      console.log('✅ coachService.getStudentTasks: Response received:', response);
      return response.data;
    } catch (error) {
      console.error('❌ coachService.getStudentTasks: Error occurred:', error);
      throw error;
    }
  },

  async getStudentDetail(studentId) {
    const response = await get(`/coach/student/${studentId}`);
    return response;
  },

  async getStudentStatistics(studentId, params = {}) {
    console.log('🔍 coachService.getStudentStatistics: Starting request for studentId:', studentId, 'params:', params);
    try {
      const response = await getWithParams(`/coach/student/${studentId}/statistics`, params);
      console.log('✅ coachService.getStudentStatistics: Response received:', response);
      return response.data;
    } catch (error) {
      console.error('❌ coachService.getStudentStatistics: Error occurred:', error);
      throw error;
    }
  },

  async updateStudent(studentId, studentData) {
    const response = await put(`/coach/student/${studentId}`, studentData);
    return response;
  },

  async assignTask(studentId, taskData) {
    const response = await post(`/coach/student/${studentId}/task`, taskData);
    return response.data;
  },

  async updateTask(taskId, taskData) {
    const response = await put(`/coach/task/${taskId}`, taskData);
    return response.data;
  },

  async deleteTask(taskId) {
    const response = await del(`/coach/task/${taskId}`);
    return response.data;
  },

  async createWeeklyPlan(studentId, planData) {
    const response = await post(`/coach/student/${studentId}/weekly-plan`, planData);
    return response.data;
  },

  async getWeeklyPlans(params = {}) {
    const response = await getWithParams('/coach/weekly-plans', params);
    return response.data;
  },

  async getStatistics(params = {}) {
    const response = await getWithParams('/coach/statistics', params);
    return response.data;
  },

  async addStudent(studentData) {
    const response = await post('/coach/student', studentData);
    return response.data;
  },

  async getTasks(params = {}) {
    const response = await getWithParams('/coach/tasks', params);
    return response;
  },

  async deleteTask(taskId) {
    const response = await del(`/coach/task/${taskId}`);
    return response;
  },

  async deleteStudent(studentId) {
    console.log('🗑️ coachService.deleteStudent: Starting request for studentId:', studentId);
    try {
      // Doğrudan axios kullan, API service bypass et
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.delete(`http://localhost:3008/api/coach/student/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ coachService.deleteStudent: Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ coachService.deleteStudent: Error occurred:', error);
      
      // Axios error handling
      if (error.response) {
        console.error('❌ Response error:', error.response.data);
        throw new Error(error.response.data?.message || 'Delete request failed');
      } else if (error.request) {
        console.error('❌ Network error:', error.request);
        throw new Error('Network error occurred');
      } else {
        console.error('❌ Request setup error:', error.message);
        throw new Error(error.message);
      }
    }
  },

  async getDailyQuestionsBySubject(studentId, params = {}) {
    console.log('🔍 coachService.getDailyQuestionsBySubject: Starting request for studentId:', studentId, 'params:', params);
    try {
      const response = await getWithParams(`/coach/student/${studentId}/daily-questions-by-subject`, params);
      console.log('✅ coachService.getDailyQuestionsBySubject: Response received:', response);
      return response.data;
    } catch (error) {
      console.error('❌ coachService.getDailyQuestionsBySubject: Error occurred:', error);
      throw error;
    }
  },

  async getStudentMockExams(studentId, params = {}) {
    console.log('🔍 coachService.getStudentMockExams: Starting request for studentId:', studentId, 'params:', params);
    try {
      const response = await getWithParams(`/coach/student/${studentId}/mock-exams`, params);
      console.log('✅ coachService.getStudentMockExams: Response received:', response);
      return response.data;
    } catch (error) {
      console.error('❌ coachService.getStudentMockExams: Error occurred:', error);
      throw error;
    }
  },

  async getStudentStudyRecords(studentId, params = {}) {
    console.log('🔍 coachService.getStudentStudyRecords: Starting request for studentId:', studentId, 'params:', params);
    try {
      const response = await getWithParams(`/coach/student/${studentId}/study-records`, params);
      console.log('✅ coachService.getStudentStudyRecords: Response received:', response);
      return response;
    } catch (error) {
      console.error('❌ coachService.getStudentStudyRecords: Error occurred:', error);
      throw error;
    }
  }
};