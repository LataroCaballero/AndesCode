import { useState, useEffect } from 'react';
import { whatsappUrl, trackCta } from '../lib/cta';

export default function ContactForm () {
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const referrer = typeof document !== 'undefined' ? document.referrer || 'direct' : 'unknown';

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
                trackCta('form_submit', { source: 'contacto' });
            } else {
                setError(true);
            }
        } catch (err) {
            setError(true);
        }
    };

    return (
        <div className="relative">
            {/* Mensaje de éxito */}
            {success && (
                <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 duration-500">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg shadow-2xl border border-green-400/20">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
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
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-lg shadow-2xl border border-red-400/20">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <div>
                                <p className="font-medium text-sm">Error al enviar el formulario</p>
                                <p className="text-red-100 text-xs mt-1">Inténtalo nuevamente</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        <section className="relative grid-bg pt-36 pb-20 px-4 overflow-hidden">
            <div className="max-w-xl mx-auto">
                <span className="block text-center text-xs uppercase tracking-widest text-[#4342FF] font-semibold mb-3">Contacto</span>
                <h1 className="text-center font-bold text-3xl md:text-4xl mb-4 text-[#191919]">
                    El primer paso es una conversación
                </h1>
                <p className="text-center text-base text-gray-600 mb-10">
                    Contanos qué problema querés resolver. En 48hs te respondemos con ideas concretas.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5 bg-white rounded-xl border border-gray-100 p-8 shadow-[0_4px_32px_rgba(67,66,255,0.08)]"
                >
                    <input type="hidden" name="_subject" value="Nuevo lead desde andescode.com.ar" />
                    <input type="hidden" name="source_page" value="/contacto" />
                    <input type="hidden" name="referrer" value={referrer} />
                    <label className="flex flex-col">
                        <span className="text-sm font-medium text-[#191919] mb-1.5">Nombre Completo</span>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="Juan Pérez"
                            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#4342FF] focus:ring-2 focus:ring-[#4342FF]/20 transition"
                        />
                    </label>

                    <label className="flex flex-col">
                        <span className="text-sm font-medium text-[#191919] mb-1.5">Tu Email</span>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="juanperez@gmail.com"
                            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#4342FF] focus:ring-2 focus:ring-[#4342FF]/20 transition"
                        />
                    </label>

                    <label className="flex flex-col">
                        <span className="text-sm font-medium text-[#191919] mb-1.5">Nombre del Proyecto</span>
                        <input
                            type="text"
                            name="projectName"
                            required
                            placeholder="JuanPe Corp."
                            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#4342FF] focus:ring-2 focus:ring-[#4342FF]/20 transition"
                        />
                    </label>

                    <label className="flex flex-col">
                        <span className="text-sm font-medium text-[#191919] mb-1.5">Presupuesto estimado</span>
                        <select
                            name="budget"
                            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#4342FF] focus:ring-2 focus:ring-[#4342FF]/20 transition bg-white"
                        >
                            <option value="">Seleccioná una opción</option>
                            <option value="menos-500k">Menos de $500.000</option>
                            <option value="500k-2m">$500.000 – $2.000.000</option>
                            <option value="mas-2m">Más de $2.000.000</option>
                            <option value="no-se">No sé aún</option>
                        </select>
                    </label>

                    <label className="flex flex-col">
                        <span className="text-sm font-medium text-[#191919] mb-1.5">¿Con qué urgencia lo necesitás?</span>
                        <select
                            name="urgency"
                            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#4342FF] focus:ring-2 focus:ring-[#4342FF]/20 transition bg-white"
                        >
                            <option value="">Seleccioná una opción</option>
                            <option value="ya">Lo necesito ya</option>
                            <option value="3meses">En los próximos 3 meses</option>
                            <option value="explorando">Solo estoy explorando</option>
                        </select>
                    </label>

                    <label className="flex flex-col">
                        <span className="text-sm font-medium text-[#191919] mb-1.5">Mensaje / Idea / Consulta</span>
                        <textarea
                            name="message"
                            required
                            placeholder="Contanos qué problema querés resolver"
                            rows={5}
                            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#4342FF] focus:ring-2 focus:ring-[#4342FF]/20 transition resize-none"
                        />
                    </label>

                    <button
                        type="submit"
                        className="btn-primary py-3 px-6 rounded-lg text-sm transition"
                    >
                        Enviar mensaje
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-gray-200 text-center">
                    <p className="text-sm font-semibold mb-4 text-[#191919]">¿Preferís hablar directamente?</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href={whatsappUrl('contacto-page')}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackCta('cta_whatsapp', { source: 'contacto-page' })}
                            className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition hover:-translate-y-0.5 shadow-sm"
                        >
                            📱 Escribinos por WhatsApp
                        </a>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">📍 San Juan, Argentina</p>
                </div>
            </div>
        </section>
        </div>
    )
}
