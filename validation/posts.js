const validator = require('validator')
const isEmpty = require('./isEmpty')

module.exports = (data) => {
    let errors = {}

    data.text = !isEmpty(data.text) ? data.text: ''

    if(!validator.isLength(data.text, { min: 8, max: 300 })) {
        errors.text = 'Length must be between 8 to 300 characters'
    }

    if(validator.isEmpty(data.text)) {
        errors.text = 'Text field is required'
    }
 
    return {
        errors,
        isValid: isEmpty(errors)
    }
}