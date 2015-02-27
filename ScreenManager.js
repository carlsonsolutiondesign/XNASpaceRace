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
pc.script.attribute('textureBackground', 'asset', [],
{
    type: 'texture',
    max: 1
});


pc.script.create('ScreenManager', function (context) {
    
    // Creates a new ScreenManager instance
    var ScreenManager = function (entity) {
        
        this.entity = entity;
        this.root = null;
        
        this.bootManager = null;
        this.gameManager = null;
        this.fontManager = null;
        this.spriteManager = null;
        this.inputManager = null;
        
        this.currentLevelPack = null;

        this.screens = [];                                  // list of available screens
        this.currentScreen = null;                          // current active screen
        this.nextScreen = null;                             // next screen on transition
        
        this.fadeTime = 3.0;                                // total fade time for a transition
        this.fade = 0.0;                                    // current fade time during a transition
        this.fadeColor = new pc.Vec4(1.0, 1.0, 1.0, 1.0);   // fade color
        
        this.realBackgroundTexture = null;                  // texture data after asset.load
            
        this.colorRT = null;                                // main color buffer render target
        this.colorBuffer = null;
        
        this.glowRT1 = null;                                // horizontal blur render target
        this.glowBuffer1 = null;
        
        this.glowRT2 = null;                                // vertical blur render target
        this.glowBuffer2 = null;
        
        this.blurManager = null;                            // 
        
        this.backgroundTime = 0.0;                          // time for background animation on menus
    };


    window.ScreenManager =
    {
        ScreenType: Object.freeze({IntroScreen: 0, HelpScreen: 1, PlayerScreen: 2, LevelScreen: 3, GameScreen: 4, EndScreen: 5}),
        
        Menu: Object.freeze({ id: "352638" }),

        BlendMode: Object.freeze({ None: 0, AdditiveBlending: 1, AlphaBlending: 2 })
    };
        

    // PlayCanvas Order of Events (http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.ScriptComponent.html):
    //
    //      initialize
    //      postInitialize
    //      update
    //      fixedUpdate
    //      postUpdate
    //
    ScreenManager.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            
            this.root = context.root.getChildren()[0];

            // save access to managers
            this.bootManager = this.root.script.BootManager;
            this.gameManager = this.root.script.GameManager;
            this.gameOptions = this.root.script.GameOptions;
            this.fontManager = this.root.script.FontManager;
            this.spriteManager = this.root.script.SpriteManager;
            this.inputManager = this.root.script.InputManager;
            this.blurManager = this.root.script.BlurManager;
            
            // add all screens
            this.screens[0] = this.root.script.IntroScreen;
            this.screens[1] = this.root.script.HelpScreen;
            this.screens[2] = this.root.script.PlayerScreen;
            this.screens[3] = this.root.script.LevelScreen;
            this.screens[4] = this.root.script.GameScreen;
            this.screens[5] = this.root.script.EndScreen;
            
            // fade into IntroScreen
            this.SetNextScreen(window.ScreenManager.ScreenType.IntroScreen, GameOptions.FadeColor, GameOptions.FadeTime);
            this.fade = 0.5 * this.fadeTime;
        },
        
        
        SetNextScreen: function(screenType, fadeColor, fadeTime) {
        
            if(typeof(fadeColor) === 'undefined') fadeColor = new pc.Vec4().copy(GameOptions.FadeColor);
            if(typeof(fadeTime) === 'undefined') fadeTime = GameOptions.FadeTime;
            
            if(!this.nextScreen) {
                this.nextScreen = this.screens[screenType];
                this.fadeColor.copy(fadeColor);
                this.fadeTime = fadeTime;
                this.fade = this.fadeTime;
                return true;
            }
            
            return false;
        },
        
        
        Exit: function () {
        },


        LoadContent: function () {
            
            var assets = [
                context.assets.getAssetById(this.textureBackground)
            ];
            
            context.assets.load(assets).then(function(resources) {
                this.realBackgroundTexture = resources[0];
            }.bind(this));
            
            this.colorBuffer = new pc.Texture( context.graphicsDevice,
            {
                width: GameOptions.GlowResolution,
                height: GameOptions.GlowResolution,
                format: pc.PIXELFORMAT_R8_G8_B8_A8
            });
            this.colorRT = new pc.RenderTarget(context.graphicsDevice, this.colorBuffer, {Depth: true});
            

            this.glowBuffer1 = new pc.Texture( context.graphicsDevice,
            {
                width: GameOptions.GlowResolution,
                height: GameOptions.GlowResolution,
                format: pc.PIXELFORMAT_R8_G8_B8_A8
            });
            this.glowRT1 = new pc.RenderTarget(context.graphicsDevice, this.glowBuffer1, {Depth: false});
            
            
            this.glowBuffer2 = new pc.Texture( context.graphicsDevice,
            {
                width: GameOptions.GlowResolution,
                height: GameOptions.GlowResolution,
                format: pc.PIXELFORMAT_R8_G8_B8_A8
            });
            this.glowRT2 = new pc.RenderTarget(context.graphicsDevice, this.glowBuffer2, {Depth: false});

            this.blurManager.LoadContent(GameOptions.GlowResolution, GameOptions.GlowResolution);
        },
        
        
        UnloadContent: function() {
            
            this.blurManager.UnloadContent();
            
            //this.textureBackground = null;
            
            if(this.colorRT) {
                this.colorRT.destroy();
                this.colorRT = null;
            }
            
            if(this.glowRT1) {
                this.glowRT1.destroy();
                this.glowRT1 = null;
            }
            
            if(this.glowRT2) {
                this.glowRT2.destroy();
                this.glowRT2 = null;
            }
        },
        
        
        ProcessInput: function(dt) {

            this.inputManager.SyncInput(dt);

            if (this.currentScreen && !this.nextScreen)
                this.currentScreen.ProcessInput(dt, this.inputManager);

            if (this.inputManager.WasKeyPressed(0, pc.KEY_F3) || this.inputManager.WasKeyPressed(1, pc.KEY_F3))
                this.bootManager.ToggleFullScreen();
        },
        
        
        Update: function (dt) {
            
            // fade will be greater than zero during a transition
            if(this.fade > 0) {
                
                // count down
                this.fade -= dt;
                
                // time to switch to new screen (fade <= 0)
                if(this.nextScreen && this.fade < (0.5 * this.fadeTime)) {
                    // set focus to the new screen
                    this.nextScreen.SetFocus(true);
                    
                    // lose focus on current screen 
                    if(this.currentScreen)
                        this.currentScreen.SetFocus(false);
                        
                    this.currentScreen = this.nextScreen;
                    this.nextScreen = null;
                }
            }
            
            // update currentScreen if possible
            if(this.currentScreen)
                this.currentScreen.Update(dt);
                
            // update background animation timer
            this.backgroundTime += dt;
        },
        

        Draw: function(dt) {
            
            var gd = context.graphicsDevice;

            if (!gd || this.currentScreen === this.root.script.GameScreen)
                return;

            gd.setRenderTarget(null);
            gd.updateBegin();

            //gd.updateBegin();
            gd.clear({
                color: [0.0, 0.0, 1.0, 1.0],
                depth: 1.0,
                flags: pc.CLEARFLAG_COLOR | pc.CLEARFLAG_DEPTH
            });
            //gd.updateEnd();

            this.SetNoBlending(gd);
            gd.setDepthWrite(true);
            gd.setDepthTest(true);

            if (this.currentScreen) {

                if (this.colorRT && this.glowRT1 && this.glowRT2) {

                    //gd.setRenderTarget(this.colorRT);
                    //gd.updateBegin();
                    this.currentScreen.Draw3D(gd);
                    //gd.updateEnd();
                    //gd.setRenderTarget(null);

                    //this.BlurGlowRenderTarget(gd);
                    
                    //gd.updateBegin();
                    //this.DrawRenderTargetTexture(gd, this.colorRT, 1.0, window.ScreenManager.BlendMode.None);
                    //this.DrawRenderTargetTexture(gd, this.glowRT2, 0.5, window.ScreenManager.BlendMode.AdditiveBlending);
                    this.currentScreen.Draw2D(gd, this.fontManager);
                    //gd.updateEnd();
                }
            }


            // fade if in a transition
            if (this.fade > 0)
            {
                // compute transtition fade intensity
                var size = this.fadeTime * 0.5;
                this.fadeColor.w = 1.25 * (1.0 - Math.abs(this.fade - size) / size);

                // set alpha blend and no depth test or write
                var prevBlending = gd.getBlending();
                var prevDepthWrite = gd.getDepthWrite();
                var prevDepthTest  = gd.getDepthTest();
            
                gd.setDepthWrite(false);
                gd.setDepthTest(false);
                this.SetAlphaBlending(gd);
            
                // draw transition fade color
                //gd.updateBegin();
                this.blurManager.RenderScreenQuad(gd, BlurManager.BlurTechnique.Color, null, this.fadeColor);
                //gd.updateEnd();

                // restore render states
                gd.setDepthTest(prevDepthTest);
                gd.setDepthWrite(prevDepthWrite);
                gd.setBlending(prevBlending);
            }

            gd.updateEnd();
        },
        
        
        DrawBackground: function(gd) {
            
            const animationTime = 3.0;
            const animationLength = 0.8;
            const numberLayers = 2;
            const layerDistance = 1.0 / numberLayers;

            if (!this.realBackgroundTexture)
                return;

            // normalized time
            var normalizedTime = ((this.backgroundTime / animationTime) % 1.0);
            
            // set render states
            var prevBlending = gd.getBlending();
            var prevDepthWrite = gd.getDepthWrite();
            var prevDepthTest  = gd.getDepthTest();
            
            gd.setDepthWrite(false);
            gd.setDepthTest(false);
            //this.SetAlphaBlending(gd);
            this.SetNoBlending();

            var white = new pc.Vec4().copy(pc.Vec4.ONE);
            var scale = 0.0;

            for(var x = 0; x < numberLayers; x++) {
                if(normalizedTime > 0.5)
                    scale = 2 - normalizedTime * 2;
                else
                    scale = normalizedTime * 2;
                
                var color = new pc.Vec4(scale, scale, scale, 1);
                scale = 1 + normalizedTime * animationLength;

                //this.blurManager.RenderScaledScreenQuad(gd, BlurManager.BlurTechnique.ColorTexture, this.realBackgroundTexture, color, scale);
                this.blurManager.RenderScreenQuad(gd, BlurManager.BlurTechnique.ColorTexture, this.realBackgroundTexture, white);
            
                normalizedTime = ((normalizedTime + layerDistance) % 1);
            }
            
            gd.setDepthTest(prevDepthTest);
            gd.setDepthWrite(prevDepthWrite);
            gd.setBlending(prevBlending);
        },
        

        BlurGlowRenderTarget: function(gd) {
            
            if(!gd || !this.colorRT || !this.glowRT1 || !this.glowRT2)
                return;
            
            var prevBlending = gd.getBlending();
            var prevDepthWrite = gd.getDepthWrite();
            var prevDepthTest  = gd.getDepthTest();
            
            gd.setDepthWrite(false);
            gd.setDepthTest(false);
            
            var white = new pc.Vec4().copy(pc.Vec4.ONE);

            gd.setRenderTarget(this.glowRT1);
            gd.updateBegin();

            gd.clear({
                color: [0.0, 0.0, 0.0, 1.0],
                flags: pc.CLEARFLAG_COLOR
            });

            if (this.currentScreen === this.gameScreen && this.gameManager.gameMode === GameManager.GameMode.MultiPlay) {
                this.blurManager.RenderScreenQuad(gd, BlurManager.BlurTechnique.BlurHorizontalSplit, this.colorRT, white);
            } else {
                this.blurManager.RenderScreenQuad(gd, BlurManager.BlurTechnique.BlurHorizontal, this.colorRT, white);
            }
            gd.updateEnd();
            gd.setRenderTarget(null);


            gd.setRenderTarget(this.glowRT2);
            gd.updateBegin();

            gd.clear({
                color: [0.0, 0.0, 0.0, 1.0],
                flags: pc.CLEARFLAG_COLOR
            });

            this.blurManager.RenderScreenQuad(gd, BlurManager.BlurTechnique.BlurVertical, this.glowRT1, white);
            gd.updateEnd();
            gd.setRenderTarget(null);
            
            gd.setDepthTest(prevDepthTest);
            gd.setDepthWrite(prevDepthWrite);
            gd.setBlending(prevBlending);
        },
        
        
        DrawRenderTargetTexture: function(gd, texture, intensity, blendMode){
            
            if(!gd || !texture)
                return;
                
            var prevBlending = gd.getBlending();
            var prevDepthWrite = gd.getDepthWrite();
            var prevDepthTest  = gd.getDepthTest();
            
            gd.setDepthWrite(false);
            gd.setDepthTest(false);

            switch(blendMode) {
                case window.ScreenManager.BlendMode.None:
                    this.SetNoBlending(gd);
                    break;
                    
                case window.ScreenManager.BlendMode.AdditiveBlending:
                    this.SetAdditiveBlending(gd);
                    break;
                    
                case window.ScreenManager.BlendMode.AlphaBlending:
                    this.SetAlphaBlending(gd);
                    break;
            }
            
            var intensityVec = new pc.Vec4(intensity, intensity, intensity, intensity);
            this.blurManager.RenderScreenQuad(gd, window.BlurManager.BlurTechnique.ColorTexture, texture, intensityVec);
            
            gd.setDepthTest(prevDepthTest);
            gd.setDepthWrite(prevDepthWrite);
            gd.setBlending(prevBlending);
        },
        
        
        DrawTexture: function(gd, texture, rect, color, blendMode, rotation) {

            if(!gd || !texture)
                return;
            
            if (typeof (rotation) === 'undefined') rotation = 0.0;

            var prevBlending = gd.getBlending();
            var prevDepthWrite = gd.getDepthWrite();
            var prevDepthTest  = gd.getDepthTest();
            
            gd.setDepthWrite(false);
            gd.setDepthTest(false);

            switch(blendMode) {
                case window.ScreenManager.BlendMode.None:
                    this.SetNoBlending(gd);
                    break;
                    
                case window.ScreenManager.BlendMode.AdditiveBlending:
                    this.SetAdditiveBlending(gd);
                    break;
                    
                case window.ScreenManager.BlendMode.AlphaBlending:
                    this.SetAlphaBlending(gd);
                    break;
            }
            
            this.spriteManager.RenderSprite(gd, SpriteManager.RenderTechnique.ColorTexture, texture, color, rect.x, rect.y, rect.z, rect.w, rotation);
            
            gd.setDepthTest(prevDepthTest);
            gd.setDepthWrite(prevDepthWrite);
            gd.setBlending(prevBlending);
        },
        
        
        SetNoBlending: function(gd) {
            if(gd) {
                gd.setBlending(false);
            }
        },
        
        
        SetAdditiveBlending: function(gd) {
            if(gd) {
                gd.setBlending(true);
                gd.setBlendEquation(pc.BLENDEQUATION_ADD);
                gd.setBlendFunction(pc.BLENDMODE_ONE, pc.BLENDMODE_ONE);
            }
        },
        
        
        SetAlphaBlending: function(gd) {
            if(gd) {
                gd.setBlending(true);
                gd.setBlendEquation(pc.BLENDEQUATION_ADD);
                gd.setBlendFunction(pc.BLENDMODE_SRC_ALPHA, pc.BLENDMODE_ONE_MINUS_SRC_ALPHA);
            }
        },


        _loadLevel: function (levelName) {

            if (levelName) {

                var self = this;
                var request = new pc.resources.PackRequest(levelName);

                context.loader.request(request).then(function (resources) {

                    self.currentLevelPack = resources[0];

                    context.root.addChild(self.currentLevelPack.hierarchy);

                    //pc.fw.ComponentSystem.initialize(self.currentLevelPack.hierarchy);
                    pc.ComponentSystem.initialize(self.currentLevelPack.hierarchy);
                });
            }
        },


        _unloadLevel: function () {

            if (this.currentLevelPack) {
                this.currentLevelPack.hierarchy.destroy(context.systems);
                this.currentLevelPack = null;
            }
        },


        onLoadMenu: function () {
            this._unloadLevel();
            this._loadLevel(window.ScreenManager.Menu.id);
        },


        onLoadLevel: function (levelId) {
            if (levelId) {
                this._unloadLevel();
                this._loadLevel(levelId);
            }
        }
    };

    return ScreenManager;
});
