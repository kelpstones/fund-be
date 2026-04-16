const Joi = require("joi");

exports.negotiationValidation = (data) => {
    try {
        const schema = Joi.object({
            pengajuans_id: Joi.number().integer().required(),
            penawaran_return: Joi.number().integer().required(),
            catatan: Joi.string().optional(),
        })
        return schema.validate(data);
    } catch (error) {
        console.error(error);
        throw error;
    }
}