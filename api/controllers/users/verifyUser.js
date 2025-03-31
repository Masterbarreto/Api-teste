import * as yup from "yup";
import validation from "../../middlewares/validation.js";
import { Knex } from "../../knex/knex.js";
import { StatusCodes } from "http-status-codes";
import path from "path";

/**
 * Middleware de validação da query string
 */
export const verifyQueryValidation = validation((schema) => ({
  query: yup
    .object()
    .shape({
      user_id: yup
        .number()
        .typeError("O campo user_id deve ser um número.")
        .required("O campo user_id é obrigatório."),
      code: yup
        .string()
        .length(5, "O campo code deve ter 5 caracteres.")
        .required("O campo code é obrigatório."),
    })
    .noUnknown(true, "Chaves adicionais não são permitidas."),
}));

/**
 * Verifica se o usuário existe no banco
 */
const checkUser = async (id) => {
  return Knex("users").where({ id }).first();
};

/**
 * Valida o código e altera is_verified para true
 */
const validateCode = async (user_id, code) => {
  const [user] = await Knex("users")
    .where({ id: user_id, validation_code: code, is_verified: false })
    .update({ is_verified: true })
    .returning(["id", "is_verified"]);

  if (!user) {
    return {
      error: {
        message: "Código inválido ou já verificado.",
        status: StatusCodes.BAD_REQUEST,
      },
    };
  }

  return user;
};

/**
 * Controlador principal de verificação do usuário
 */
export const verifyUser = async (req, res) => {
  try {
    const { code, user_id } = req.query;

    const user = await checkUser(user_id);
    if (!user) {
      return res.sendFile(
        path.resolve("public", "pages", "user_not_found.html")
      );
    }

    const userValidated = await validateCode(user_id, code);
    if (userValidated.error) {
      return res.sendFile(
        path.resolve("public", "pages", "user_not_found.html")
      );
    }

    return res.sendFile(
      path.resolve("public", "pages", "verified.html")
    );
  } catch (e) {
    console.error("Erro interno:", e);
    return res.sendFile(path.resolve("public", "pages", "500.html"));
  }
};
