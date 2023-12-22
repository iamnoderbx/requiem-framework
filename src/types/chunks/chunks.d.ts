declare namespace Chunks {
    export type Streamable = {
        id: number;
        location: CFrame;
        scale: number;
    }

    export type Region = {
        id: number;
        position: Vector2;
        instances: Streamable[];
    }

    // A level is a collection of regions
    export type Level = {
        regions: Region[];
        center: Vector2;
    }

    // The game is a collection of levels
    export type Game = {
        levels: Level[];
    }
}