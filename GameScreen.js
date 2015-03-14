pc.script.create('GameScreen', function (context) {
    
    // Creates a new GameScreen instance
    var GameScreen = function (entity) {
        this.entity = entity;
        this.root = null;
        
        this.screenManager = null;
        this.gameManager = null;
        this.soundManager = null;
    };


    GameScreen.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.root = context.root.getChildren()[0];
            this.screenManager = this.root.script.ScreenManager;
            this.gameManager = this.root.script.GameManager;
            this.soundManager = this.root.script.SoundManager;
        },
        
        
        SetFocus: function (focus) {
            if (focus) {
                this.gameManager.onLoadLevel(this.gameManager.currentLevel);
            } else {
            }
        },
        
        
        ProcessInput: function (dt, inputManager) {

            if (!inputManager)
                return;

            this.gameManager.ProcessInput(dt, inputManager);

            for (var i = 0; i < this.gameManager.gameMode; i++) {
                if (inputManager.WasRightShoulderPressed(i) || inputManager.WasKeyPressed(i, pc.KEY_PAGE_UP)) {
                    this.gameManager.StartSimulation('xnaspacerace.ship.01.simulation.log');
                }
                if (inputManager.WasLeftShoulderPressed(i) || inputManager.WasKeyPressed(i, pc.KEY_PAGE_DOWN)) {
                    this.gameManager.StartSimulation('xnaspacerace.ship.02.simulation.log');
                }

                if (inputManager.WasKeyPressed(i, pc.KEY_ESCAPE) || inputManager.WasKeyPressed(i, pc.KEY_B) || inputManager.WasBackButtonPressed(i)) {

                    var player = this.gameManager.GetPlayer(i);
                    if (player) {
                        player.score = -1;
                    }

                    this.screenManager.SetNextScreen(ScreenManager.ScreenType.EndScreen);
                    this.screenManager._unloadLevel();
                    this.soundManager.PlaySound(SoundManager.Sound.MenuCancel);
                }
            }
        },
        
        
        Update: function (dt) {
            this.gameManager.Update(dt);

            for (var i = 0; i < this.gameManager.gameMode; i++) {
                var player = this.gameManager.GetPlayer(i);

                if (player && player.score >= GameOptions.MaxPoints) {
                    this.screenManager.SetNextScreen(ScreenManager.ScreneType.EndScreen, GameOptions.FadeColor, GameOptions.FadeTime);
                }
            }
        },
        
        
        Draw3D: function (gd) {

            if (!gd)
                return;

            this.gameManager.Draw3D(gd);
        },
        
        
        Draw2D: function (gd, fontManager) {

            if (!gd)
                return;

            this.gameManager.Draw2D(gd);
        }
    };

    return GameScreen;
});
