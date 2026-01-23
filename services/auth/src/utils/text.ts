export function generateMail(lastname: string, verificationUrl: string) {
    const nom = 'CASA';
    const year = new Date().getFullYear();

    return {
        text: `
            Bonjour ${lastname},
            Bienvenue sur ${nom} !
            Pour finaliser votre inscription, veuillez confirmer votre adresse email : ${verificationUrl}
            Ce lien est valide pendant 24 heures.
            Cordialement, L'équipe ${nom}
        `,
        html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #121212; color: #ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #121212; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="100%" style="max-width: 600px; background-color: #1e1e1e; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #333333;">
                            <tr>
                                <td style="padding: 40px 0; text-align: center; background: linear-gradient(135deg, #1e1e1e 0%, #252525 100%);">
                                    <h1 style="margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -1px; color: #ffffff;">
                                        <span style="color: #8b5cf6;">C</span>ASA
                                    </h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #ffffff;">Vérifiez votre email 👋</h2>
                                    <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                        Bonjour <strong>${lastname}</strong>,
                                    </p>
                                    <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                        Bienvenue sur <strong>${nom}</strong>. Cliquez sur le bouton ci-dessous pour sécuriser votre compte.
                                    </p>
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" style="padding-bottom: 40px;">
                                                <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 16px 45px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);">
                                                    Confirmer mon email
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    <div style="padding: 20px; background-color: #27272a; border-radius: 10px; border: 1px dashed #3f3f46;">
                                        <p style="color: #71717a; font-size: 13px; margin: 0; line-height: 1.5; word-break: break-all;">
                                            <strong>Lien direct :</strong><br>
                                            <a href="${verificationUrl}" style="color: #8b5cf6; text-decoration: none;">${verificationUrl}</a>
                                        </p>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 30px; text-align: center; border-top: 1px solid #333333; background-color: #1a1a1a;">
                                    <p style="color: #a1a1aa; font-size: 12px; font-weight: 600; margin: 0;">
                                        © ${year} ${nom.toUpperCase()}
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `
    };
}

export function generateForgotPasswordMail(resetPasswordUrl: string) {
    const nom = 'CASA';
    const year = new Date().getFullYear();

    return {
        text: `Bonjour, réinitialisez votre mot de passe ici : ${resetPasswordUrl}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #121212; color: #ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px; background-color: #121212;">
                <tr>
                    <td align="center">
                        <table width="100%" style="max-width: 600px; background-color: #1e1e1e; border-radius: 16px; overflow: hidden; border: 1px solid #333333;">
                            <tr>
                                <td style="padding: 40px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Mot de passe oublié ?</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 0 40px 40px 40px;">
                                    <p style="color: #a1a1aa; font-size: 16px;">Cliquez ci-dessous pour définir un nouveau mot de passe pour votre compte <strong>${nom}</strong>.</p>
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" style="padding: 30px 0;">
                                                <a href="${resetPasswordUrl}" style="background: #ffffff; color: #000000; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 700;">
                                                    Réinitialiser le mot de passe
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 20px; text-align: center; background-color: #1a1a1a;">
                                    <p style="color: #52525b; font-size: 12px; margin: 0;">© ${year} ${nom}</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `
    };
}
