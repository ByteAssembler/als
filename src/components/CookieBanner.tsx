import { useState, useEffect } from "react";

interface CookieConsent {
    general: boolean;
    tracking: boolean;
    showAgain: boolean;
}

export default function CookieBanner() {
    const [accepted, setAccepted] = useState<boolean>(false);
    const [showAgain, setShowAgain] = useState<boolean>(true);
    const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

    useEffect(() => {
        const storedConsent = localStorage.getItem("cookieConsent");
        if (storedConsent) {
            const consent: CookieConsent = JSON.parse(storedConsent);
            setAccepted(consent.general);
            setShowAgain(consent.showAgain !== false);
            if (consent.showAgain === false) setSettingsSaved(true);
        }
    }, []);

    const saveConsent = (general: boolean, tracking: boolean, showAgain: boolean) => {
        const consent: CookieConsent = { general, tracking, showAgain };
        localStorage.setItem("cookieConsent", JSON.stringify(consent));
        document.cookie = `cookieConsent=${JSON.stringify(consent)}; path=/; max-age=31536000`;
        setAccepted(general);
        setSettingsSaved(true);
    };

    if (settingsSaved) return null;

    return (
        <div className="z-[9999] fixed bottom-4 left-4 right-4 flex flex-col rounded-xl bg-[#1E2A3A] p-6 text-white shadow-xl md:flex-row md:items-center md:justify-between">
            <p className="mb-3 md:mb-0 text-lg">
                Diese Website verwendet Cookies. Mehr Infos in unserer{' '}
                <a href="/datenschutz" className="underline text-blue-400 hover:text-blue-300">
                    Datenschutzerklärung
                </a>.
            </p>
            <div className="flex flex-col">
                <label className=" my-2 flex items-center gap-2">

                    Dieses Banner in Zukunft nicht mehr anzeigen
                    <input
                        type="checkbox"
                        checked={!showAgain}
                        onChange={(e) => setShowAgain(!e.target.checked)}
                        className="w-5 h-5 accent-blue-500 cursor-pointer "
                    />
                </label>
                <div className="flex gap-2">
                    <button
                        onClick={() => saveConsent(true, true, showAgain)}
                        className="rounded-lg bg-blue-500 px-5 py-2 font-semibold text-white hover:bg-blue-600"
                    >
                        Alle akzeptieren
                    </button>
                    <button
                        onClick={() => saveConsent(true, false, showAgain)}
                        className="rounded-lg bg-gray-600 px-5 py-2 font-semibold text-white hover:bg-gray-700"
                    >
                        Nur essenzielle akzeptieren
                    </button>
                </div>
            </div>


        </div>
    );
}
