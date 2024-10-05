import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./reducers/user";
import menuSlice from "./reducers/menuSlice";
import toolboxSlice from "./reducers/toolboxSlice";
import editorSlice from "./reducers/editorSlice";

const store = configureStore({
    reducer: {
        [userSlice.name]: userSlice.reducer,
        [menuSlice.name]: menuSlice.reducer,
        [toolboxSlice.name]: toolboxSlice.reducer,
        editor: editorSlice,
    },
});

export default store;
