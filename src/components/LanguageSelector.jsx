import { useState, useEffect, useRef } from "react";
import { LANGUAGE_VERSIONS } from "../constants";

const languages = Object.entries(LANGUAGE_VERSIONS);
const ACTIVE_COLOR = "text-blue-400";

const LanguageSelector = ({ language, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null); // Ref to track the dropdown element

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (lang) => {
        onSelect(lang);
        setIsOpen(false);
    };

    const handleClickOutside = (event) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target)
        ) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="ml-2 mb-4" ref={dropdownRef}>
            <div className="relative">
                <p className="mb-2 text-lg font-semibold">
                    Language:
                    <button
                        onClick={toggleDropdown}
                        className="ml-2 px-2 py-2 bg-gray-700 text-white rounded-md shadow-md focus:outline-none"
                    >
                        {language}
                    </button>
                </p>

                {isOpen && (
                    <ul className="absolute z-10 mt-2 w-fit border-2 border-gray-400 bg-gray-800 rounded-md shadow-lg">
                        {languages.map(([lang, version]) => (
                            <li
                                key={lang}
                                className={`px-4 py-2 cursor-pointer hover:bg-gray-700 ${
                                    lang === language ? "bg-gray-900" : ""
                                }`}
                                onClick={() => handleSelect(lang)}
                            >
                                <span
                                    className={`${
                                        lang === language ? ACTIVE_COLOR : ""
                                    }`}
                                >
                                    {lang}
                                </span>
                                <span className="text-gray-500 ml-2 text-sm">
                                    ({version})
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default LanguageSelector;
