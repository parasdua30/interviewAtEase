import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import "./Lobby.css";
import { useSocket } from "../Socket";
import Spline from "@splinetool/react-spline";
import "./spline-lap.css";

function Lobby() {
    const socket = useSocket();
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // generates new room id.
    const createNewRoom = async (e) => {
        e.preventDefault();
        const id = uuid().slice(0, 6);
        setRoomId(id);
        toast.success("Created a new room");
        await navigator.clipboard.writeText(id);
        setTimeout(() => {
            toast.success("Copied To ClipBoard");
        }, 150);
    };

    // sending connection request to backend to join room.
    const joinRoom = useCallback(() => {
        if (!roomId || !username) {
            toast.error("ROOM ID & username is required");
            return;
        }

        console.log("Clicked Join Button: ", { roomId, username });
        navigate(`/room/${roomId}`, { state: { username } });

        // socket.emit("room:join", {
        //     roomId,
        //     username,
        // });
    }, [roomId, username, socket]);

    // takes it to that room.
    const handleJoinRoom = useCallback(
        (data) => {
            console.log(data);
            const { roomId, username } = data;
            // navigate(`/room/${roomId}`, { state: { username } });
        },
        [navigate]
    );

    // useEffect(() => {
    //     socket.on("room:join", handleJoinRoom);
    //     return () => {
    //         socket.off("room:join", handleJoinRoom);
    //     };
    // }, [socket, handleJoinRoom]);

    const handleInputEnter = (e) => {
        if (e.code === "Enter") {
            joinRoom();
        }
    };

    useEffect(() => {
        const handleOnlineStatus = () => {
            setIsOnline(navigator.onLine);
        };

        window.addEventListener("online", handleOnlineStatus);
        window.addEventListener("offline", handleOnlineStatus);

        return () => {
            window.removeEventListener("online", handleOnlineStatus);
            window.removeEventListener("offline", handleOnlineStatus);
        };
    }, []);

    return (
        <div
            className="h-screen bg-gray-950 justify-center items-center 
        flex"
        >
            {isOnline && (
                <div className="spline-container h-screen w-full">
                    <Spline scene="https://prod.spline.design/EtWzKdkNRZnXpmaN/scene.splinecode" />
                    <div className="crop-overlay bg-gray-950"></div>
                </div>
            )}

            <div className="formWrapper mr-40">
                <h4 className="mainLabel">Paste invitation ROOM ID</h4>
                <div className="inputGroup">
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="ROOM ID"
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                    />
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="USERNAME"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />
                    <button
                        className="btn joinBtn bg-[#00eeff]"
                        onClick={joinRoom}
                    >
                        Join
                    </button>
                    <span className="createInfo">
                        If you don't have an invite then create &nbsp;
                        <a
                            onClick={createNewRoom}
                            href=""
                            className="createNewBtn text-[#00eeff]"
                        >
                            new room
                        </a>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Lobby;
