import yup from "yup";
import validation from "../../middlewares/validation.js";
import { Knex } from "../../knex/knex.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import { cpf } from "cpf-cnpj-validator";
import { generateCode } from "../../shared/generatecode.js";
import { sendVerificationEmail } from "../../shared/emailService.js";

export const createValidation = validation((schema) => ({
    body: yup
        .object()
        .shape({
            email: yup.string().email().required(),
            cpf: yup.string().length(11).required().test("isValid", "CPF inválido", (val) => cpf.isValid(val)),
            password: yup.string().min(6).required(),
            age: yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido").required(),
            name: yup.string().required(),
            role: yup.string().oneOf(["Aluno", "Funcionário", "Administrador"]).required(),
        })
        .noUnknown(true, "Chaves adicionais não são permitidas."),
}));

const createHash = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const createUser = async (body) => {
    const { password, ...rest } = body;
    const { cpf, email } = rest;
    const errors = [];

    const checkExists = async (fields, table = "users") => {
        for (const [field, value] of Object.entries(fields)) {
            const exists = await Knex(table).select("id").where({ [field]: value }).first();
            if (exists) errors.push(`${field} já cadastrado(a).`);
        }
    };

    await checkExists({ cpf, email });
    if (errors.length > 0) return { errors };

    const passwordHash = await createHash(password);
    const validation_code = generateCode();

    const [user] = await Knex("users")
        .insert({ ...rest, passwordHash, validation_code, is_verified: false })
        .returning(["id", "email", "cpf", "validation_code", "name"]);

    return user;
};

export const create = async (req, res) => {
    try {
        const userResponse = await createUser(req.body);
        if (userResponse.errors) {
            return res.status(StatusCodes.BAD_REQUEST).json({ errors: userResponse.errors });
        }

        // Enviar e-mail de verificação
        await sendVerificationEmail(userResponse.email, userResponse.name, userResponse.validation_code, userResponse.id);

        return res.status(StatusCodes.CREATED).json({ id: userResponse.id, message: "Usuário criado. Verifique seu e-mail." });
    } catch (e) {
        console.error(e);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: e.message });
    }
};
