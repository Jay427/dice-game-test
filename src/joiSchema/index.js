'use strict';

/**
 * Joi validation
 */
const Joi = require('@hapi/joi');

exports.defaultSocketSchema = Joi.object().keys({
    en: Joi.string().required(),
    data: Joi.object().required(),
});

exports.gameUserAddSchema = Joi.object().keys({
    userName: Joi.string().required(),
});

exports.gameUserTurnSchema = Joi.object().keys({
    diceNumber: Joi.number().required(),
});