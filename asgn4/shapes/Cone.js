class Cone {
    constructor() {
        this.type = 'cone';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.segments = 16; // Number of segments around the cone base
    }

    render() {
        var rgba = this.color;
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // parameters
        const apex = [0.5, 1.0, 0.5]; // Top point of cone
        const baseCenter = [0.5, 0.0, 0.5]; // Center of base
        const radius = 0.5;
        const segments = this.segments;

        // sides
        for (let i = 0; i < segments; i++) {
            const angle1 = (i / segments) * 2 * Math.PI;
            const angle2 = ((i + 1) / segments) * 2 * Math.PI;

            // Calculate base circle points
            const x1 = baseCenter[0] + radius * Math.cos(angle1);
            const z1 = baseCenter[2] + radius * Math.sin(angle1);
            const x2 = baseCenter[0] + radius * Math.cos(angle2);
            const z2 = baseCenter[2] + radius * Math.sin(angle2);

            // Vary the color slightly for each segment to show depth
            const colorVariation = 0.7 + 0.3 * Math.cos(angle1);
            gl.uniform4f(
                u_FragColor,
                rgba[0] * colorVariation,
                rgba[1] * colorVariation,
                rgba[2] * colorVariation,
                rgba[3]
            );

            // Draw triangle from apex to base edge
            drawTriangle3D([
                apex[0], apex[1], apex[2],
                x1, baseCenter[1], z1,
                x2, baseCenter[1], z2
            ]);
        }

        // base
        gl.uniform4f(u_FragColor, rgba[0] * 0.5, rgba[1] * 0.5, rgba[2] * 0.5, rgba[3]);
        for (let i = 0; i < segments; i++) {
            const angle1 = (i / segments) * 2 * Math.PI;
            const angle2 = ((i + 1) / segments) * 2 * Math.PI;

            const x1 = baseCenter[0] + radius * Math.cos(angle1);
            const z1 = baseCenter[2] + radius * Math.sin(angle1);
            const x2 = baseCenter[0] + radius * Math.cos(angle2);
            const z2 = baseCenter[2] + radius * Math.sin(angle2);

            // Draw triangle from center to edge of base
            drawTriangle3D([
                baseCenter[0], baseCenter[1], baseCenter[2],
                x2, baseCenter[1], z2,
                x1, baseCenter[1], z1
            ]);
        }
    }
}