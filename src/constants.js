const COLORS = {
    BLACK: "black",
    RED: "red",
    GREEN: "green",
    BLUE: "blue",
    ORANGE: "orange",
    YELLOW: "yellow",
    WHITE: "white",
};

const MENU_ITEMS = {
    PENCIL: "PENCIL",
    ERASER: "ERASER",
    UNDO: "UNDO",
    REDO: "REDO",
    DOWNLOAD: "DOWNLOAD",
    CLEAR: "CLEAR",
};

const LANGUAGE_VERSIONS = {
    javascript: "18.15.0",
    python: "3.10.0",
    java: "15.0.2",
    cpp: "11.0",
};

const CODE_SNIPPETS = {
    javascript: `function greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
    python: `def greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,
    java: `public class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n\tcout << "Hello World" << endl;\n\treturn 0;\n}`,
};

export { COLORS, MENU_ITEMS, LANGUAGE_VERSIONS, CODE_SNIPPETS };
