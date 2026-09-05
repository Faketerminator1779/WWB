import * as PIXI from 'pixi.js';
import { socket } from '../network/socket.js';

export function createGameScene(app) {
    const container = new PIXI.Container();
    const tileContainer = new PIXI.Container();

    container.addChild(tileContainer);
    const boardBackground = new PIXI.Graphics();
    boardBackground.rect(0, 0, 144, 155)
    boardBackground.fill(0x000000)
    boardBackground.x = 2
    boardBackground.y = 2
    tileContainer.addChild(boardBackground)
    
    let myPlayerId = null
    let myPlayerColor = null
    socket.on('playerInfo', (player) => {
        myPlayerId = player.id
        myPlayerColor = player.color
    })

    let currentPlayerColor = null

    let currentBoard = null

    const SetBoard = (board) => {
        currentBoard = board
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 7; x++) {
                if (!(board[y][x] == 102 || board[y][x] == 103 || board[y][x] == 104)) {
                    const tile = new PIXI.Graphics();

                    tile.rect(0, 0, 18, 9)
                    tile.fill(0xffffff)

                    tile.x = x * 20 + 5
                    tile.y = y * 10 + 5

                    tileContainer.addChild(tile);
                    
                    const numberContainer = new PIXI.Container();

                    const digits = board[y][x].toString();

                    if (digits === '0') {
                        const sprite = new PIXI.Graphics().rect(0,0,18,9).fill(0x55ff55)
                        numberContainer.addChild(sprite)
                    } else if (digits === '101') {
                        const sprite = new PIXI.Graphics().rect(0,0,18,9).fill(0xff5555)
                        numberContainer.addChild(sprite)
                    } else {

                        for (const digit of digits) {
                        const sprite = PIXI.Sprite.from(digit)
                        sprite.width = 4
                        sprite.height = 5
                        sprite.x = 18 - (digits.length - numberContainer.children.length) * 5
                        sprite.y = 3

                        numberContainer.addChild(sprite)
                        }
                    }
                    tile.addChild(numberContainer)
                }
            }
        }
    }
    socket.on('board', SetBoard);
    socket.emit('getBoard')

    const playerContainer = new PIXI.Container();
    container.addChild(playerContainer)

    const playersBackground = new PIXI.Graphics();
    playersBackground.rect(0, 0, 89, 89)
    playersBackground.fill(0x000000)
    playersBackground.x = 149
    playersBackground.y = 2
    playerContainer.addChild(playersBackground)

    const playerTileContainer = new PIXI.Container();
    playerContainer.addChild(playerTileContainer)

    const playerOnBoardContainer = new PIXI.Container();
    container.addChild(playerOnBoardContainer);

    function getPosition(board, position) {
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 7; x++) {
                if(board[y][x] == position) {
                    return {
                        x: x * 20 + 5,
                        y: y * 10 + 5
                    }
                }
            }
        }
        return null
    }

    const SetPlayers = (players) => {
        playerTileContainer.removeChildren()
        playerOnBoardContainer.removeChildren()
        players.forEach((player, index) => {
            if (player.color == myPlayerColor && player.color == currentPlayerColor) {
                const tileactivplayerbackground = new PIXI.Graphics()
                tileactivplayerbackground.rect(0,0,27,27)
                tileactivplayerbackground.fill(0x999999)
                tileactivplayerbackground.x = 151 + ((index) % 3) * 29
                tileactivplayerbackground.y = 4 + (29 * Math.floor(index / 3)) 
                playerTileContainer.addChild(tileactivplayerbackground)

                const tileturnbackground = new PIXI.Graphics()
                tileturnbackground.rect(0,0,25,25)
                tileturnbackground.fill(0xffffff)
                tileturnbackground.x = 152 + ((index) % 3) * 29
                tileturnbackground.y = 5 + (29 * Math.floor(index / 3))
                playerTileContainer.addChild(tileturnbackground)

                const tile = new PIXI.Graphics();
                tile.rect(0, 0, 23, 23)
                tile.fill(player.color)
                tile.x = 153 + ((index) % 3) * 29
                tile.y = 6 + (29 * Math.floor(index / 3)) 
                playerTileContainer.addChild(tile)

            } else if (player.color == currentPlayerColor) {
                tile.stroke({
                    width: 1,
                    color: 0xffffff
                })
            } else {
                const tile = new PIXI.Graphics();
                tile.rect(0, 0, 27, 27)
                tile.fill(player.color)
                tile.x = 151 + ((index) % 3) * 29
                tile.y = 4 + (29 * Math.floor(index / 3)) 
                playerTileContainer.addChild(tile)
            }
            const position = getPosition(currentBoard, player.position)
                
            if (position) {
                const pawn = PIXI.Sprite.from('/assets/pawn.png')
                pawn.x = position.x + Math.floor(Math.random() * 11)
                pawn.y = position.y - Math.floor(Math.random() * 5)
                pawn.width = 7
                pawn.height = 8
                pawn.tint = player.color

                playerOnBoardContainer.addChild(pawn)
                
            }
                
        })
    }
    socket.on('players', SetPlayers)
    socket.emit('getPlayers')

    const diceContainer = new PIXI.Container()
    container.addChild(diceContainer)

    const diceBackground = new PIXI.Graphics();
    diceBackground.rect(0, 0, 89, 64)
    diceBackground.fill(0x000000)
    diceBackground.x = 149
    diceBackground.y = 93
    diceContainer.addChild(diceBackground)

    const dicethrowbox = PIXI.Sprite.from('dice0')
    dicethrowbox.x = 176
    dicethrowbox.y = 95
    diceContainer.addChild(dicethrowbox)

    const dicethrowbutton = PIXI.Sprite.from('buttonOff')
    dicethrowbutton.x = 151
    dicethrowbutton.y = 95
    diceContainer.addChild(dicethrowbutton)

    dicethrowbutton.eventMode = 'none';
    dicethrowbutton.cursor = 'pointer';

    dicethrowbutton.on('pointerdown', () => {
        socket.emit('roll')
    })

    const SetButton = (data) => {
        const myTurn = data.playerId === myPlayerId
        dicethrowbutton.eventMode = myTurn ? 'static' : 'none'
        dicethrowbutton.texture = PIXI.Texture.from(
            myTurn ? 'buttonOn' : 'buttonOff'
        )
    }

    socket.on('turn', SetButton)

    const SetDice = (rolledNummer) => {
        switch (rolledNummer){
            case 1:
                dicethrowbox.texture = PIXI.Texture.from('dice1')
                break
            case 2:
                dicethrowbox.texture = PIXI.Texture.from('dice2')
                break
            case 3:
                dicethrowbox.texture = PIXI.Texture.from('dice3')
                break
            case 4:
                dicethrowbox.texture = PIXI.Texture.from('dice4')
                break
            case 5:
                dicethrowbox.texture = PIXI.Texture.from('dice5')
                break
            case 6:
                dicethrowbox.texture = PIXI.Texture.from('dice6')
                break
            default:
                dicethrowbox.texture = PIXI.Texture.from('dice0')
                break
        }
    }
    socket.on('dieRoll', SetDice)

    container.cleanup = () => {
        socket.off('board', SetBoard)
        socket.off('players', SetPlayers)
        socket.off('turn', SetButton)
    }

    return container;
}