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
        this.soundManager = null;

        this.realShipModel = null;
        this.realPadModel = null;
        this.realPadHaloModel = null;
        this.realPlayerWinsTexture = null;
        this.realContinueTexture = null;

        this.lighting = {
            ambient: new pc.Color(0.2, 0.2, 0.2),
            gammaCorrection: false,
            exposure: 0.4,
            lights: [
                { position: new pc.Vec3(-100.0, 100.0, 30.0), direction: new pc.Vec3(-0.69171, 0.69171, 0.20751), radius: 1000.0, color: new pc.Color(1.0, 1.0, 1.0) },
                { position: new pc.Vec3(100.0, -100.0, -30.0), direction: new pc.Vec3(0.69171, -0.69171, 0.20751), radius: 1000.0, color: new pc.Color(0.3, 0.3, 0.3) }
            ]
        };

        this.elapsedTime = 0.0;
    };


    EndScreen.prototype = {
        
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.root = context.root.getChildren()[0];
            this.screenManager = this.root.script.ScreenManager;
            this.gameManager = this.root.script.GameManager;
            this.soundManager = this.root.script.SoundManager;
        },
        
        
        SetFocus: function (focus) {

            if (focus) {
                var winner = this.gameManager.GetWinner();

                var assets = [];
                assets[0] = context.assets.getAssetById(winner.ShipId);
                assets[1] = context.assets.getAssetById(this.padModel);
                assets[2] = context.assets.getAssetById(this.padHaloModel);
                assets[4] = context.assets.getAssetById(this.continueTexture);

                if (winner.Winner === 0) {
                    assets[3] = context.assets.getAssetById(this.playerWinTextures[0]);
                } else {
                    assets[3] = context.assets.getAssetById(this.playerWinTextures[1]);
                }

                context.assets.load(assets).then(function (resources) {
                    this.realShipModel = resources[0];
                    this.realPadModel = resources[1];
                    this.realPadHaloModel = resources[2];
                    this.realPlayerWinsTexture = resources[3];
                    this.realContinueTexture = resources[4];
                }.bind(this));
            } else {
                this.realShipModel = null;
                this.realPadModel = null;
                this.realPadHaloModel = null;
                this.realPlayerWinsTexture = null;
                this.realContinueTexture = null;
            }
        },
        
        
        ProcessInput: function (dt, inputManager) {

            if (!inputManager)
                return;

            for (var i = 0; i < this.gameManager.gameMode; i++) {

                if (inputManager.WasAButtonPressed(i) ||
                    inputManager.WasBButtonPressed(i) ||
                    inputManager.WasXButtonPressed(i) ||
                    inputManager.WasYButtonPressed(i) ||
                    inputManager.WasLeftShoulderPressed(i) ||
                    inputManager.WasRightShoulderPressed(i) ||
                    inputManager.WasLeftStickPressed(i) ||
                    inputManager.WasRightStickPressed(i) ||
                    inputManager.WasBackButtonPressed(i) ||
                    inputManager.WasStartButtonPressed(i) ||
                    inputManager.WasKeyPressed(i, pc.KEY_RETURN) ||
                    inputManager.WasKeyPressed(i, pc.KEY_ESCAPE) ||
                    inputManager.WasKeyPressed(i, pc.KEY_B) ||
                    inputManager.WasKeyPressed(i, pc.KEY_SPACE)) {

                    this.screenManager.SetNextScreen(ScreenManager.ScreenType.IntroScreen);
                    this.soundManager.PlaySound(SoundManager.Sound.MenuCancel);
                }
            }
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

            var aspect = gd.width / gd.height;
            var projection = new pc.Mat4().setPerspective(45, aspect, 1.0, 1000.0);

            var cameraPos = new pc.Vec3(0.0, 1.0, -3.0);
            var target = new pc.Vec3().copy(pc.Vec3.ZERO);
            var upDir = new pc.Vec3().copy(pc.Vec3.UP);

            var view = new pc.Mat4().setLookAt(cameraPos, target, upDir);
            view.invert();
            var viewProjection = new pc.Mat4();

            viewProjection.mul2(projection, view);

            var rotation = new pc.Mat4().setFromEulerAngles(0.0, this.elapsedTime * 5.0, 0.0);
            var transform = new pc.Mat4();

            // draw ship model
            if (this.realShipModel) {
                transform.setTranslate(0.0, 0.3, 0.0);
                transform.mul(rotation);
                this.gameManager.DrawModel(gd, GameManager.RenderTechnique.NormalMapping, this.realShipModel, cameraPos, transform, view, projection, viewProjection, this.lighting);
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
            gd.setDepthTest(true);

            // draw the pad halo model
            if (this.realPadHaloModel) {
                transform.setTranslate(0.0, -0.3, 0.0);
            this.gameManager.DrawModel(gd, GameManager.RenderTechnique.PlainMapping, this.realPadHaloModel, cameraPos, transform, view, projection, viewProjection, null);
            }

            // restore previous states
            gd.setDepthTest(prevDepthTest);
            gd.setDepthWrite(prevDepthWrite);
            gd.setBlending(prevBlending);
        },
        
        
        Draw2D: function (gd, fontManager) {

            if (!gd)
                return;

            var white = new pc.Vec4().copy(pc.Vec4.ONE);
            var rect = new pc.Vec4(0, 0, 0, 0);

            var screenSizeX = gd.width;
            var screenSizeY = gd.height;

            // draw continue message
            if (this.realContinueTexture) {
                rect.z = this.realContinueTexture.width;
                rect.w = this.realContinueTexture.height;
                rect.y = screenSizeY - rect.w - 60;
                rect.x = screenSizeX / 2 - rect.z / 2;
                this.screenManager.DrawTexture(gd, this.realContinueTexture, rect, white, ScreenManager.BlendMode.AlphaBlending);
            }

            // deaw winning player number
            if (this.realPlayerWinsTexture) {
                rect.z = this.realPlayerWinsTexture.width;
                rect.w = this.realPlayerWinsTexture.height;
                rect.y = 20;
                rect.x = screenSizeX / 2 - rect.z / 2;
                this.screenManager.DrawTexture(gd, this.realPlayerWinsTexture, rect, white, ScreenManager.BlendMode.AlphaBlending);
            }
        }
    };

    return EndScreen;
});