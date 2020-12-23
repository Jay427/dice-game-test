'use strict';

/**
 * Joi validation
 */
const Joi = require('@hapi/joi');

exports.defaultSocketSchema = Joi.object().keys({
    en: Joi.string().required(),
    data: Joi.object().required(),
});