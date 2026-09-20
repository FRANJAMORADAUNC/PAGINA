export default async function handler(req, res) {
  // Permitir peticiones desde tu sitio en GitHub Pages
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }

  const { nombre, cantidad, telefono, codigoEntrada } = req.body;

  if (!telefono) {
    return res.status(400).json({ success: false, error: 'El número de teléfono es obligatorio.' });
  }

  // Formatear número para WhatsApp (ejemplo Argentina: 5493644XXXXXX@c.us)
  let telefonoLimpio = telefono.replace(/\D/g, '');
  if (!telefonoLimpio.startsWith('54')) {
    telefonoLimpio = '54' + telefonoLimpio;
  }
  
  const chatId = `${telefonoLimpio}@c.us`;

  const idInstance = process.env.GREEN_API_ID_INSTANCE;
  const apiTokenInstance = process.env.GREEN_API_TOKEN_INSTANCE;

  const mensajeBody = 
    `¡Hola ${nombre || 'Invitado/a'}! 🎟️\n\n` +
    `Tu acceso a *PEÑA FRANJA HOY* ha sido confirmado exitosamente.\n\n` +
    `📌 *Detalles del pase:*\n` +
    `• Cantidad: ${cantidad || 1} entrada(s) autorizada(s)\n` +
    `• Código de Precinto: ${codigoEntrada}\n` +
    `• Ubicación: Interior del Complejo Papa Francisco, Sáenz Peña\n\n` +
    `Presenta este mensaje junto con tu código QR en el acceso principal para validar tu entrada exclusiva.`;

  try {
    const response = await fetch(
      `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chatId,
          message: mensajeBody
        })
      }
    );

    const data = await response.json();

    if (data.idMessage) {
      return res.status(200).json({ success: true, idMessage: data.idMessage });
    } else {
      return res.status(500).json({ success: false, error: data });
    }
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
