import { api } from './api';

/**
 * Fetch active waste categories from the backend.
 * @returns {Promise<Array>} List of active waste categories
 */
export async function fetchWasteCategories() {
  const response = await api.get('/waste-categories');
  return response?.data?.categories || [];
}

/**
 * Fetch active collection/recycling centers from the backend.
 * @returns {Promise<Array>} List of active collection centers
 */
export async function fetchCollectionCenters() {
  const response = await api.get('/collection-centers');
  return response?.data?.centers || [];
}

/**
 * Submit a waste declaration to the backend.
 * @param {object} declaration - The declaration payload
 * @param {string} declaration.wasteCategoryId - ID of the waste category
 * @param {string} declaration.deliveryMethod - 'DROP_OFF' or 'PICKUP'
 * @param {number} declaration.estimatedWeight - Weight in kg (positive number)
 * @param {string} [declaration.description] - Optional description
 * @param {string} [declaration.pickupAddress] - Required for PICKUP
 * @returns {Promise<object>} The created declaration
 */
export async function submitDeclaration(declaration) {
  const response = await api.post('/waste-declarations', declaration);
  return response;
}
