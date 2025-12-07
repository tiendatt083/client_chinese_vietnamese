import axios from 'axios';

// Backend API base URL for vocabulary operations
const backendUrl = 'https://server-chinese-vietnamese.onrender.com';
/**
 * Get all vocabulary words from the backend
 * @returns {Array|null} Array of vocab objects, or null if error
 */
export const viewAllWords = async () => {
   try {
      const response = await axios.get(`${backendUrl}/vocabs`);
      return response.data;
   } catch (err) {
      console.error(err);
      return null;
   }
};

/**
 * Get a specific vocabulary word by its ID
 * @param {string} id - The ID of the vocab word
 * @returns {Object|null} Vocab object, or null if error
 */
export const viewWordById = async (id) => {
   try {
      const response = await axios.get(`${backendUrl}/vocabs/${id}`);
      return response.data;
   } catch (err) {
      console.error(err);
      return null;
   }
};

/**
 * Add a new vocabulary word to the backend
 * @param {Object} word - The vocab object to add ({chinese, pos, vietnamese})
 * @returns {Object|null} The added vocab object, or null if error
 */
export const addNewWord = async (word) => {
   try {
      const response = await axios.post(`${backendUrl}/vocabs`, word);
      return response.data;
   } catch (err) {
      console.error(err);
      return null;
   }
};

/**
 * Edit/update an existing vocabulary word by its ID
 * @param {string} id - The ID of the vocab word to edit
 * @param {Object} word - The updated vocab data
 * @returns {Object|null} The updated vocab object, or null if error
 */
export const editWord = async (id, word) => {
   try {
      const response = await axios.put(`${backendUrl}/vocabs/${id}`, word);
      return response.data;
   } catch (err) {
      console.error(err);
      return null;
   }
};

/**
 * Delete a vocabulary word by its ID
 * @param {string} id - The ID of the vocab word to delete
 * @returns {Object|null} Deleted word data, or null if error
 */
export const deleteWord = async (id) => {
   try {
      const response = await axios.delete(`${backendUrl}/vocabs/${id}`);
      return response.data;
   } catch (err) {
      console.error(err);
      return null;
   }
};

/**
 * Delete all vocabulary words from the backend
 * @returns {string|null} Response message, or null if error
 */
export const deleteAllWords = async () => {
   try {
      const response = await axios.delete(`${backendUrl}/vocabs`);
      return response.data.message;
   } catch (err) {
      console.error(err);
      return null;
   }
};
