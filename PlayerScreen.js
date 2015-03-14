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

pc.script.attribute('padSelectModel', 'asset', [],
{
    type: 'model',
    max: 1
});

pc.script.attribute('changeShipTextures', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('rotateShipTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('selectBackTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});


pc.script.attribute('selectCancelTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});


pc.script.attribute('invertYCheckTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('invertYUncheckTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});


pc.script.create('PlayerScreen', function (context) {
    
    // Creates a new PlayerScreen instance
    var PlayerScreen = function (entity) {
        this.entity = entity;
        this.root = null;
        
        this.screenManager = null;
        this.gameManager = null;
        this.soundManager = null;
        
        this.realShipModels = null;

        this.realPadModel = null;
        this.realPadHaloModel = null;
        this.realPadSelectModel = null;

        this.realChangeShipTexture = null;
        this.realRotateShipTexture = null;

        this.realSelectBackTexture = null;
        this.realSelectCancelTexture = null;

        this.realInvertYCheckTexture = null;
        this.realInvertYUncheckTexture = null;

        this.selection = [0, 1];
        this.confirmed = [false, false];
        
        this.invertY = 0;
        
        this.rotation = [new pc.Mat4(), new pc.Mat4()];
        this.rotate = [0.0, 0.0];
        this.rotationVelocity = 0.0;

        this.countDownTimer = 0.0;
        this.rotationDir = [1.0, 1.0];

        this.elapsedTime = 0.0;

        this.lighting = {
            ambient: new pc.Color(0.2, 0.2, 0.2),
            gammaCorrection: false,
            exposure: 0.4,
            lights: [
                { position: new pc.Vec3(-100.0, 100.0, 30.0), direction: new pc.Vec3(-0.69171, 0.69171, 0.20751), radius: 1000.0, color: new pc.Color(1.0, 1.0, 1.0) },
                { position: new pc.Vec3(100.0, -100.0, -30.0), direction: new pc.Vec3(0.69171, -0.69171, 0.20751), radius: 1000.0, color: new pc.Color(0.3, 0.3, 0.3)}
            ]
        };
    };

    
    window.PlayerScreen =
    {
        MaxShips: 2,

        AssetLoadOrder: Object.freeze(
        {
            PadModel: 0,
            PadHaloModel: 1,
            PadSelectModel: 2,
            ChangeShipTexture: 3,
            RotateShipTexture: 4,
            SelectBackTexture: 5,
            SelectCancelTexture: 6,
            InvertYCheckTexture: 7,
            InvertYUncheckTexture: 8,
            ShipModels: 9
        })
    };
    
    
    PlayerScreen.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.root = context.root.getChildren()[0];
            this.screenManager = this.root.script.ScreenManager;
            this.gameManager = this.root.script.GameManager;
            this.soundManager = this.root.script.SoundManager;
            
            this.selection = [0, 1];
            this.confirmed[0] = false;
            this.confirmed[1] = false;

            this.invertY = 0;
        
            this.rotation = [new pc.Mat4(), new pc.Mat4()];
            this.rotate = [0.0, 0.0];
            this.rotationVelocity = 30.0;

            this.countDownTimer = 3.0;
            this.rotationDir = [1.0, 1.0];

            this.elapsedTime = 0.0;
        },
        
        
        SetFocus: function(focus) {
            
            if(focus) {
                this.countDownTimer = 3.0;
                this.rotationDir = [1.0, 1.0];

                this.confirmed[0] = false;
                this.confirmed[1] = (this.gameManager.gameMode === GameManager.GameMode.SinglePlayer);
                
                this.rotation[0].copy(pc.Mat4.IDENTITY);
                this.rotation[1].copy(pc.Mat4.IDENTITY);

                this.rotate = [0.0, 0.0];

                var assets = [
                    context.assets.getAssetById(this.padModel),
                    context.assets.getAssetById(this.padHaloModel),
                    context.assets.getAssetById(this.padSelectModel),
                    context.assets.getAssetById(this.changeShipTextures),
                    context.assets.getAssetById(this.rotateShipTexture),
                    context.assets.getAssetById(this.selectBackTexture),
                    context.assets.getAssetById(this.selectCancelTexture),
                    context.assets.getAssetById(this.invertYCheckTexture),
                    context.assets.getAssetById(this.invertYUncheckTexture)
                ];

                for (var x = 0; x < this.shipModels.length; x++)
                    assets[assets.length] = context.assets.getAssetById(this.shipModels[x]);

                context.assets.load(assets).then(function (resources) {
                    this.realPadModel = resources[window.PlayerScreen.AssetLoadOrder.PadModel];

                    this.realPadHaloModel = resources[window.PlayerScreen.AssetLoadOrder.PadHaloModel];
                    this.realPadSelectModel = resources[window.PlayerScreen.AssetLoadOrder.PadSelectModel];

                    this.realChangeShipTexture = resources[window.PlayerScreen.AssetLoadOrder.ChangeShipTexture];
                    this.realRotateShipTexture = resources[window.PlayerScreen.AssetLoadOrder.RotateShipTexture];

                    this.realSelectBackTexture = resources[window.PlayerScreen.AssetLoadOrder.SelectBackTexture];
                    this.realSelectCancelTexture = resources[window.PlayerScreen.AssetLoadOrder.SelectCancelTexture];

                    this.realInvertYCheckTexture = resources[window.PlayerScreen.AssetLoadOrder.InvertYCheckTexture];
                    this.realInvertYUncheckTexture = resources[window.PlayerScreen.AssetLoadOrder.InvertYUncheckTexture];

                    this.realShipModels = [];
                    for (var x = 0; x < this.shipModels.length; x++) {
                        this.realShipModels[x] = resources[window.PlayerScreen.AssetLoadOrder.ShipModels + x];
                    }
                }.bind(this));
            } else {
                this.realShipModels = null;

                this.realPadModel = null;
                this.realPadHaloModel = null;
                this.realPadSelectModel = null;

                this.realChangeShipTextures = null;
                this.realRotateShipTexture = null;

                this.realSelectBackTexture = null;
                this.realSelectCancelTexture = null;

                this.realInvertYCheckTexture = null;
                this.realInvertYUncheckTexture = null;
            }
        },
        
        
        ProcessInput: function(dt, inputManager) {
            
            if(!inputManager)
                return;
            
            var j = this.gameManager.gameMode;
            
            for(var i = 0; i < j; i++) {
                
                if(!this.confirmed[i]) {
                    
                    // change invert Y selection 
                    if (inputManager.WasKeyPressed(i, pc.KEY_Y) || inputManager.WasYButtonPressed(i)) {
                        this.invertY ^= (1 << i);
                        this.soundManager.PlaySound(SoundManager.Sound.MenuChange);
                    }

                    // confirm selection
                    if (inputManager.WasKeyPressed(i, pc.KEY_RETURN) || inputManager.WasAButtonPressed(i) || inputManager.WasStartButtonPressed(i)) {
                        this.confirmed[i] = true;
                        this.soundManager.PlaySound(SoundManager.Sound.MenuSelect);
                    }

                    // cancel and return to intro menu
                    if (inputManager.WasKeyPressed(i, pc.KEY_B) || inputManager.WasBButtonPressed(i) || inputManager.WasBackButtonPressed(i)) {
                        this.gameManager.SetShips(null, null, 0);
                        this.screenManager.SetNextScreen(ScreenManager.ScreenType.IntroScreen);
                        this.soundManager.PlaySound(SoundManager.Sound.MenuCancel);
                    }


                    // rotate ship
                    var rotate = this.rotationVelocity * inputManager.LeftStick(i).x * dt;
                    if (Math.abs(rotate) > 0.001) {
                        this.rotationDir[i] = (rotate < 0.0 ? -1.0 : 1.0);
                    }

                    if (inputManager.IsKeyDown(i, pc.KEY_LEFT)) {
                        rotate -= this.rotationVelocity * dt;
                        this.rotationDir[i] = -1.0;
                    }
                        
                    if (inputManager.IsKeyDown(i, pc.KEY_RIGHT)) {
                        rotate += this.rotationVelocity * dt;
                        this.rotationDir[i] = 1.0;
                    }
                        
                    if (Math.abs(rotate) < 0.001) {

                        this.countDownTimer -= dt;

                        if (this.countDownTimer <= 0.0) {
                            rotate = this.rotationVelocity * dt * this.rotationDir[i];
                            this.countDownTimer = 0.0;
                        }
                    }
                    else {
                        this.countDownTimer = 3.0;
                    }

                    //this.rotation[i].setFromEulerAngles(0.0, this.elapsedTime * this.rotationVelocity, 0.0);
                    this.rotate[i] += rotate;
                    this.rotation[i].setFromEulerAngles(0.0, this.rotate[i], 0.0);


                    // change ship (next)
                    if (inputManager.WasKeyPressed(i, pc.KEY_UP) || inputManager.WasDPadUpButtonPressed(i) || inputManager.WasLeftStickUpPressed(i)) {
                        this.selection[i] = (this.selection[i] + 1) % window.PlayerScreen.MaxShips;
                        this.soundManager.PlaySound(SoundManager.Sound.MenuChange);
                    }

                    // change ship (previous)
                    if (inputManager.WasKeyPressed(i, pc.KEY_DOWN) || inputManager.WasDPadDownButtonPressed(i) || inputManager.WasLeftStickDownPressed(i)) {
                        if (this.selection[i] === 0)
                            this.selection[i] = window.PlayerScreen.MaxShips - 1;
                        else
                            this.selection[i] = this.selection[i] - 1;
                            
                        this.soundManager.PlaySound(SoundManager.Sound.MenuChange);
                    }
                } else {
                    // cancel selection
                    if (inputManager.WasKeyPressed(i, pc.KEY_ESCAPE) || inputManager.WasBButtonPressed(i)) {
                        this.confirmed[i] = false;
                        this.soundManager.PlaySound(SoundManager.Sound.MenuCancel);
                    }
                }
            }

            // if both ships confirmed, go to game screen
            if (this.confirmed[0] && this.confirmed[1]) {
                if (this.gameManager.GameMode == GameManager.GameMode.SinglePlayer)
                    this.gameManager.SetShips(this.shipModels[this.selection[0]], null, this.invertY);
                else
                    this.gameManager.SetShips(this.shipModels[this.selection[0]], this.shipModels[this.selection[1]], this.invertY);
                    
                this.realShipModels = [];
                this.screenManager.SetNextScreen(ScreenManager.ScreenType.LevelScreen);
            }
        },
        
        
        Update: function(dt) {
            this.elapsedTime += dt;
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

            var aspect = gd.width / gd.height;
            var projection = new pc.Mat4().setPerspective(45, aspect, 1.0, 1000.0);

            var cameraPos = new pc.Vec3(0.0, 1.0, -3.0);
            var target = new pc.Vec3().copy(pc.Vec3.ZERO);
            var upDir = new pc.Vec3().copy(pc.Vec3.UP);

            var view = new pc.Mat4().setLookAt(cameraPos, target, upDir);
            view.invert();
            var viewProjection = new pc.Mat4();

            viewProjection.mul2(projection, view);

            var transform = new pc.Mat4();

            // if single player mode
            if (this.gameManager.GameMode === GameManager.GameMode.SinglePlayer) {

                // draw ship model
                if (this.realShipModels && this.realShipModels[0]) {
                    transform.setTranslate(0.0, 0.3, 0.0);
                    transform.mul(this.rotation[0]);
                    this.gameManager.DrawModel(gd, GameManager.RenderTechnique.NormalMapping, this.realShipModels[this.selection[0]], cameraPos, transform, view, projection, viewProjection, this.lighting);
                }

                // draw the pad model
                if (this.realPadModel) {
                    transform.setTranslate(0.0, 0.0, 0.0);
                    this.gameManager.DrawModel(gd, GameManager.RenderTechnique.NormalMapping, this.realPadModel, cameraPos, transform, view, projection, viewProjection, this.lighting);
                }

                // save previous states
                var prevBlending = gd.getBlending();
                var prevDepthWrite = gd.getDepthWrite();
                var prevDepthTest = gd.getDepthTest();

                // set additive blend
                this.screenManager.SetAdditiveBlending();
                gd.setDepthWrite(false);
                gd.setDepthTest(false);

                // draw the pad halo model
                //if (this.realPadHaloModel) {
                //    transform.setTranslate(0.0, -0.3, 0.0);
                    //this.gameManager.DrawModel(gd, GameManager.RenderTechnique.PlainMapping, this.realPadHaloModel, cameraPos, transform, view, projection, viewProjection, null);
                //}

                // enable glow (alpha not zero)
                this.screenManager.SetAlphaBlending();

                // if not confirmed draw animated selection circle
                if (!this.confirmed[0] && this.realPadSelectModel) {
                    var t = new pc.Vec3(0.0, 0.0, 0.0);
                    var r = new pc.Quat();
                    var scale = 1.0 + 0.03 * Math.cos(this.elapsedTime * 7.0);
                    var s = new pc.Vec3(scale, scale, scale);

                    transform.setIdentity();
                    transform.setTRS(t, r, s);
                    this.gameManager.DrawModel(gd, GameManager.RenderTechnique.PlainMapping, this.realPadSelectModel, cameraPos, transform, view, projection, viewProjection, null);
                }

                // restore previous states
                gd.setDepthTest(prevDepthTest);
                gd.setDepthWrite(prevDepthWrite);
                gd.setBlending(prevBlending);

            } else {
            }
        },
        
        
        Draw2D: function (gd, fontManager) {

            if (!gd)
                return;

            var white = new pc.Vec4().copy(pc.Vec4.ONE);

            var rect = new pc.Vec4().copy(pc.Vec4.ZERO);

            var scrX = gd.canvas.offsetWidth;
            var scrY = gd.canvas.offsetHeight;

            // if single player mode
            if (this.gameManager.GameMode === GameManager.GameMode.SinglePlayer) {

                if (this.realSelectBackTexture) {
                    rect.x = (gd.canvas.offsetWidth - this.realSelectBackTexture.width) / 2.0;
                    rect.y = 50;
                    rect.z = this.realSelectBackTexture.width;
                    rect.w = this.realSelectBackTexture.height;

                    if (this.confirmed[0] && this.realSelectCancelTexture) {
                        rect.z = this.realSelectCancelTexture.width;
                        rect.w = this.realSelectCancelTexture.height;
                        this.screenManager.DrawTexture(gd, this.realSelectCancelTexture, rect, white, ScreenManager.BlendMode.AlphaBlending);
                    } else {
                        this.screenManager.DrawTexture(gd, this.realSelectBackTexture, rect, white, ScreenManager.BlendMode.AlphaBlending);
                    }
                }

                if (this.realInvertYChecktexture && this.realInvertYUncheckTexture) {
                    rect.x = (gd.canvas.offsetWidth - this.realInvertYCheckTexture.width) / 2.0;
                    rect.y = gd.canvas.offsetHeight - this.realInvertYCheckTexture.height - 30.0;
                    rect.z = this.realInvertYCheckTexture.width;
                    rect.w = this.realInvertYCheckTexture.height;

                    if ((this.invertY & 1) === 0) {
                        this.screenManager.DrawTextue(gd, this.realInvertYUncheckTexture, rect, white, ScreenManager.BlendMode.AlphaBlending);
                    } else {
                        this.screenManager.DrawTextue(gd, this.realInvertYCheckTexture, rect, white, ScreenManager.BlendMode.AlphaBlending);
                    }
                }

                if (this.realChangeShipTexture) {
                    rect.x = (gd.canvas.offsetWidth / 5.0 - this.realChangeShipTexture.width / 2.0);
                    rect.y = 60.0;
                    rect.z = this.realChangeShipTexture.width;
                    rect.w = this.realChangeShipTexture.height;
                    this.screenManager.DrawTexture(gd, this.realChangeShipTexture, rect, white, ScreenManager.BlendMode.AlphaBlending);
                }

                if (this.realRotateShipTexture) {
                    rect.x = (gd.canvas.offsetWidth * 0.8 - this.realRotateShipTexture.width * 0.5);
                    rect.y = 60.0;
                    rect.z = this.realRotateShipTexture.width;
                    rect.w = this.realRotateShipTexture.height;
                    this.screenManager.DrawTexture(gd, this.realRotateShipTexture, rect, white, ScreenManager.BlendMode.AlphaBlending);
                }

            } else {
            }
        },
    };

    return PlayerScreen;
});
