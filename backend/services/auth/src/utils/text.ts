export function generateMail(lastname: string, verificationUrl: string)
{
	const nom = 'e-varotra';
	return(
	{
	text: `
		Bonjour ${lastname},

		Bienvenue sur ${nom} !

		Pour finaliser votre inscription et sécuriser votre compte, veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :

		${verificationUrl}

		Ce lien est valide pendant 24 heures.

		Si vous n'avez pas créé de compte sur notre plateforme, vous pouvez ignorer cet email en toute sécurité.

		Cordialement,
		L'équipe ${nom}
		`,
	html: `
	<!DOCTYPE html>
	<html>
		<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		</head>
		<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
		<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
			<tr>
			<td align="center">
				<table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
				
				<!-- Header -->
				<tr>
					<td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
					<h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
						Bienvenue ! 👋
					</h1>
					</td>
				</tr>
				
				<!-- Content -->
				<tr>
					<td style="padding: 40px 30px;">
					<p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
						Bonjour <strong>${lastname}</strong>,
					</p>
					
					<p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
						Merci de vous être inscrit sur <strong>${nom}</strong> ! Nous sommes ravis de vous compter parmi nous.
					</p>
					
					<p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
						Pour finaliser votre inscription et sécuriser votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :
					</p>
					
					<!-- CTA Button -->
					<table width="100%" cellpadding="0" cellspacing="0">
						<tr>
						<td align="center" style="padding: 20px 0;">
							<a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
							Confirmer mon email
							</a>
						</td>
						</tr>
					</table>
					
					<p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
						<strong>Le bouton ne fonctionne pas ?</strong><br>
						Copiez et collez ce lien dans votre navigateur :<br>
						<a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
					</p>
					
					<p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 20px 0 0 0;">
						⏱️ Ce lien est valide pendant <strong>24 heures</strong>.
					</p>
					</td>
				</tr>
				
				<!-- Footer -->
				<tr>
					<td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
					<p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 0 0 10px 0;">
						Si vous n'avez pas créé de compte sur notre plateforme, vous pouvez ignorer cet email en toute sécurité.
					</p>
					<p style="color: #999999; font-size: 13px; margin: 0;">
						© ${new Date().getFullYear()} ${nom}. Tous droits réservés.
					</p>
					</td>
				</tr>
				
				</table>
			</td>
			</tr>
		</table>
		</body>
	</html>
  `});
}
