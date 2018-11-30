import { TimeGraphComponent, TimeGraphRect, TimeGraphInteractionHandler } from "./time-graph-component";
import { TimeGraphUnitController } from "../time-graph-unit-controller";
import { TimeGraphRange } from "../time-graph-model";
import { TimeGraphStateController } from "../time-graph-state-controller";

export class TimeGraphAxisScale extends TimeGraphComponent {

    protected mouseStartY: number;
    protected mouseStartX: number;
    protected oldViewRange: TimeGraphRange;

    protected mouseIsDown: boolean = false;

    constructor(id: string, protected _options: TimeGraphRect, protected unitController: TimeGraphUnitController, protected stateController: TimeGraphStateController) {
        super(id);

        this.addEvent('mousedown', event => {
            this.mouseStartY = event.data.global.y;
            this.mouseStartX = event.data.global.x;
            this.oldViewRange = this.unitController.viewRange;
            this.mouseIsDown = true;
        }, this._displayObject);
        this.addEvent('mousemove', event => {
            if (this.mouseIsDown) {
                const delta = event.data.global.y - this.mouseStartY;
                const zoomStep = (delta / 100);
                this.zoom(zoomStep);
            }
        }, this._displayObject);
        const moveEnd: TimeGraphInteractionHandler = event => {
            this.mouseIsDown = false;
        }
        this.addEvent('mouseup', moveEnd, this._displayObject);
        this.addEvent('mouseupoutside', moveEnd, this._displayObject);
    }

    render() {
        this.rect({
            color: 0xededdd,
            height: this._options.height,
            width: this._options.width,
            position: this._options.position
        });
        // const stepLength = 10000;
        // const steps = Math.trunc(this.unitController.absoluteRange / stepLength);
        // for (let i = 0; i < steps; i++) {
        //     const height = -10;
        //     const xpos = (stepLength * i - this.unitController.viewRange.start) * this.stateController.zoomFactor;
        //     if (xpos >= 0 && xpos < this.stateController.canvasDisplayWidth) {
        //         const position = {
        //             x: xpos,
        //             y: this._options.height
        //         };
        //         this.vline({
        //             position,
        //             height,
        //             color: 0x000000
        //         });
        //     }
        // }
        console.log("ZOOM", this.stateController.zoomFactor);
        console.log("start", this.unitController.viewRange.start);
        console.log("end", this.unitController.viewRange.end);
        console.log("range", this.unitController.viewRangeLength);
    }

    zoom(zoomStep: number) {
        const oldViewRangeLength = this.oldViewRange.end - this.oldViewRange.start;
        const newViewRangeLength = oldViewRangeLength / (1 + (zoomStep));
        const normZoomFactor = newViewRangeLength / oldViewRangeLength;
        const shiftedMouseX = normZoomFactor * this.mouseStartX;
        const xOffset = this.mouseStartX - shiftedMouseX;
        const viewRangeOffset = xOffset / (this.stateController.canvasDisplayWidth / oldViewRangeLength);
        let start = this.oldViewRange.start + viewRangeOffset;
        if(start < 0) {
            start = 0;
        }
        let end = start + newViewRangeLength;
        if(end > this.unitController.absoluteRange){
            end = this.unitController.absoluteRange;
        }
        this.unitController.viewRange = {
            start,
            end
        }
    }
}