import * as PIXI from 'pixi.js';
import { Input } from '@pixi/ui';
import { socket } from '../network/socket.js';

export function createStartScene(app, changeScene) {
    const container = new PIXI.Container();

    const input = new Input({
        bg: new PIXI.Graphics()
            .rect(0, 0, 300, 50)
            .fill(0xffffff),
        placeholder: 'Wpisz tekst'
    });

    input.x = 10;
    input.y = 40;

    container.addChild(input);

    const button = new PIXI.Graphics()
        .rect(0, 0, 200, 60)
        .fill(0x00aa00);

    button.x = 5;
    button.y = 5;

    button.eventMode = 'static';
    button.cursor = 'pointer';

    button.on('pointerdown', () => {
        if (input.value != '') {
            const text = input.value;
            socket.emit('setName', text);
        }
    });

    container.addChild(button);

    const label = new PIXI.Text({
        text: 'Wyślij',
        style: {
            fill: 0xffffff
        }
    });

    label.anchor.set(0.5);
    label.x = button.x + 100;
    label.y = button.y + 30;

    container.addChild(label);

    socket.on('nameAccepted', () => {
        changeScene(2)
    })
    socket.on('nameTaken', () => {
        label.text = "Nazwa zajęta"
    })

    return container;
}