import { StatusCodes } from "http-status-codes";

const validation = (getAllSchemas) => async (req, res, next) => {
  const schemas = getAllSchemas((schema) => schema);
  const errorResult = {};

  if (schemas.query) {
    const query = req.query;

    if (query.user_id) {
      const userId = parseInt(query.user_id, 10); // Converte user_id para número
      if (isNaN(userId)) {
        errorResult.query = { user_id: "Formato inválido, deve ser um número." };
      } else {
        query.user_id = userId; // Atualiza user_id como número
      }
    } else {
      errorResult.query = { user_id: "O campo user_id é obrigatório." };
    }

    if (query.code && typeof query.code === "string" && query.code.length === 5) {
      query.code = String(query.code);
    } else {
      errorResult.query = { code: "O campo code é obrigatório e deve ter 5 caracteres." };
    }
  }

  if (Object.keys(errorResult).length > 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errorResult });
  }

  next();
};

export default validation;
