import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { LANGUAGE_VERSIONS, CODE_SNIPPETS } from "../constants";
import LanguageSelector from "./LanguageSelector";
import { useSocket } from "../Socket";

function CodeEditor({
    content,
    language,
    onContentChange,
    onLanguageChange,
    roomId,
}) {
    const editorRef = useRef();
    const socket = useSocket();
    const [lang, setLang] = useState(language);
    const [code, setCode] = useState(content);

    const onMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    };

    const onSelect = (lang) => {
        // setLang(lang);
        // setCode(CODE_SNIPPETS[lang]);
        // socket.emit("langChange", { lang, roomId });
        onLanguageChange(lang);
    };

    // const handleCodeChange = (code) => {
    //     setCode(code);
    //     socket.emit("codeChange", { code, roomId });
    // };

    const onCodeChange = (code) => {
        onContentChange(code);
    };

    useLayoutEffect(() => {
        setCode(CODE_SNIPPETS[lang]);
    }, []);

    useEffect(() => {
        socket.on("langChange", (lang) => {
            setLang(lang);
            setCode(CODE_SNIPPETS[lang]);
        });

        socket.on("codeUpdate", (newCode) => {
            console.log("hi i am other person of the room");
            setCode(newCode);
        });

        return () => {
            socket.off("codeUpdate");
            socket.off("langChange");
        };
    }, [code]);

    return (
        <div className="p-4 bg-zinc-950 rounded-md border-2">
            <LanguageSelector language={lang} onSelect={onSelect} />
            <Editor
                height="85vh"
                theme="vs-dark"
                language={language}
                defaultValue={CODE_SNIPPETS[language]}
                onMount={onMount}
                value={code}
                onChange={onCodeChange}
                options={{
                    fontSize: 14,
                }}
            />
        </div>
    );
}

export default CodeEditor;
