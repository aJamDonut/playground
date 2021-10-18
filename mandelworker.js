
const REAL_SET = {start: -2, end: 1 }
const IMAGINARY_SET = {start: -1, end: 1 }

class MandelWorker {
    constructor(worker) {
        this.maxIterations = 1;
        this.worker = worker;
        this.SETTINGS = {
            maxIterations: 500,
            left: -0.749534069267,
            top: -0.048130547221,
            xOff: 0,
            yOff: 0,
            scale: 1,
            cx: 0,
            cy: 0,
            dir: "down"
        };

        
        this.SETTINGS.cx = 2 + this.SETTINGS.left;
        this.SETTINGS.cy = 1 + this.SETTINGS.top;

    }

    loop() {
        this.getGrid();
        
        this.SETTINGS.scale = this.SETTINGS.scale * 0.9;
        setTimeout(()=>{this.loop()}, 10);
    }

    getGrid() {
        let SETTINGS = this.SETTINGS;

        

        let cx = SETTINGS.cx;
        let cy = SETTINGS.cy

        let lx = SETTINGS.scale;
        let ly = SETTINGS.scale;

        const WIDTH = this.width;
        const HEIGHT = this.height;

        let grid = [];
        for (let i = 0; i < WIDTH; i++) {
            grid.push([]);
            let startY = (this.id*this.height)+1;
            for (let j = startY; j < startY+HEIGHT; j++) {
                let complex = { x: i, y: j, it: REAL_SET.it }
                complex.x = (REAL_SET.start + cx) + (complex.x / WIDTH - 0.5) * (REAL_SET.end - REAL_SET.start) * lx
                complex.y = (IMAGINARY_SET.start + cy) + (complex.y / HEIGHT/this.workerCount - 0.5) * (IMAGINARY_SET.end - IMAGINARY_SET.start) * ly
                const [m, isMandelbrotSet] = this.mandelbrot(complex);
                grid[i].push({m: m, mandel: isMandelbrotSet});
            }
        }
        
        this.worker.command("receiveGrid", {id: this.id, lastUpdate: this.lastUpdate++, grid:grid});
    }

    setId(number) {
        this.id = number;
        this.lastUpdate = 0;
        console.log("Created Worker "+this.id)
    }

    setSize(size) {
        console.log("setsize", size)
        this.width = size.w;
        this.height = size.h;
    }

    setWorkerCount(count) {
        this.workerCount = count;
    }
    mandelbrot(c) {
        let z = { x: 0, y: 0 }, n = 0, p, d;
        do {
            p = {
                x: Math.pow(z.x, 2) - Math.pow(z.y, 2),
                y: 2 * z.x * z.y
            }
            z = {
                x: p.x + c.x,
                y: p.y + c.y
            }
            d = Math.sqrt(Math.pow(z.x, 2) + Math.pow(z.y, 2))
            n += 1
        } while (d <= 2 && n < this.SETTINGS.maxIterations)
        return [n, d <= 2]
    }

}

self.command = function(command, data) {
    this.postMessage({command: command, data: data});
}

self.mandel = new MandelWorker(self);

self.onmessage = (evt) => {

    

    if(typeof this.mandel[evt.data.command] !== 'function') {
        console.error("Don't know command:"+evt.data.command);
        return;
    }

    this.mandel[evt.data.command].call(this.mandel, evt.data.data);


}