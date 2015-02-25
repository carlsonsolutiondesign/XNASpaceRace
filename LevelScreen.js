pc.script.create('LevelScreen', function (context) {
    
    // Creates a new LevelScreen instance
    var LevelScreen = function (entity) {
        this.entity = entity;
        this.root = null;
        
        this.screenManager = null;
        this.gameManager = null;
    };


    LevelScreen.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.root = context.root.getChildren()[0];
            this.screenManager = this.root.script.ScreenManager;
            this.gameManager = this.root.script.GameManager;
        },
        
        
        SetFocus: function(focus) {
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

    return LevelScreen;
});
