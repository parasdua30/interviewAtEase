import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    content: "",
    language: "cpp",
};

export const editorSlice = createSlice({
    name: "editor",
    initialState,
    reducers: {
        setEditorContent: (state, action) => {
            state.content = action.payload;
        },
        setEditorLanguage: (state, action) => {
            state.language = action.payload;
        },
    },
});

export const { setEditorContent, setEditorLanguage } = editorSlice.actions;

export default editorSlice.reducer;
