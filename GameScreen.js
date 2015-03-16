pc.script.create('GameScreen', function (context) {
    
    // Creates a new GameScreen instance
    var GameScreen = function (entity) {
        this.entity = entity;
        this.root = null;
        
        this.screenManager = null;
        this.gameManager = null;
        this.soundManager = null;

        this.exitGameScreen = false;
        this.localPlayers = null;
    };


    GameScreen.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.root = context.root.getChildren()[0];
            this.screenManager = this.root.script.ScreenManager;
            this.gameManager = this.root.script.GameManager;
            this.soundManager = this.root.script.SoundManager;

            this.exitGameScreen = false;
            this.localPlayers = null;
        },
        
        
        SetFocus: function (focus) {
            if (focus) {
                this.exitGameScreen = false;
                this.localPlayers = this.gameManager.FindLocalPlayers();
                this.gameManager.LoadLevel(this.gameManager.currentLevel);
            } else {
                this.exitGameScreen = true;
                this.localPlayers = null;
            }
        },
        
        
        ProcessInput: function (dt, inputManager) {

            if (!inputManager || this.exitGameScreen)
                return;

            this.gameManager.ProcessInput(dt, inputManager);

            for (var i = 0; i < this.localPlayers.length; i++) {
                if (inputManager.WasRightShoulderPressed(i) || inputManager.WasKeyPressed(i, pc.KEY_PAGE_UP)) {
                    this.gameManager.StartSimulation('xnaspacerace.ship.01.simulation.log');
                }
                if (inputManager.WasLeftShoulderPressed(i) || inputManager.WasKeyPressed(i, pc.KEY_PAGE_DOWN)) {
                    this.gameManager.StartSimulation('xnaspacerace.ship.02.simulation.log');
                }

                if (inputManager.WasKeyPressed(i, pc.KEY_ESCAPE) || inputManager.WasKeyPressed(i, pc.KEY_B) || inputManager.WasBackButtonPressed(i)) {

                    var player = this.localPlayers[i].script.PlayerShip;
                    if (player) {
                        player.score = -1;
                    }

                    this.ExitGame();
                }
            }
        },
        
        
        Update: function (dt) {
            if (this.exitGameScreen)
                return;

            this.gameManager.Update(dt);

            for (var i = 0; i < this.localPlayers.length; i++) {
                var player = this.localPlayers[i].script.PlayerShip;

                if (player && player.score >= GameOptions.MaxPoints) {
                    this.ExitGame();
                }
            }
        },
        
        
        ExitGame: function () {
            this.exitGameScreen = true;

            var camera = context.root.findByName('Camera');
            if (camera)
                camera.enabled = false;

            this.screenManager.UnloadLevel();
            this.screenManager.SetNextScreen(ScreenManager.ScreenType.EndScreen, GameOptions.FadeColor, GameOptions.FadeTime);
            this.soundManager.PlaySound(SoundManager.Sound.MenuCancel);
        },


        Draw3D: function (gd) {

            if (!gd || this.exitGameScreen)
                return;

            this.gameManager.Draw3D(gd);
        },
        
        
        Draw2D: function (gd, fontManager) {

            if (!gd || this.exitGameScreen)
                return;

            this.gameManager.Draw2D(gd);
        }
    };

    return GameScreen;
});
