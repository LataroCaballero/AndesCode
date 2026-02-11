export default function EliminacionDatos() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="max-w-2xl w-full dark:text-white text-ink">
        <h1 className="text-3xl fira-code-bold mb-8">
          Eliminación de datos de usuario
        </h1>
        <div className="space-y-4 text-base leading-relaxed">
          <p>
            Si deseas eliminar tus datos asociados a esta aplicación,
            envía un correo a:
          </p>
          <p>
            <a
              href="mailto:santinahuelmedina@hotmail.com"
              className="text-primary hover:underline"
            >
              santinahuelmedina@hotmail.com
            </a>
          </p>
          <p>Indicando tu número de teléfono.</p>
        </div>
      </div>
    </section>
  );
}
