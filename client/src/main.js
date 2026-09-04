import * as PIXI from 'pixi.js';

import { createStartScene } from './scenes/StartScene.js';
import { createGameScene } from './scenes/GameScene.js';

const BASE_WIDTH = 240;
const BASE_HEIGHT = 160;

const app = new PIXI.Application();

await app.init({
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    background: '#696969'
});

document.body.appendChild(app.canvas);

await PIXI.Assets.load([
    '/assets/numbers.json', 
    '/assets/pawn.png'
])

function resize() {
    const scale = Math.floor(
        Math.min(
            window.visualViewport.width / BASE_WIDTH,
            window.visualViewport.height / BASE_HEIGHT
        )
    )  
    app.canvas.style.width = `${BASE_WIDTH * Math.max(scale, 1)}px`
    app.canvas.style.height = `${BASE_HEIGHT * Math.max(scale, 1)}px`
}

window.addEventListener('resize', resize);
resize();

let currentScene;

function setScene(id) {

    if (currentScene) {
      if (currentScene?.cleanup) {
        currentScene.cleanup();
      }
      currentScene.destroy({ children: true });
      app.stage.removeChild(currentScene);
    }

    if (id === 1) {
        currentScene = createStartScene(app, setScene);
    }

    if (id === 2) {
        currentScene = createGameScene(app);
    }

    app.stage.addChild(currentScene);
}

setScene(1);