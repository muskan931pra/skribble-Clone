import React, { useEffect, useRef } from 'react'
import { socket } from '../socket';
import '../styles/canvas.css'

function Canvas({ isDrawer }) {
    const canvasRef = useRef(null);
    const drawing = useRef(false);
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        socket.on("draw", ({ x, y }) => {
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        })
        socket.on("clearCanvas", (e) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        })
    }, []);
    const handleTouchStart = (e) => {
        if (!isDrawer) return;
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvasRef.current.getBoundingClientRect();
        drawing.current = true;
        socket.emit("draw", {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
            type: "start"
        });
    }
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
    }
    const handleTouchEnd = () => {
        drawing.current = false;
    }
    return (
        <>
            <canvas id="canvas" ref={canvasRef} width="700" height="400" style={{ width: "100%", height: "auto" }} onMouseDown={() => {
                if (!isDrawer) return;
                drawing.current = true;
            }} onMouseUp={() => {
                if (!isDrawer) return;
                drawing.current = false;
            }} onMouseMove={(e) => {
                if (!drawing.current || !isDrawer) return;

                const rect = canvasRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                socket.emit("draw", { x, y });
            }} onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}></canvas >
        </>
    )
}

export default Canvas