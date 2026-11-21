import type { OrderConfirmation } from '../types'

/**
 * Envío de email con las entradas y códigos QR mediante SMTP (Nodemailer).
 * Llama a la ruta serverless `/api/send-email` tanto en desarrollo local como en producción (Vercel).
 * Diseño 100% responsive, compatible con Modo Claro y Modo Oscuro en Gmail, Apple Mail, Outlook y webmail.
 */
export async function sendTicketsEmail(
  confirmation: OrderConfirmation,
  qrDataUrls: Record<string, string>
): Promise<{ success: boolean; message: string; messageId?: string }> {
  try {
    const attachments: Array<{
      filename: string
      path: string
      cid: string
    }> = []

    const EVENT_DATE_FORMATTED = 'Lunes 14 de Diciembre de 2026 · 20:00 hs'
    const EVENT_VENUE_FORMATTED = 'Camping del Club Andes Talleres'

    const ticketsHtml = confirmation.tickets.map((t, idx) => {
      const cidName = `qr-ticket-${idx}-${t.qrToken.slice(0, 8)}`
      const qrDataUrl = qrDataUrls[t.qrToken]

      if (qrDataUrl) {
        attachments.push({
          filename: `ticket-${t.ticketNumber}.png`,
          path: qrDataUrl,
          cid: cidName,
        })
      }

      const qrImageSrc = qrDataUrl ? `cid:${cidName}` : ''

      const isPlayer =
        t.isPlayer === true ||
        t.role === 'jugador' ||
        t.ticketNumber === 'JUGADOR' ||
        t.ticketNumber === 'JUGADOR/PROFE' ||
        t.ticketNumber === 'Sin sorteo' ||
        /jugador|profe|profesor/i.test(t.attendeeName)

      const isChild =
        t.role === 'menor' ||
        t.ticketNumber === 'MENOR' ||
        /menor/i.test(t.attendeeName)

      // Colores y badges por tipo de entrada
      let badgeBg = '#d97706'
      let badgeTextColor = '#ffffff'
      let badgeLabel = `🎟️ ENTRADA N° ${t.ticketNumber.replace(/^N°\s*/i, '')} · SORTEO`
      let badgeSub = 'Número oficial para el gran sorteo'
      let accentBorderColor = '#f59e0b'

      if (isPlayer) {
        badgeBg = '#059669'
        badgeTextColor = '#ffffff'
        badgeLabel = '🏀 JUGADORA / PROFE'
        badgeSub = 'Acceso bonificado por el club'
        accentBorderColor = '#10b981'
      } else if (isChild) {
        badgeBg = '#0284c7'
        badgeTextColor = '#ffffff'
        badgeLabel = '👶 MENOR DE 3 AÑOS'
        badgeSub = 'Entrada bonificada sin costo'
        accentBorderColor = '#38bdf8'
      }

      return `
        <!-- TICKET CARD PASS #${idx + 1} -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #0f1c2e; border: 1px solid #1e3552; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.3);">
          <!-- Encabezado de la entrada -->
          <tr>
            <td style="background-color: ${badgeBg}; padding: 12px 18px; border-bottom: 2px solid ${accentBorderColor};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left">
                    <span style="color: ${badgeTextColor}; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                      ${badgeLabel}
                    </span>
                    <span style="display: block; color: rgba(255,255,255,0.85); font-size: 11px; margin-top: 2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                      ${badgeSub}
                    </span>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="background-color: rgba(0,0,0,0.25); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; font-family: monospace;">
                      #${String(idx + 1).padStart(2, '0')}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cuerpo de datos del asistente -->
          <tr>
            <td style="padding: 18px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom: 8px;">
                    <span style="color: #8a9ab5; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                      Asistente
                    </span>
                    <strong style="color: #ffffff; font-size: 16px; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; display: block; margin-top: 2px;">
                      ${t.attendeeName}
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 6px;">
                    <span style="color: #8a9ab5; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                      📅 <b>Fecha:</b> <span style="color: #e2e8f0;">${t.date || EVENT_DATE_FORMATTED}</span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px;">
                    <span style="color: #8a9ab5; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                      📍 <b>Lugar:</b> <span style="color: #e2e8f0;">${t.venue || EVENT_VENUE_FORMATTED}</span>
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Línea punteada de corte / perforación -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 6px 0 16px;">
                <tr>
                  <td style="border-top: 2px dashed #223854; font-size: 1px; line-height: 1px;">&nbsp;</td>
                </tr>
              </table>

              <!-- Contenedor del código QR -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <div style="background-color: #ffffff; border-radius: 12px; padding: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.4); text-align: center;">
                      ${qrImageSrc ? `<img src="${qrImageSrc}" alt="Código QR Entrada ${t.ticketNumber}" width="180" height="180" style="display: block; margin: 0 auto; width: 180px; height: 180px; border: 0;" />` : '<p style="color:#0f172a; margin: 20px; font-family: sans-serif;">Código QR listo</p>'}
                      <div style="margin-top: 8px; color: #0f172a; font-family: monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">
                        TOKEN: ${t.qrToken.slice(0, 16)}...
                      </div>
                    </div>
                    <span style="display: block; color: #64748b; font-size: 11px; margin-top: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                      Mostrá este código desde la pantalla de tu celular en la entrada
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `
    }).join('')

    const orderIdClean = confirmation.orderId.replace(/^#/, '')

    const htmlContent = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>Tus Entradas - Andes Talleres Básquet Femenino</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a, strong { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      -webkit-text-size-adjust: 100% !important;
      -ms-text-size-adjust: 100% !important;
    }
    img {
      border: 0 !important;
      outline: none !important;
      text-decoration: none !important;
    }
    @media (prefers-color-scheme: dark) {
      .bg-outer { background-color: #040810 !important; }
      .bg-inner { background-color: #0a1320 !important; border-color: #1a2a40 !important; }
    }
    @media screen and (max-width: 600px) {
      .responsive-table { width: 100% !important; }
      .mobile-padding { padding: 18px 14px !important; }
      .mobile-title { font-size: 20px !important; }
    }
  </style>
</head>
<body class="bg-outer" style="margin: 0; padding: 0; background-color: #070e1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg-outer" style="background-color: #070e1a; width: 100%; margin: 0; padding: 20px 0;">
    <tr>
      <td align="center" style="padding: 10px;">
        <!-- TABLA CONTENEDORA PRINCIPAL (MAX 600px) -->
        <table role="presentation" class="responsive-table bg-inner" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #0b1726; border: 1px solid #1a2d47; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- BANNER DE ENCABEZADO CLUB MATADOR -->
          <tr>
            <td style="background: linear-gradient(135deg, #070e1a 0%, #0d1e33 60%, #8b121e 100%); background-color: #0d1e33; padding: 28px 24px 22px; text-align: center; border-bottom: 3px solid #d92736;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Badge del club -->
                    <span style="display: inline-block; background-color: rgba(217, 39, 54, 0.2); border: 1px solid rgba(217, 39, 54, 0.5); color: #ff6874; font-size: 11px; font-weight: 800; letter-spacing: 1px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      🏀 BÁSQUET FEMENINO · CIERRE 2026
                    </span>
                    <h1 class="mobile-title" style="margin: 6px 0 2px; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      ANDES TALLERES <span style="color: #d92736;">SPORT CLUB</span>
                    </h1>
                    <p style="margin: 0; color: #8a9ab5; font-size: 13px; font-weight: 500;">
                      Cena de Fin de Año y Premiación
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CUERPO PRINCIPAL DEL EMAIL -->
          <tr>
            <td class="mobile-padding" style="padding: 28px 26px;">
              <!-- Saludo y Confirmación -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom: 16px;">
                    <h2 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">
                      ¡Hola, ${confirmation.buyer.fullName}! 👋
                    </h2>
                    <p style="margin: 6px 0 0; color: #c2cad7; font-size: 14px; line-height: 1.5;">
                      Tu pedido está <b>confirmado</b>. Acá tenés tus entradas y códigos QR oficiales para el ingreso al evento:
                    </p>
                  </td>
                </tr>
              </table>

              <!-- TARJETA RESUMEN DE LA ORDEN -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0f1c2e; border: 1px solid #1c324e; border-radius: 10px; margin-bottom: 24px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="left">
                          <span style="color: #8a9ab5; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">PEDIDO</span>
                          <div style="color: #ff6874; font-size: 15px; font-weight: 800; font-family: monospace; margin-top: 1px;">#${orderIdClean}</div>
                        </td>
                        <td align="right">
                          <span style="color: #8a9ab5; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">TOTAL</span>
                          <div style="color: #10b981; font-size: 15px; font-weight: 800; margin-top: 1px;">$ ${confirmation.totalArs.toLocaleString('es-AR')}</div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 12px; border-top: 1px solid #1a2d47; margin-top: 8px;">
                          <div style="font-size: 12px; color: #c2cad7; line-height: 1.5;">
                            📍 <b>Lugar:</b> Camping del Club Andes Talleres<br />
                            📅 <b>Fecha:</b> Lunes 14 de Diciembre de 2026 · 20:00 hs<br />
                            🎟️ <b>Cantidad de entradas:</b> ${confirmation.quantity}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ENTRADAS INDIVIDUALES CON QR -->
              ${ticketsHtml}

              <!-- AVISO DE ACCESO Y PUERTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <div style="color: #38bdf8; font-size: 13px; font-weight: 700; margin-bottom: 4px;">
                      📲 ¿Cómo ingresar el día de la cena?
                    </div>
                    <div style="color: #cbd5e1; font-size: 12px; line-height: 1.5;">
                      En la puerta de acceso al camping, abrí este correo desde tu celular o guardá las imágenes de los códigos QR. El personal de recepción escaneará tu código para darte el ingreso al predio.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- AVISO DE SPAM / BANDEJA PRINCIPAL -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(251, 191, 36, 0.08); border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 10px; margin-bottom: 10px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <div style="color: #fbbf24; font-size: 13px; font-weight: 700; margin-bottom: 4px;">
                      ⭐ Consejo para no perder tus entradas
                    </div>
                    <div style="color: #cbd5e1; font-size: 12px; line-height: 1.5;">
                      Si este correo te llegó a <i>Promociones</i> o <i>Spam</i>, marcalo como <b>"Importante"</b> o movelo a la <b>Bandeja Principal</b> para tenerlo siempre a mano cuando llegues al club.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PIE DE PÁGINA -->
          <tr>
            <td style="background-color: #070e1a; padding: 22px 24px; text-align: center; border-top: 1px solid #1a2d47;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px; font-weight: 600;">
                Andes Talleres Sport Club · Subcomisión de Básquet Femenino
              </p>
              <p style="margin: 4px 0 0; color: #586a85; font-size: 11px;">
                Cena de Fin de Año 2026 · Camping del Club Andes Talleres
              </p>
              <p style="margin: 8px 0 0; color: #475569; font-size: 11px;">
                Este correo fue enviado de forma automática tras registrarse tu orden. Si tenés dudas, contactanos al WhatsApp oficial del evento.
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

    // Enviar solicitud a la ruta serverless de Node
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: confirmation.buyer.email,
        subject: `🏀 Tus Entradas QR - Cena Básquet Femenino ATSC (#${orderIdClean.slice(0, 8)})`,
        html: htmlContent,
        attachments,
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => null)
      const errorMsg =
        errData?.error ||
        (response.status === 500
          ? 'Error 500 en Vercel al despachar el correo. Verificá que las variables SMTP (SMTP_USER, SMTP_PASS) estén configuradas en Vercel y hacé un Redeploy.'
          : `Error en el servidor al despachar correo (Status ${response.status})`)
      console.error('[SMTP Client Error]:', errorMsg)
      return {
        success: false,
        message: errorMsg,
      }
    }

    const data = await response.json()
    if (data.success) {
      return {
        success: true,
        message: `Correo enviado exitosamente a ${confirmation.buyer.email} vía SMTP.`,
        messageId: data.messageId,
      }
    } else {
      const errorMsg = data.error || 'No se pudo enviar el correo vía SMTP'
      console.warn('[SMTP Warning]:', errorMsg)
      return {
        success: false,
        message: errorMsg,
      }
    }
  } catch (err: any) {
    const safeError = err?.message || 'Error de conexión con el servicio de correo'
    console.error('[SMTP Client Exception]:', safeError)
    return {
      success: false,
      message: safeError,
    }
  }
}

// Alias para compatibilidad con llamadas existentes
export const sendTicketsEmailWithResend = sendTicketsEmail
