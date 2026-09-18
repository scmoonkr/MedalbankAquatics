// routes/validation/validation_schema.js

/**
 * 유효성 검사 함수
 * @param {Object} schema - 스키마 객체
 * @param {Object} data - 검증할 데이터 객체
 */
function validateSchema(schema, data) {
  if (!schema) throw new Error(`schema not found.`);
  for (const key in schema) {
    const rule = schema[key];
    const value = data[key];

    // Check if the field is required and missing
    if (rule.required && (value === undefined || value === null)) {
      throw new Error(`${key} is required.`);
    }

    // If value exists, validate it based on its type
    if (value !== undefined) {
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            throw new Error(`${key} must be a string.`);
          }
          if (rule.minLength !== undefined && value.length < rule.minLength) {
            throw new Error(`${key} must be at least ${rule.minLength} characters long.`);
          }
          if (rule.maxLength !== undefined && value.length > rule.maxLength) {
            throw new Error(`${key} must be at most ${rule.maxLength} characters long.`);
          }
          break;

        case 'int':
          if (!Number.isInteger(value)) {
            throw new Error(`${key} must be an integer.`);
          }
          break;

        case 'float':
          if (typeof value !== 'number' || Number.isInteger(value)) {
            throw new Error(`${key} must be a float.`);
          }
          break;

        case 'bool':
          if (typeof value !== 'boolean') {
            throw new Error(`${key} must be a boolean.`);
          }
          break;

        case 'datetime':
          if (isNaN(Date.parse(value))) {
            throw new Error(`${key} must be a valid datetime in ISO 8601 format.`);
          }
          break;

        case 'object':
          if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            throw new Error(`${key} must be an object.`);
          }
          if (rule.fields) {
            validateSchema(rule.fields, value);
          }
          break;

        case 'array':
          if (!Array.isArray(value)) {
            throw new Error(`${key} must be an array.`);
          }
          if (rule.items) {
            value.forEach((item, index) => {
              try {
                validateSchema(rule.items.fields, item);
              } catch (error) {
                throw new Error(`${key}[${index}]: ${error.message}`);
              }
            });
          }
          break;

        default:
          throw new Error(`Invalid type for ${key}.`);
      }

      // Check if the value is within the allowed enum options
      if (rule.enum && !rule.enum.includes(value)) {
        throw new Error(`${key} must be one of [${rule.enum.join(', ')}].`);
      }
    }
  }
}

function customizingSchema(schema, data={}) {
  if (!schema) throw new Error(`schema not found.`);
  for (const key in schema) {
    const rule = schema[key];

    // Check if the field is required and missing
    // if (rule.required && (value === undefined || value === null)) {
    //   throw new Error(`${key} is required.`);
    // }

    // If value exists, validate it based on its type
    switch (rule.type) {
      case 'string':
        data[key] = data[key] || "";
        data[key] = rule.array ? data[key] : data[key].trim();
        if (!data[key]) delete data[key];
        break;

      case 'int':
        data[key] = data[key] || 0;
        if (typeof data[key] === 'string') { data[key] = Number(data[key].trim()); }
        if (!Number.isInteger(data[key])) {
          delete data[key];
          // throw new Error(`${data[key]} must be an integer.`);
        } else if (!data[key]) delete data[key];
        break;

      case 'double':
      case 'float':
        data[key] = data[key] || 0.0;
        if (typeof data[key] === 'string') { data[key] = Number(data[key].trim()); }
        if (typeof data[key] !== 'number' || !Number.isInteger(data[key])) {
          delete data[key];
          // throw new Error(`${data[key]} must be a float.`);
        } else data[key] = Number(data[key]);
        if (!data[key]) delete data[key];
        break;

      case 'bool':
        data[key] = data[key] || false;
        if (typeof data[key] === 'string') { data[key] = /^true$/i.test(data[key]); }
        if (typeof data[key] !== 'boolean') {
          delete data[key];
          // throw new Error(`${data[key]} must be a boolean.`);
        }
        if (!data[key]) delete data[key];
        break;

      case 'datetime':
        data[key] = data[key] || "0000-00-00";
        if (typeof data[key] === 'string') { data[key] =new Date(data[key].trim()); }
        if (isNaN(Date.parse(data[key]))) {
          delete data[key];
          // throw new Error(`${data[key]} must be a valid datetime in ISO 8601 format.`);
        }
        if (!data[key]) delete data[key];
        break;

      case 'object':
        if (rule.array) {
          if (!Array.isArray(data[key])) {
            delete data[key];
            break;
            // throw new Error(`${data[key]} must be an array.`);
          }
          if (data[key] != undefined && rule.fields) {
            data[key].forEach((item, index) => {
              try {
                customizingSchema(rule.fields, item);
                // if (Object.keys(item[key]).length == 0) delete item[key];
              } catch (error) {
                delete data[key];
              }
            });
          }  
        } else {
          if (typeof data[key] !== 'object' || data[key] === null || Array.isArray(data[key])) {
            delete data[key];
          } else  if (data[key] != undefined && rule.fields) {
            customizingSchema(rule.fields, data[key]);
            if (Object.keys(data[key]).length == 0) delete data[key];
          }  
        }
        break;
      case 'array':
        if (!Array.isArray(data[key])) {
          delete data[key];
          break;
          // throw new Error(`${data[key]} must be an array.`);
        }
        if (data[key] != undefined && rule.items) {
          data[key].forEach((item, index) => {
            try {
              customizingSchema(rule.items.fields, item);
            } catch (error) {
              delete data[key];
            }
          });
        }
        break;

      default:
        delete data[key];
        break;
    }

    // Check if the value is within the allowed enum options
    if (rule.enum && data[key] && !rule.enum.includes(data[key])) {
      throw new Error(`${data[key]} must be one of [${rule.enum.join(', ')}].`);
    }
  }
  return data;
}

function customizingSchemaOLD(schema, data={}) {
  if (!schema) throw new Error(`schema not found.`);
  for (const key in schema) {
    const rule = schema[key];
    let value = data[key];

    // Check if the field is required and missing
    // if (rule.required && (value === undefined || value === null)) {
    //   throw new Error(`${key} is required.`);
    // }

    // If value exists, validate it based on its type
    switch (rule.type) {
      case 'string':
        data[key] = data[key] || "";
        data[key] = rule.array ? data[key] : data[key].trim();
        break;

      case 'int':
        data[key] = data[key] || 0;
        if (typeof data[key] === 'string') { data[key] = Number(data[key].trim()); }
        if (!Number.isInteger(data[key])) {
          throw new Error(`${data[key]} must be an integer.`);
        }
        break;

      case 'double':
      case 'float':
        data[key] = data[key] || 0.0;
        if (typeof data[key] === 'string') { data[key] = Number(data[key].trim()); }
        if (typeof data[key] !== 'number' || !Number.isInteger(data[key])) {
          throw new Error(`${data[key]} must be a float.`);
        }
        data[key] = Number(data[key]);
        break;

      case 'bool':
        data[key] = data[key] || false;
        if (typeof data[key] === 'string') { data[key] = /^true$/i.test(data[key]); }
        if (typeof data[key] !== 'boolean') {
          throw new Error(`${data[key]} must be a boolean.`);
        }
        break;

      case 'datetime':
        data[key] = data[key] || "0000-00-00";
        if (typeof data[key] === 'string') { data[key] =new Date(data[key].trim()); }
        if (isNaN(Date.parse(data[key]))) {
          throw new Error(`${data[key]} must be a valid datetime in ISO 8601 format.`);
        }
        break;

      case 'object':
        if (typeof data[key] !== 'object' || data[key] === null || Array.isArray(data[key])) {
          throw new Error(`${data[key]} must be an object.`);
        }
        if (rule.fields) {
          customizingSchema(rule.fields, data[key]);
        }
        break;

      case 'array':
        if (!Array.isArray(data[key])) {
          throw new Error(`${data[key]} must be an array.`);
        }
        if (rule.items) {
          data[key].forEach((item, index) => {
            try {
              customizingSchema(rule.items.fields, item);
            } catch (error) {
              throw new Error(`${key}[${index}]: ${error.message}`);
            }
          });
        }
        break;

      default:
        throw new Error(`Invalid type for ${key}.`);
    }

    // Check if the value is within the allowed enum options
    if (rule.enum && !rule.enum.includes(data[key])) {
      throw new Error(`${data[key]} must be one of [${rule.enum.join(', ')}].`);
    }
  }
  return data;
}

module.exports = { validateSchema, customizingSchema }
