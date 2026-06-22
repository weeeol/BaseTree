import React, { useEffect, useState, useRef } from 'react';

export default function DependencyOverlay({ edges, hoveredPath }) {
    const [paths, setPaths] = useState([]);
    const containerRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!edges || edges.length === 0) {
            setPaths([]);
            return;
        }

        const updatePaths = () => {
            if (!containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            const newPaths = [];

            for (const edge of edges) {
                // Determine if we should draw this line based on hover state
                const isHovered = hoveredPath === edge.source || hoveredPath === edge.target;
                if (!hoveredPath) {
                    // if nothing hovered, maybe don't draw any lines or draw faint ones
                    // Let's only draw lines connected to the hovered node to prevent clutter
                    continue; 
                }
                if (!isHovered) continue;

                const sourceEl = document.getElementById(`node-${edge.source}`);
                
                // Fuzzy match target because backend sends e.g. "src/Sidebar" but DOM id is "node-src/Sidebar.jsx"
                let targetEl = document.getElementById(`node-${edge.target}`);
                if (!targetEl) {
                    targetEl = document.getElementById(`node-${edge.target}.js`) ||
                               document.getElementById(`node-${edge.target}.jsx`) ||
                               document.getElementById(`node-${edge.target}.ts`) ||
                               document.getElementById(`node-${edge.target}.tsx`) ||
                               document.getElementById(`node-${edge.target}/index.js`) ||
                               document.getElementById(`node-${edge.target}/index.jsx`);
                }

                if (sourceEl && targetEl) {
                    const sRect = sourceEl.getBoundingClientRect();
                    const tRect = targetEl.getBoundingClientRect();

                    // Calculate center points relative to the overlay container
                    const sx = sRect.left + sRect.width / 2 - containerRect.left;
                    const sy = sRect.top + sRect.height / 2 - containerRect.top;
                    const tx = tRect.left + tRect.width / 2 - containerRect.left;
                    const ty = tRect.top + tRect.height / 2 - containerRect.top;

                    // Draw bezier curve (like D3 diagonal)
                    const d = `M ${sx},${sy} C ${sx + 100},${sy} ${tx - 100},${ty} ${tx},${ty}`;

                    newPaths.push({
                        id: `${edge.source}-${edge.target}`,
                        d,
                        isSourceHovered: hoveredPath === edge.source,
                        isTargetHovered: hoveredPath === edge.target
                    });
                }
            }
            setPaths(newPaths);
            animationRef.current = requestAnimationFrame(updatePaths);
        };

        animationRef.current = requestAnimationFrame(updatePaths);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [edges, hoveredPath]);

    if (!edges || edges.length === 0 || !hoveredPath) return null;

    return (
        <svg 
            ref={containerRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
        >
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#818cf8" />
                </marker>
            </defs>
            {paths.map((p) => (
                <path
                    key={p.id}
                    d={p.d}
                    fill="none"
                    stroke={p.isSourceHovered ? '#818cf8' : '#34d399'} // Indigo for outgoing, Emerald for incoming
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    markerEnd="url(#arrowhead)"
                    className="opacity-70 drop-shadow-md animate-pulse"
                />
            ))}
        </svg>
    );
}
