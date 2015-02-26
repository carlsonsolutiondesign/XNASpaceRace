pc.script.attribute('levelShotsTexture', 'asset', [],
{
    type: 'texture',
    max: 2
});

pc.script.attribute('selectBackTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('changeLevelTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});


pc.script.create('LevelScreen', function (context) {
    
    // Creates a new LevelScreen instance
    var LevelScreen = function (entity) {
        this.entity = entity;
        this.root = null;
        
        this.screenManager = null;
        this.gameManager = null;
        this.soundManager = null;

        this.realLevelShotsTextures = null;
        this.realSelectBackTexture = null;
        this.realChangeLevelTexture = null;

        this.levels = ["RedSpace", "DoubleSpace"];

        this.elapsedTime = 0.0;
    };

    window.LevelScreen =
    {
        AssetLoadOrder: Object.freeze(
        {
            SelectBackTexture: 0,
            ChangeLevelTexture: 1,
            LevelShotsTextures: 2
        })
    };

    LevelScreen.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.root = context.root.getChildren()[0];
            this.screenManager = this.root.script.ScreenManager;
            this.gameManager = this.root.script.GameManager;
            this.soundManager = this.root.script.SoundManager;

            this.elapsedTime = 0.0;
        },
        
        
        SetFocus: function (focus) {

            if (focus) {

                var assets = [
                    context.assets.getAssetById(this.selectBackTexture),
                    context.assets.getAssetById(this.changeLevelTexture)
                ];

                for (var x = 0; x < this.levelShotsTextures.length; x++) {
                    assets[assets.length] = context.assets.getAssetById(this.levelShotsTextures[x]);
                }

                context.assets.load(assets).then(function (resources) {
                    this.realSelectBackTexture = resources[window.LevelScreen.AssetLoadOrder.SelectBackTexture];
                    this.realChangeLevelTexture = resource[window.LevelScreen.AssetLoadOrder.ChangeLevelTexture];

                    this.realLevelShotsTextures = [];
                    for (var x = 0; x < this.levelShotsTextures.length; x++) {
                        this.realLevelShotsTextures[x] = resources[window.LevelScreen.AssetLoadOrder.LevelShotsTextures + x];
                    }
                }.bind(this));

            } else {
                this.realSelectBackTexture = null;
                this.realChangeLevelTexture = null;
                this.realLevelShotsTextures = null;
            }
        },
        
        
        ProcessInput: function(dt, inputManager) {
        },
        
        
        Update: function (dt) {
            this.elapsedTime += dt;
        },
        
        
        Draw3D: function (gd) {

            if (!gd)
                return;

            gd.clear({
                color: [0.0, 0.0, 0.0, 1.0],
                depth: 1.0,
                flags: pc.CLEARFLAG_COLOR | pc.CLEARFLAG_DEPTH
            });

            this.screenManager.DrawBackground(gd);
        },
        
        
        Draw2D: function(gd, fontManager) {
        }
    };

    return LevelScreen;
});
