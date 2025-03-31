import nodemailer from "nodemailer";

// Criação do transportador (transporter)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,  // Se estiver usando TLS/SSL, defina como true
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Exportando a função para enviar o e-mail
export const sendVerificationEmail = async (to, name, validationCode, userId) => {
    const verificationUrl = `${process.env.BASE_URL}/verified?user_id=${encodeURIComponent(userId)}&code=${encodeURIComponent(validationCode)}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: "Verifique sua conta",
        html: `
        <html>
        <head>
            <style>
                /* CSS styles */
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>Olá, <strong>${name}</strong>!</h1>
                </div>
                <div class="email-body">
                    <p>Para verificar sua conta, clique no link abaixo:</p>
                    <a href="${verificationUrl}" class="cta-button">Verifique sua conta</a>
                    <p>Ou insira o código de verificação diretamente:</p>
                    <p><strong>Código de verificação: ${validationCode}</strong></p>
                    <p class="footer">Se você não solicitou este e-mail, ignore esta mensagem.</p>
                </div>
            </div>
        </body>
        </html>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ E-mail de verificação enviado para: ${to}`);
    } catch (error) {
        console.error("❌ Erro ao enviar e-mail:", error);
        throw new Error("Erro ao enviar e-mail de verificação.");
    }
};
