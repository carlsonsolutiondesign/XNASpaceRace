//------------------------------------------------------------------------------------------------------------------------
// PlayCanvas Defines      - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.html
//                           (PIXELFORMAT, etc.)
//
// GraphicsDevice          - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.GraphicsDevice.html
// RenderTarget            - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.RenderTarget.html
// Texture                 - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.Texture.html
// VertexBuffer            - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.VertexBuffer.html
// VertexFormat            - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.VertexFormat.html
// VertexIterator          - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.VertexIterator.html
//
// AssetRegistry           - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.asset.AssetRegistry.html
//                         - http://developer.playcanvas.com/en/tutorials/intermediate/using-assets/
// 
// Custom Shaders          - http://developer.playcanvas.com/en/tutorials/advanced/custom-shaders/
//
// Audio                   - http://developer.playcanvas.com/en/user-manual/assets/audio/
//
// Script Attributes       - http://developer.playcanvas.com/en/user-manual/scripting/script-attributes/
// Matrices (Mat4)         - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.Mat4.html
// Vectors (Vec3)          - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.Vec3.html
//------------------------------------------------------------------------------------------------------------------------
pc.script.attribute('controlsTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('displayTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('continueTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});


pc.script.create('HelpScreen', function (context) {
    
    // Creates a new HelpScreen instance
    var HelpScreen = function (entity) {
        this.entity = entity;
        this.root = null;
        
        this.screenManager = null;
        this.gameManager = null;
        this.soundManager = null;

        this.realControlsTexture = null;
        this.realDisplayTexture = null;
        this.realContinueTexture = null;
    };


    HelpScreen.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.root = context.root.getChildren()[0];
            this.screenManager = this.root.script.ScreenManager;
            this.gameManager = this.root.script.GameManager;
            this.soundManager = this.root.script.SoundManager;
        },
        
        
        SetFocus: function (focus) {

            if (focus) {
                var assets = [
                    context.assets.getAssetById(this.controlsTexture),
                    context.assets.getAssetById(this.displayTexture),
                    context.assets.getAssetById(this.continueTexture),
                ];

                context.assets.load(assets).then(function (resources) {
                    this.realControlsTexture = resources[0];
                    this.realDisplayTexture = resources[1];
                    this.realContinueTexture = resources[2];
                }.bind(this));
            }
            else {
                this.realControlsTexture = null;
                this.realDisplayTexture = null;
                this.realContinueTexture = null;
            }
        },
        
        
        ProcessInput: function (dt, inputManager) {

            if (!inputManager)
                return;

            for (var i = 0; i < 2; i++)
            {
                // Any key/button to go back
                if (inputManager.WasKeyPressed(i, pc.KEY_RETURN) ||
                    inputManager.WasKeyPressed(i, pc.KEY_ESCAPE) ||
                    inputManager.WasKeyPressed(i, pc.KEY_SPACE) ||
                    inputManager.WasKeyPressed(i, pc.KEY_LEFT) ||
                    inputManager.WasKeyPressed(i, pc.KEY_RIGHT) ||
                    inputManager.WasKeyPressed(i, pc.KEY_UP) ||
                    inputManager.WasKeyPressed(i, pc.KEY_DOWN) ||
                    inputManager.WasAButtonPressed(i) ||
                    inputManager.WasBButtonPressed(i) ||
                    inputManager.WasXButtonPressed(i) ||
                    inputManager.WasYButtonPressed(i) ||
                    inputManager.WasLeftShoulderPressed(i) ||
                    inputManager.WasRightShoulderPressed(i) ||
                    inputManager.WasLeftStickPressed(i) ||
                    inputManager.WasRightStickPressed(i) ||
                    inputManager.WasBackButtonPressed(i) ||
                    inputManager.WasStartButtonPressed(i))
                {
                    this.screenManager.SetNextScreen(ScreenManager.ScreenType.IntroScreen);
                    this.soundManager.PlaySound(SoundManager.Sound.MenuCancel);
                }
            }

        },
        
        
        Update: function(dt) {
        },
        
        
        Draw3D: function(gd) {

            if (!gd)
                return;

            gd.clear({
                color: [0.0, 0.0, 0.0, 1.0],
                depth: 1.0,
                flags: pc.CLEARFLAG_COLOR | pc.CLEARFLAG_DEPTH
            });

            this.screenManager.DrawBackground(gd);
        },
        
        
        Draw2D: function (gd, fontManager) {

            if (!gd)
                return;

            var white = new pc.Vec4().copy(pc.Vec4.ONE);
            var rect = new pc.Vec4().copy(pc.Vec4.ZERO);

            var scrWidth = gd.canvas.offsetWidth;
            var scrHeight = gd.canvas.offsetHeight;

            // draw controls text aligned to top of screen
            if (this.realControlsTexture) {
                rect.x = (gd.canvas.offsetWidth - this.realControlsTexture.width) / 2.0;
                rect.y = 40.0;
                rect.z = this.realControlsTexture.width;
                rect.w = this.realControlsTexture.height;
                this.screenManager.DrawTexture(gd, this.realControlsTexture, rect, white, ScreenManager.BlendMode.AlphaBlending);
            }


            // draw controller texture centered on the screen
            if (this.realDisplayTexture) {
                rect.x = (gd.canvas.offsetWidth - this.realDisplayTexture.width) / 2.0;
                rect.y = (gd.canvas.offsetHeight - this.realDisplayTexture.height) / 2.0;
                rect.z = this.realDisplayTexture.width;
                rect.w = this.realDisplayTexture.height;
                this.screenManager.DrawTexture(gd, this.realDisplayTexture, rect, white, ScreenManager.BlendMode.AlphaBlending);
            }


            // draw continue message aligned to the bottom of the screen
            if (this.realContinueTexture) {
                rect.x = (gd.canvas.offsetWidth - this.realContinueTexture.width) / 2.0;
                rect.y = (gd.canvas.offsetHeight - 4.0 * this.realContinueTexture.height);
                rect.z = this.realContinueTexture.width;
                rect.w = this.realContinueTexture.height;
                this.screenManager.DrawTexture(gd, this.realContinueTexture, rect, white, ScreenManager.BlendMode.AlphaBlending);
            }
        }
    };

    return HelpScreen;
});