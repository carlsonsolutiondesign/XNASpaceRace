pc.script.create('GameScreen', function (context) {
    
    // Creates a new GameScreen instance
    var GameScreen = function (entity) {
        this.entity = entity;
        this.root = null;
        
        this.screenManager = null;
        this.gameManager = null;
    };


    GameScreen.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.root = context.root.getChildren()[0];
            this.screenManager = this.root.script.ScreenManager;
            this.gameManager = this.root.script.GameManager;
        },
        
        
        SetFocus: function (focus) {
            if (focus) {
                this.gameManager.onLoadLevel(this.gameManager.currentLevel);
            } else {
            }
        },
        
        
        ProcessInput: function(dt, inputManager) {
        },
        
        
        Update: function(dt) {
        },
        
        
        Draw3D: function(gd) {
        },
        
        
        Draw2D: function(gd, fontManager) {
        }
    };

    return GameScreen;
});
