export class Noise {
    public fractal(x : number, y : number, octaves : number, lacunarity : number, persistence : number, scale : number, seed : number) {
        // The sum of our octaves
        let value = 0
        
        // These coordinates will be scaled the lacunarity
        let x1 = x
        let y1 = y

        // Determines the effect of each octave on the previous sum
        let amplitude = 0.05

        for(let i = 1; i <= octaves; i++) {
            // Multiply the noise output by the amplitude and add it to our sum
            value += math.noise(x1 / scale, y1 / scale, seed) * amplitude

            // Scale up our perlin noise by multiplying the coordinates by lacunarity
            y1 *= lacunarity
            x1 *= lacunarity

            // Reduce our amplitude by multiplying it by persistence
            amplitude *= persistence
        }

        // It is possible to have an output value outside of the range [-1,1]
        // For consistency let's clamp it to that range
        return math.clamp(value, -1, 1)
    }
}