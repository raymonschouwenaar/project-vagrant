/**
 * Skill
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	schema: true,

	attributes: {

		title: {
			type: 'string',
			required: true,
		},
		skillCat: {
			type: 'string'
			defaultsTo: 'Other',
		},		
		ratingType: {
			type: 'boolean',
			defaultsTo: false,
		}		
	},
};
