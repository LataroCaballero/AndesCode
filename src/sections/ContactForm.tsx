import { useState, useEffect } from 'react';

export default function ContactForm () {
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (success) {
          const timer = setTimeout(() => setSuccess(false), 4000);
          return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
          const timer = setTimeout(() => setError(false), 4000);
          return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);

        try {
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
            } else {
                setError(true);
            }
        } catch (error) {
            setError(true);
        }
    };

    return (
        <div className="relative">
            {/* Mensaje de éxito */}
            {success && (
                <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 duration-500">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg shadow-2xl border border-green-400/20 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-sm">¡Formulario enviado con éxito!</p>
                                <p className="text-green-100 text-xs mt-1">Te contactaremos pronto</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mensaje de error */}
            {error && (
                <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 duration-500">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-lg shadow-2xl border border-red-400/20 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-sm">Error al enviar el formulario</p>
                                <p className="text-red-100 text-xs mt-1">Inténtalo nuevamente</p>
                            </div>
                        </div>
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
                    className="bg-[#191919] text-white dark-button py-2 px-6 rounded transition"
                >
                    Enviar
                </button>
            </form>
        </section>
        </div>
    )
}