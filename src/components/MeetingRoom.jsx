import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useState,
} from "react";
import toast from "react-hot-toast";
import VideoCall from "./VideoCall";
import CodeEditor from "./CodeEditor";
import WhiteBoard from "./WhiteBoard";
import Options from "./Options";
import { useSocket } from "../Socket";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import peer from "../../service/peer";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";
import { setUsername } from "../redux/reducers/user";
import {
    setEditorContent,
    setEditorLanguage,
} from "../redux/reducers/editorSlice";

// import { setRemoteSocketId } from "../redux/reducers/user";

function MeetingRoom() {
    const socket = useSocket();
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const [selectedOption, setSelectedOption] = useState("editor");

    const roomId = params.roomId;

    const { state } = useLocation();
    const myName = state?.username;
    const [message, setMessage] = useState(null);

    const editorContent = useSelector((state) => state.editor.content);
    const editorLanguage = useSelector((state) => state.editor.language);

    // const [editorContent, setEditorContent] = useState(""); // State for editor
    const [whiteboardData, setWhiteboardData] = useState(null); // State for whiteboard

    // console.log("Meeting room EditorContent", editorContent);

    // Connection Purposes
    // const remoteSocketId = useSelector((state) => state.user.remoteSocketId);
    const [remoteSocketId, setRemoteSocketId] = useState(null);

    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const handleOptionClick = (option) => {
        setSelectedOption(option);
    };

    const handleLeaveRoom = useCallback(() => {
        socket.emit("leave:room", { roomId, username: myName });
        navigate("/");
    }, [navigate]);

    // Joining Room
    useLayoutEffect(() => {
        console.log("RemoteSocketID", remoteSocketId);
        socket.emit("room:join", {
            roomId,
            myName,
        });
    }, [roomId, myName]);

    const handleResponseOnJoin = useCallback(
        (arg) => {
            console.log(
                "Join Ke Baad Ka Response hai, ab jo baad wala hai uski remote id set kari hai",
                arg
            );
            setRemoteSocketId(arg.id);
            handleEditorIndicator({ fellowUsername: arg.otherUserName });
            dispatch(setEditorContent(arg.editorContent));
            dispatch(setEditorLanguage(arg.currentLanguage));
        },
        [navigate]
    );

    useEffect(() => {
        socket.on("room:join", handleResponseOnJoin);
        return () => {
            socket.off("room:join", handleResponseOnJoin);
        };
    }, [socket, handleResponseOnJoin]);

    // Person who joined room
    const handleUserJoined = useCallback(({ username, id }) => {
        console.log(
            `handleUserJoined, User: ${username}, and SocketId: ${id} joined room`
        );
        toast.success(`${username} Joined the room.`);
        setRemoteSocketId(id);
        handleEditorIndicator({ fellowUsername: username });
    }, []);

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        const offer = await peer.getOffer();
        socket.emit("user:call", { to: remoteSocketId, offer });
        setMyStream(stream);
    }, [remoteSocketId, socket]);

    const handleIncommingCall = useCallback(
        async ({ from, offer }) => {
            setRemoteSocketId(from);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            setMyStream(stream);

            console.log(`Incoming Call`, from, offer);
            const ans = await peer.getAnswer(offer);
            socket.emit("call:accepted", { to: from, ans });
        },
        [socket]
    );

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    }, [myStream]);

    const handleCallAccepted = useCallback(
        ({ from, ans }) => {
            peer.setLocalDescription(ans);
            console.log("Call Accepted!");
            sendStreams();
        },
        [sendStreams]
    );

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);

    // telling other person about what i am using.
    useEffect(() => {
        if (selectedOption === "whiteboard") {
            socket.emit("using:whiteboard", {
                fellowUsername: myName,
                roomId: params.roomId,
            });
        } else if (selectedOption === "editor") {
            socket.emit("using:editor", {
                fellowUsername: myName,
                roomId: params.roomId,
            });
        }
    }, [selectedOption]);

    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener(
                "negotiationneeded",
                handleNegoNeeded
            );
        };
    }, [handleNegoNeeded]);

    const handleNegoNeedIncomming = useCallback(
        async ({ from, offer }) => {
            const ans = await peer.getAnswer(offer);
            socket.emit("peer:nego:done", { to: from, ans });
        },
        [socket]
    );

    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
    }, []);

    const handleWhiteBoardIndicator = ({ fellowUsername, id }) => {
        console.log(fellowUsername, " ", id);
        setMessage(`${fellowUsername} is using whiteboard`);
        // socket.emit("using:whiteboard", { fellowUsername: myName });
    };

    const handleEditorIndicator = ({ fellowUsername }) => {
        setMessage(`${fellowUsername} is using editor`);
        // socket.emit("using:editor", { fellowUsername: myName });
    };

    useEffect(() => {
        peer.peer.addEventListener("track", async (ev) => {
            const remoteStream = ev.streams;
            console.log("GOT TRACKS!!");
            setRemoteStream(remoteStream[0]);
        });
    }, []);

    const handleUserLeftRoom = ({ name }) => {
        console.log(name, "left the room");
        try {
            toast.error(`${name} left the room.`);
        } catch (error) {
            console.error("Error showing toast:", error);
        }
    };

    const handleCodeChange = (newContent) => {
        // console.log("handle code change meeting room wala");
        dispatch(setEditorContent(newContent));
        socket.emit("codeChange", { code: newContent, roomId: params.roomId });
    };

    const handleLanguageChange = (newLanguage) => {
        dispatch(setEditorLanguage(newLanguage));
        socket.emit("langChange", {
            language: newLanguage,
            roomId: params.roomId,
        });
    };

    // switch
    useEffect(() => {
        socket.on("editor:update", ({ content, language }) => {
            // console.log("It worked editor:update", myName, content);
            dispatch(setEditorContent(content));
            dispatch(setEditorLanguage(language));
        });

        // Request the latest editor state when component mounts
        socket.emit("editor:request", myName);

        return () => {
            socket.off("editor:update");
        };
    }, [socket, dispatch, selectedOption]);

    useEffect(() => {
        socket.on("user:joined", handleUserJoined);
        socket.on("incomming:call", handleIncommingCall);
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed", handleNegoNeedIncomming);
        socket.on("peer:nego:final", handleNegoNeedFinal);
        socket.on("userLeftRoom", handleUserLeftRoom);

        // whiteboard
        socket.on("fellow:using:whiteboard", handleWhiteBoardIndicator);
        socket.on("fellow:using:editor", handleEditorIndicator);

        return () => {
            socket.off("user:joined", handleUserJoined);
            socket.off("incomming:call", handleIncommingCall);
            socket.off("call:accepted", handleCallAccepted);
            socket.off("peer:nego:needed", handleNegoNeedIncomming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
            socket.off("userLeftRoom", handleUserLeftRoom);

            // whiteboard
            socket.off("fellow:using:whiteboard", handleWhiteBoardIndicator);
            socket.off("fellow:using:editor", handleEditorIndicator);
        };
    }, [
        socket,
        handleUserJoined,
        handleIncommingCall,
        handleCallAccepted,
        handleNegoNeedIncomming,
        handleNegoNeedFinal,
    ]);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="h-screen flex flex-row">
                {/* // Left Side */}
                <div className="bg-gray-800 h-5/5 w-1/5 rounded-lg border border-white text-white m-3">
                    <div className="flex flex-col h-full space-y-2 ">
                        {/* Top Buttons */}
                        <div className="flex justify-between w-full">
                            <button
                                className="bg-red-600 rounded m-1 p-2 transition-colors duration-300 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-white border border-white"
                                onClick={handleLeaveRoom}
                            >
                                Exit
                            </button>
                            <button
                                className="bg-gray-600 rounded m-1 p-2 transition-colors duration-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white border border-white"
                                onClick={() =>
                                    navigator.clipboard.writeText(params.roomId)
                                }
                            >
                                Copy Room Id
                            </button>
                        </div>

                        {/* Video Call */}
                        <h4>
                            {remoteSocketId ? "Connected" : "No one in room"}
                        </h4>
                        {myStream && (
                            <button
                                className="bg-gray-600 rounded m-2 p-2"
                                onClick={sendStreams}
                            >
                                Send Video Stream
                            </button>
                        )}
                        {remoteSocketId && (
                            <button
                                className="bg-gray-600 rounded m-2 p-2"
                                onClick={handleCallUser}
                            >
                                CALL
                            </button>
                        )}

                        <div className="flex flex-col items-center justify-evenly w-full">
                            {myStream && (
                                <>
                                    <h1>My Stream</h1>
                                    <ReactPlayer
                                        playing
                                        // muted
                                        height="250px"
                                        width="250px"
                                        url={myStream}
                                        style={{ transform: "scaleX(-1)" }}
                                    />
                                </>
                            )}
                        </div>
                        <div className="flex flex-col items-center justify-evenly w-full">
                            {remoteStream && (
                                <>
                                    <h1>Remote Stream</h1>
                                    <ReactPlayer
                                        playing
                                        // muted
                                        height="250px"
                                        width="250px"
                                        url={remoteStream}
                                        style={{ transform: "scaleX(-1)" }}
                                    />
                                </>
                            )}
                        </div>

                        {/* Bottom Options */}
                        <div className="fixed bottom-0 left-0 p-4 shadow-[0_-2px_4px_rgba(0,0,0,0.6)] ">
                            <Options
                                selectedOption={selectedOption}
                                onDataReceived={handleOptionClick}
                            />
                        </div>
                    </div>
                </div>

                {/* // Right Side */}

                {/* // Right Side */}
                {/* {selectedOption === "both" && (
                    <div className="w-4/5 flex flex-row">
                        <div className="bg-gray-800 w-1/2 rounded-lg border border-white text-white mt-3 mb-3 mr-3">
                            <Editor />
                        </div>
                        <div className="bg-gray-800 w-1/2 rounded-lg border border-white text-white mt-3 mb-3 mr-3">
                            <WhiteBoard />
                        </div>
                    </div>
                )} */}
                {selectedOption === "editor" && (
                    <div className="bg-gray-800 w-4/5 rounded-lg border border-white text-white mt-3 mb-3 mr-3 relative">
                        <CodeEditor
                            content={editorContent}
                            language={editorLanguage}
                            onContentChange={handleCodeChange}
                            onLanguageChange={handleLanguageChange}
                            roomId={remoteSocketId}
                        />
                        {message && remoteSocketId && (
                            <div className="absolute bottom-2 right-2 text-white">
                                <p className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                                    {message}
                                </p>
                            </div>
                        )}
                    </div>
                )}
                {selectedOption === "whiteboard" && (
                    <div className="bg-gray-800 w-4/5 rounded-lg border border-white text-white mt-3 mb-3 mr-3 relative">
                        <WhiteBoard
                            data={whiteboardData}
                            onDataChange={setWhiteboardData}
                        />
                        {message && remoteSocketId && (
                            <div className="absolute bottom-2 right-2 text-white">
                                <p className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                                    {message}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MeetingRoom;
