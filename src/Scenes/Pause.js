class Pause extends Phaser.Scene {
    constructor() {
        super("pause");

        // Initialize a class variable "my" which is an object.
        // The object has two properties, both of which are objects
        //  - "sprite" holds bindings (pointers) to created sprites
        //  - "text"   holds bindings to created bitmap text objects
        this.my = {sprite: {}, text: {}};
    }

    preload() {
    }

    create() {
        let my = this.my;
        this.nextScene = this.input.keyboard.addKey("S");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.add.text((game.config.width/2)-30, (game.config.height/2)-50, "Pew Pew!", {
            fontFamily: 'Times, serif',
            fontSize: 24,
            wordWrap: {
                width: 60
            }
        });
        this.add.text((game.config.width/2)-30, (game.config.height/2), "Press S to start!", {
            fontFamily: 'Times, serif',
            fontSize: 24,
            wordWrap: {
                width: 300
            }
        });
        // update HTML description
        document.getElementById('description').innerHTML = '<h2>Pause.js</h2><br>A: left // D: right // Space: fire/emit // S: play the game'

    }

    update() {


        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
            this.scene.start("galleryShooterGame");
        }

    }

}