import React, { useEffect, useRef } from 'react'
import { socket } from '../socket';
import '../styles/canvas.css'

function Canvas({ isDrawer }) {
    const canvasRef = useRef(null);
    const drawing = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.lineWidth = 3;
        ctx.lineCap = "round";

        socket.on("draw", ({ x, y, type }) => {  // ✅ added type
            if (type === "start") {
                ctx.beginPath();
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, y);
            }
        });

        socket.on("clearCanvas", () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        return () => {
            socket.off("draw");
            socket.off("clearCanvas");
        };
    }, []);

    const getPos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleMouseDown = (e) => {
        if (!isDrawer) return;
        drawing.current = true;
        const pos = getPos(e);
        const ctx = canvasRef.current.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        socket.emit("draw", { ...pos, type: "start" });
    };

    const handleMouseUp = () => {
        drawing.current = false;
    };

    const handleMouseMove = (e) => {  // ✅ proper move handler
        if (!drawing.current || !isDrawer) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        socket.emit("draw", { ...pos, type: "move" });
    };

    const handleTouchStart = (e) => {
        if (!isDrawer) return;
        e.preventDefault();
        drawing.current = true;
        const touch = e.touches[0];
        const rect = canvasRef.current.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const ctx = canvasRef.current.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(x, y);
        socket.emit("draw", { x, y, type: "start" });
    };

    const handleTouchMove = (e) => {
        if (!drawing.current || !isDrawer) return;
        e.preventDefault();
        const touch = e.touches[0];
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
        socket.emit("draw", { x, y, type: "move" });
    };

    const handleTouchEnd = () => {
        drawing.current = false;
    };

    return (
        <canvas
            id="canvas"
            ref={canvasRef}
            width="700"
            height="400"
            style={{ width: "100%", height: "auto" }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        />
    );
}

export default Canvas;