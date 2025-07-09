import { useState, useEffect } from 'react';

export default function ContactForm () {
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (success) {
          const timer = setTimeout(() => setSuccess(false), 4000);
          return () => clearTimeout(timer);
        }
      }, [success]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);

        const response = await fetch('https://formspree.io/f/xldnyqdq', {
        method: 'POST',
        body: data,
        headers: {
            Accept: 'application/json',
        },
        });

        if (response.ok) {
        setSuccess(true);
        form.reset();
        }
    };
    return (
        <div className="relative">
            {success && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-accent text-ink fira-code-medium text-lg px-4 py-2 rounded shadow">
                    ¡Formulario enviado con éxito!
                    </div>
                </div>
            )}
        <section className="pt-30 py-20 px-4 min-h-screen">
            <h2 className="text-center fira-code-bold text-3xl md:text-4xl mb-4">
                ¿Querés hablarnos de tu idea?
            </h2>
            <p className="text-center text-md max-w-xl mx-auto mb-6">
                Estamos listos para ayudarte a dar el primer paso.
            </p>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 max-w-xl mx-auto"
                >
                <label className="flex flex-col">
                    <span className="text-sm mb-1">Nombre Completo</span>
                    <input
                    type="text"
                    name="name"
                    required
                    placeholder="Juan Pérez"
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </label>

                <label className="flex flex-col">
                    <span className="text-sm mb-1">Tu Email</span>
                    <input
                    type="email"
                    name="email"
                    required
                    placeholder="juanperez@gmail.com"
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </label>

                <label className="flex flex-col">
                    <span className="text-sm mb-1">Nombre del Proyecto</span>
                    <input
                    type="text"
                    name="projectName"
                    required
                    placeholder="JuanPe Corp."
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </label>

                <label className="flex flex-col">
                    <span className="text-sm mb-1">Mensaje / Idea / Consulta</span>
                    <textarea
                    name="message"
                    required
                    placeholder="Escribí tu mensaje acá"
                    rows={5}
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </label>

                <button
                    type="submit"
                    className="text-white py-2 px-6 rounded transition"
                >
                    Enviar
                </button>
            </form>
        </section>
        </div>
    )
}