namespace PerformanceTask {
    export function thread(step : number, cores: number, ...args : unknown[]) {
        let a = 5
        let b = 3

        for (let i = 0; i < 1e6; i++) {
            a = b
            b = a
        };

        return 3
    }
}

export default PerformanceTask