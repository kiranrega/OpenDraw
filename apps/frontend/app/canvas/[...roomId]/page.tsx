"use client";
import { initDraw } from '@/draw';
import React, { useEffect } from 'react';

export default function Canvas() {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (canvasRef.current) {
           initDraw(canvasRef.current)
        }
    }, [])
    return <div>
        <canvas id="canvas" ref={canvasRef} width={800} height={800} />
    </div>;
}