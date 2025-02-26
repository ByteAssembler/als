import { useEffect, useState } from "react";
import { languages } from "../data/languages";

// Remove the line causing the error as it is not used in the component


const LanguageSwitcher = () => {
    const [currentUrl, setCurrentUrl] = useState<string>("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setCurrentUrl(window.location.href);
        }
    }, []);

    const getUpdatedUrl = (newLang: string): string => {
        const urlParts = currentUrl.split("/");
        for (let i = 0; i < urlParts.length; i++) {
            languages.forEach((lang) => {
                if (lang.code === urlParts[i]) {
                    urlParts[i] = newLang;
                }
            });
        }
        return urlParts.join("/");
    };

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 font-medium text-gray-700 hover:text-primary-600">
                🌍 Sprache wählen
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            <div className="absolute z-50 mt-2 w-48 rounded-md bg-white py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                {languages.map((lang) => (
                    <a
                        key={lang.code}
                        href={getUpdatedUrl(lang.code)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        {lang.flag} {lang.label}
                    </a>
                ))}
            </div>
        </div>
    );
};

export default LanguageSwitcher;
