pc.script.attribute('shipModels', 'asset', [],
{
    type: 'model',
    max: 2
});

pc.script.attribute('padModel', 'asset', [],
{
    type: 'model',
    max: 1
});

pc.script.attribute('padHaloModel', 'asset', [],
{
    type: 'model',
    max: 1
});

pc.script.attribute('playerWinTextures', 'asset', [],
{
    type: 'texture',
    max: 2
});

pc.script.attribute('continueTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});


pc.script.create('EndScreen', function (context) {
    
    // Creates a new EndScreen instance
    var EndScreen = function (entity) {
        this.entity = entity;
        this.root = null;
        
        this.screenManager = null;
        this.gameManager = null;
    };


    EndScreen.prototype = {
        
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

    return EndScreen;
});