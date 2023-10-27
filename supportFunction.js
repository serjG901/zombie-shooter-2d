export function getAngle(w, h, x, y) {
    if (x === w / 2 && y === h / 2) return 0;
    if (x === w / 2 && y < h / 2) return 0;
    if (x === w / 2 && y > h / 2) return Math.PI;
    if (x < w / 2 && y === h / 2) return Math.PI * 1.5;
    if (x > w / 2 && y === h / 2) return Math.PI * 0.5;
    if (x < w / 2 && y < h / 2) return Math.atan((h / 2 - y) / (w / 2 - x)) + Math.PI * 1.5;
    if (x > w / 2 && y < h / 2) return -Math.atan((h / 2 - y) / (x - w / 2)) + Math.PI * 0.5;
    if (x > w / 2 && y > h / 2) return Math.atan((y - h / 2) / (x - w / 2)) + Math.PI * 0.5;
    if (x < w / 2 && y > h / 2) return Math.PI * 1.5 - Math.atan((y - h / 2) / (w / 2 - x));
}

export const filterByIdAtPlace = (arr, id) => arr.splice(arr.findIndex(item => item.id === id), 1);
