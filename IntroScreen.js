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
pc.script.attribute('logoTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('lensTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('cursorAnimTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('cursorBulletTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('cursorArrowTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('menuTextures', 'asset', [], {type: 'texture'});
pc.script.attribute('menuHoverTextures', 'asset', [], {type: 'texture'});


pc.script.create('IntroScreen', function (context) {
    
    // Creates a new IntroScreen instance
    var IntroScreen = function (entity) {
        
        this.entity = entity;
        this.root = null;
        
        this.screenManager = null;
        this.gameManager = null;
        this.soundManager = null;
        
        this.realLogoTexture = null;
        this.realLensTexture = null;
        this.realCursorAnimTexture = null;
        this.realCursorBulletTexture = null;
        this.realCursorArrowTexture = null;
        
        this.realMenuTextures = [];
        this.realMenuHoverTextures = [];
        
        this.menuSelection = 0;
        this.menuTime = 0.0;
        
        this.NumberOfMenuItems = 4;
    };


    IntroScreen.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.root = context.root.getChildren()[0];
            this.screenManager = this.root.script.ScreenManager;
            this.gameManager = this.root.script.GameManager;
            this.soundManager = this.root.script.SoundManager;
        },


        SetFocus: function(focus) {
            
            if(focus) {
                this.gameManager.gameMode = GameManager.GameMode.SinglePlayer;
                
                this.realMenuHoverTextures = [];
                
                var x = 0;
                
                var assets = [
                    context.assets.getAssetById(this.logoTexture),
                    context.assets.getAssetById(this.lensTexture),
                    context.assets.getAssetById(this.cursorAnimTexture),
                    context.assets.getAssetById(this.cursorBulletTexture),
                    context.assets.getAssetById(this.cursorArrowTexture)
                ];
            
                for(x = 0; x < this.menuTextures.length; x++)
                    assets[assets.length] = context.assets.getAssetById(this.menuTextures[x]);
                
                for(x = 0; x < this.menuHoverTextures.length; x++)
                    assets[assets.length] = context.assets.getAssetById(this.menuHoverTextures[x]);
                    
                context.assets.load(assets).then(function(resources) {
                    this.realLogoTexture = resources[0];
                    this.realLensTexture = resources[1];
                    this.realCusrorAnimTexture = resources[2];
                    this.realCursorBulletTexture = resources[3];
                    this.realCursorArrowTexture = resources[4];
                    
                    for(x = 0; x < this.menuTextures.length; x++) {
                        this.realMenuTextures[x] = resources[x + 5];
                    }
                    
                    for(x = 0; x < this.menuHoverTextures.length; x++) {
                        this.realMenuHoverTextures[x] = resources[x + 5 + this.menuTextures.length];
                    }
                }.bind(this));
                
            } else {
                this.realLogoTexture = null;
                this.realLensTexture = null;
                this.realCursorAnimTexture = null;
                this.realCursorBulletTexture = null;
                this.realCursorArrowTexture = null;
                
                this.realMenuTextures = [];
                this.realMenuHoverTextures = [];
            }
        },
        
        
        ProcessInput: function(dt, inputManager) {
            
            if(!inputManager)
                return;
                
            for(var player = 0; player < GameManager.MaxPlayers; player++) {
                
                // A button or Enter to select menu option
                if(inputManager.WasAButtonPressed(player) || inputManager.WasStartButtonPressed(player) || inputManager.WasKeyPressed(player, pc.KEY_RETURN) || inputManager.WasKeyPressed(player, pc.KEY_SPACE)) {
                    
                    switch(this.menuSelection) {
                        // single player
                        case 0:
                            this.gameManager.GameMode = GameManager.GameMode.SinglePlayer;
                            this.screenManager.SetNextScreen(ScreenManager.ScreenType.PlayerScreen);
                            break;
                            
                        // multi player
                        case 1:
                            this.gameManager.GameMode = GameManager.GameMode.MultiPlayer;
                            this.screenManager.SetNextScreen(ScreenManager.ScreenType.PlayerScreen);
                            break;
                        
                        // help    
                        case 2:
                            this.screenManager.SetNextScreen(ScreenManager.ScreenType.HelpScreen);
                            break;
                            
                        // exit
                        case 3:
                            this.screenManager.Exit();
                            break;
                    }
                    
                    this.soundManager.PlaySound(SoundManager.Sound.MenuSelect);
                }
                
                
                // up/down keys change menu selection
                if(inputManager.WasKeyPressed(player, pc.KEY_UP) || inputManager.WasDPadUpButtonPressed(player) || inputManager.WasLeftStickUpPressed(player)) {
                    this.menuSelection = (this.menuSelection === 0 ? this.NumberOfMenuItems - 1 : this.menuSelection - 1);
                    this.soundManager.PlaySound(SoundManager.Sound.MenuChange);
                    return;
                }

                if(inputManager.WasKeyPressed(player, pc.KEY_DOWN) || inputManager.WasDPadDownButtonPressed(player) || inputManager.WasLeftStickDownPressed(player)) {
                    this.menuSelection = (this.menuSelection + 1) % this.NumberOfMenuItems;
                    this.soundManager.PlaySound(SoundManager.Sound.MenuChange);
                    return;
                }
            }
        },
        
   
        Update: function(dt) {
            this.menuTime += dt;
        },
        
        
        Draw3D: function(gd) {
            
            if(!gd)
                return;

            gd.clear({
                color: [0.0, 0.0, 0.0, 1.0],
                depth: 1.0,
                flags: pc.CLEARFLAG_COLOR | pc.CLEARFLAG_DEPTH
            });

            this.screenManager.DrawBackground(gd);
        },
        
        
        Draw2D: function(gd, fontManager) {
            
            if(!gd || !this.realLensTexture || !this.realLogoTexture)
                return;
                
            // screen rect (x = left, y = top, z = width, w = height)
            var rect = new pc.Vec4(0.0, 0.0, 0.0, 0.0);

            var white = new pc.Vec4().copy(pc.Vec4.ONE);
            
            // draw lens flare texture (centered)
            if (this.realLensTexture) {
                rect.x = 0.0;
                rect.y = 0.0;
                rect.z = gd.width;
                rect.w = gd.height;
                this.screenManager.DrawTexture(gd, this.realLensTexture, rect, white, ScreenManager.BlendMode.AdditiveBlending);
            }
            
            // draw logo texture (top-centered)
            if (this.realLogoTexture) {
                rect.x = (gd.canvas.offsetWidth - this.realLogoTexture.width) / 2.0;
                rect.y = (gd.canvas.offsetHeight - this.realLogoTexture.height) / 4.0;
                rect.z = this.realLogoTexture.width;
                rect.w = this.realLogoTexture.height;
                this.screenManager.DrawTexture(gd, this.realLogoTexture, rect, white, ScreenManager.BlendMode.AlphaBlending);
            }

            // draw menu items (starting location based on examination of PNG and trial and error)
            var Y = 500.0;
            for (var i = 0; i < this.NumberOfMenuItems; i++)
            {
                // if item selected
                if (i === this.menuSelection)
                {
                    if (this.realMenuHoverTextures[i]) {
                        rect.x = (gd.canvas.offsetWidth - this.realMenuHoverTextures[i].width) / 2.0;
                        rect.y = Y;
                        rect.z = this.realMenuHoverTextures[i].width;
                        rect.w = this.realMenuHoverTextures[i].height;
                        this.screenManager.DrawTexture(gd, this.realMenuHoverTextures[i], rect, white, ScreenManager.BlendMode.AlphaBlending);

                        // draw cursor left of selected item
                        this.DrawCursor(gd, rect.x - 60, rect.y + 19);
                    }
                    Y += 50;
                }
                else // item not selected
                {
                    if (this.realMenuTextures[i]) {
                        rect.x = (gd.canvas.offsetWidth - this.realMenuTextures[i].width) / 2.0;;
                        rect.y = Y;
                        rect.z = this.realMenuTextures[i].width;
                        rect.w = this.realMenuTextures[i].height;

                        this.screenManager.DrawTexture(gd, this.realMenuTextures[i], rect, white, ScreenManager.BlendMode.AlphaBlending);
                    }
                    Y += 40;
                }
            }
        },
        
        
        DrawCursor: function (gd, x, y) {

            var rect = new pc.Vec4().copy(pc.Vec4.ZERO);
            var rotation = this.menuTime * 2.0;

            var white = new pc.Vec4().copy(pc.Vec4.ONE);

            // draw animated cursor texture
            if (this.realCursorAnimTexture) {
                rect.x = x - this.realCursorAnimTexture.width / 2;
                rect.y = y - this.realCursorAnimTexture.height / 2;
                rect.z = this.realCursorAnimTexture.width;
                rect.w = this.realCursorAnimTexture.height;
                //this.screenManager.DrawTexture(gd, this.realCursorAnimTexture, rect, rotation, white, ScreenManager.BlendMode.AlphaBlending);
                this.screenManager.DrawTexture(gd, this.realCursorAnimTexture, rect, white, ScreenManager.BlendMode.AlphaBlending);
            }


            // draw bullet cursor texture
            if (this.realCursorBulletTexture) {
                rect.x = x - this.realCursorBulletTexture.width / 2;
                rect.y = y - this.realCursorBulletTexture.height / 2;
                rect.z = this.realCursorBulletTexture.width;
                rect.w = this.realCursorBulletTexture.height;
                this.screenManager.DrawTexture(gd, this.realCursorBulletTexture, rect, white, ScreenManager.BlendMode.AlphaBlending);
            }


            // draw arrow cursor texture
            if (this.realCursorArrowTexture) {
                rect.x = x - this.realCursorArrowTexture.width / 2 + 32;
                rect.y = y - this.realCursorArrowTexture.height / 2;
                rect.z = this.realCursorArrowTexture.width;
                rect.w = this.realCursorArrowTexture.height;
                this.screenManager.DrawTexture(gd, this.realCursorArrowTexture, rect, white, ScreenManager.BlendMode.AlphaBlending);
            }
        }
    };

    return IntroScreen;
});
