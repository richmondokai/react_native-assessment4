/**
 * Note properties type
 * @typedef {Object} NoteProps
 * @property {number} id - Note ID
 * @property {string} title - Note title
 * @property {string} content - Note content
 * @property {string} [category] - Note category
 * @property {string} [priority] - Note priority (low, medium, high)
 * @property {boolean} [isFavorite] - Whether the note is marked as favorite
 * @property {string} [updatedAt] - Last update timestamp
 * @property {string} [createdAt] - Creation timestamp
 */

/**
 * Note list response type
 * @typedef {Array<NoteProps>} NoteListResponse
 */

/**
 * Favorite response type
 * @typedef {Object} FavoriteResponse
 * @property {number} id - Favorite ID
 * @property {number} note_id - Note ID
 * @property {number} user_id - User ID
 * @property {Object} note - Note data
 */

// This file is for JSDoc type definitions only
// No actual code is exported
