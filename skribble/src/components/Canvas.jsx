import React, { useEffect, useRef } from 'react'
import { socket } from '../socket';
import '../styles/canvas.css'

function Canvas({ isDrawer }) {
    const canvasRef = useRef(null);
    const drawing = useRef(false);
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        socket.on("draw", ({x, y}) => {
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        })
        socket.on("clearCanvas", (e) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        })
    }, []);
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
            }}></canvas>
        </>
    )
}

export default Canvas