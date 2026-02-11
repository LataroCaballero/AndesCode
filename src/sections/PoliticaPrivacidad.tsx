export default function PoliticaPrivacidad() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="max-w-2xl w-full dark:text-white text-ink">
        <h1 className="text-3xl fira-code-bold mb-8">
          Política de Privacidad
        </h1>
        <div className="space-y-6 text-base leading-relaxed">
          <p>
            Esta aplicación utiliza la API de WhatsApp Business para comunicarse con los usuarios.
          </p>

          <div>
            <h2 className="text-xl fira-code-semibold mb-2">Datos recopilados:</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Número de teléfono</li>
              <li>Mensajes enviados por el usuario</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl fira-code-semibold mb-2">Uso de los datos:</h2>
            <p>
              Los datos se utilizan únicamente para responder mensajes y brindar atención automatizada.
            </p>
          </div>

          <div>
            <h2 className="text-xl fira-code-semibold mb-2">Almacenamiento:</h2>
            <p>Los datos pueden almacenarse temporalmente con fines operativos.</p>
          </div>

          <div>
            <h2 className="text-xl fira-code-semibold mb-2">Eliminación de datos:</h2>
            <p>
              Los usuarios pueden solicitar la eliminación de sus datos escribiendo a:{" "}
              <a href="mailto:santinahuelmedina@hotmail.com" className="text-primary hover:underline">
                santinahuelmedina@hotmail.com
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-xl fira-code-semibold mb-2">Contacto:</h2>
            <p>AndesCode</p>
            <p>
              Email:{" "}
              <a href="mailto:santinahuelmedina@hotmail.com" className="text-primary hover:underline">
                santinahuelmedina@hotmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
