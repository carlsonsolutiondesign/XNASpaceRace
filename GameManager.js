//------------------------------------------------------------------------------------------------------------------------
// PlayCanvas Defines      - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.html
//                           (PIXELFORMAT, etc.)
//
// GraphicsDevice          - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.GraphicsDevice.html
// RenderTarget            - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.RenderTarget.html
// Texture                 - http://developer.playcanvas.com/en/engine/api/stable/symbols/pc.Texture.html
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
pc.script.attribute('spCrosshairTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('spScoreTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('spMissileTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('spEnergyTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('spHUDBarsTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});


pc.script.attribute('mpCrosshairTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('mpScoreTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('mpMissileTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('mpEnergyTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});

pc.script.attribute('mpHUDBarsTexture', 'asset', [],
{
    type: 'texture',
    max: 1
});


pc.script.create('GameManager', function (context) {

    // Creates a new GameManager instance
    var GameManager = function (entity) {
        
        this.entity = entity;
        this.root = null;
        
        this.screenManager = null;
        this.animSpriteManager = null;
        this.projectileManager = null;
        this.particleManager = null;
        this.powerupManager = null;
		this.soundManager = null;
		this.playerClient = null;

        this.gameMode = null;
        this.currentLevel = null;

        this.players = null;
        this.invertYAxis = 0;
		
        this.realCrosshairTexture = null;
        this.realScoreTexture = null;
        this.realMissileTexture = null;
        this.realEnergyTexture = null;
        this.realHUDBarsTexture = null;

        this.elapsedTime = 0;

        this.plainShader = null;
        this.previewShader = null;

        this.projId = null;
        this.viewId = null;
        this.viewId3 = null;
        this.viewInvId = null;
        this.viewProjId = null;
        this.viewPosId = null;
        this.nearClipId = null;
        this.farClipId = null;
        this.lightRadiusId = null;

        this.fogColorId = null;
        this.fogStartId = null;
        this.fogEndId = null;
        this.fogDensityId = null;

        this.modelMatrixId = null;
        this.normalMatrixId = null;
        this.poseMatrixId = null;
        this.boneTextureId = null;
        this.boneTextureSizeId = null;

        this.alphaTestId = null;
        this.shadowEnableId = null;

        // Shadows
        this._shadowAabb = new pc.shape.Aabb();
        this._sceneAabb = new pc.shape.Aabb();
        this._shadowState = { blend: false };
        this.centroid = new pc.Vec3();

        this.fog = pc.FOG_NONE;
        this.fogColor = new Float32Array(3);
        this.fogStart = 1;
        this.fogEnd = 1000;
        this.fogDensity = 0;

        this.ambientColor = new Float32Array(3);
        this.ambientLight = new pc.Color(0, 0, 0);

        this._gammaCorrection = false;
        this._toneMapping = 0;
        this.exposure = 1.0;
        this._prefilteredCubeMap128 = null;
        this._prefilteredCubeMap64 = null;
        this._prefilteredCubeMap32 = null;
        this._prefilteredCubeMap16 = null;
        this._prefilteredCubeMap8 = null;
        this._prefilteredCubeMap4 = null;
        this._skyboxCubeMap = null;
        this._skyboxModel = null;

        // Models
        this._models = [];

        // Lights
        this._lights = [];
        this._globalLights = [];
        this._localLights = [[], []];
    };

    window.GameManager =
    {
        Levels: Object.freeze({ SmallSpace: 0, RedSpace: 1, DoubleSpace: 2 }),
    };

    window.GameManager.LevelIds = Object.freeze([
        { name: window.GameManager.Levels.SmallSpace, id: 353946 },
        { name: window.GameManager.Levels.RedSpace, id: 352304 },
        { name: window.GameManager.Levels.DoubleSpace, id: 352639 }
    ]);

    window.GameManager.GameMode = Object.freeze({None: 0, SinglePlayer: 1, MultiPlayer: 2});
    window.GameManager.MaxPlayers = 2;
    window.GameManager.PlayerId = Object.freeze({PlayerOne: 'AACC', PlayerTwo: 'BBDD'});

    window.GameManager.RenderTechnique = Object.freeze(
    {
        PlainMapping: 0,                        // plain texture mapping
        NormalMapping: 1,                       // normal mapping
        ViewMapping: 2                          // view aligned mapping (used for blaster)
    });

    window.GameManager.AnimSpriteType = Object.freeze(
    {
        Blaster: 0,                             // blaster hit
        Missle: 1,                              // missle explode
        Ship: 2,                                // ship explode
        Spawn: 3,                               // ship/object spawn
        Shield: 4                               // ship shield
    });

    window.GameManager.ProjectileType = Object.freeze(
    {
        Blaster: 0,                             // blaster projectile
        Missle: 1                               // missle projectile
    });
    
    window.GameManager.ParticleSystemType = Object.freeze(
    {
        ShipExplode: 0,                         // ship explode
        ShipTrail: 1,                           // ship trail
        MissleExplode: 2,                       // missle explode
        MissleTrail: 3,                         // missle trail
        BlasterExplode: 4                       // blaster explode
    });

    window.GameManager.PowerupType = Object.freeze(
    {
        Energy: 0,                              // 50% energy
        Missle: 1                               // 3 missles
    });

    
    GameManager.prototype = {

        // Called once after all resources are loaded and before the first update
        initialize: function () {
            
            this.root = context.root.getChildren()[0];

            this.screenManager = this.root.script.ScreenManager;
            this.animSpriteManager = this.root.script.AnimSpriteManager;
            this.projectileManager = this.root.script.ProjectileManager;
            this.particleManager = this.root.script.ParticleManager;
            this.powerupManager = this.root.script.PowerupManager;
			this.soundManager = this.root.script.SoundManager;
			this.playerClient = this.root.script.PlayerClient;

            this.currentLevel = 0;
            this.gameMode = window.GameManager.GameMode.SinglePlayer;

            this.AddPlayerListNode();

			this.screenManager.on('LevelLoaded', this.onLevelLoaded, this);
			this.screenManager.on('LevelUnloaded', this.onLevelUnloaded, this);

			this.on('PlayerJoined', this.PlayerJoined, this);
			this.on('PlayerRejoined', this.PlayerRejoined, this);
			this.on('PlayerQuit', this.PlayerQuit, this);
			this.on('PlayerSpawned', this.PlayerSpawned, this);
			this.on('PlayerUpdate', this.PlayerUpdate, this);
        },
        
		
        AddPlayerListNode: function () {
            this.players = context.root.findByName('Players');
            if (!this.players) {
                this.players = new pc.Entity();
                this.players.name = 'Players';
                context.root.addChild(this.players);
            }
        },


        FindPlayer: function (playerId) {
            if (!this.players)
                this.AddPlayerListNode();

            var players = this.players.getChildren();
            for (var i = 0; i < players.length; i++) {
                var playerShip = players[i].script.PlayerShip;
                if (playerShip.playerId === playerId || (playerShip.localId && playerShip.localId === playerId)) {
                    return players[i];
                }
            }

            return null;
        },


        FindLocalPlayers: function () {
            if (!this.players)
                this.AddPlayerListNode();

            var localPlayers = [];
            var players = this.players.getChildren();
            for (var i = 0; i < players.length; i++) {
                if (players[i].script.PlayerShip.isLocalPlayer) {
                    localPlayers.push(players[i]);
                }
            }

            return localPlayers;
        },


        PlayerJoined: function (msg) {
            var localPlayers = this.FindLocalPlayers();

            if (localPlayers) {
                switch(localPlayers.length) {
                    case 0:
                        var playerOne = this.AddPlayer('player1', window.GameManager.PlayerId.PlayerOne, true);
                        if (playerOne)
                            playerOne.script.PlayerShip.playerId = msg.playerId;
                        break;

                    case 1:
                        localPlayers[0].script.PlayerShip.playerId = msg.playerId;
                        break;
                }
            }
        },		


		PlayerRejoined: function (msg) {
		    var localPlayers = this.FindLocalPlayers();

		    if (localPlayers) {
		        switch (localPlayers.length) {
		            case 0:
		                var playerOne = this.AddPlayer('player1', window.GameManager.PlayerId.PlayerOne, true);
		                if (playerOne)
		                    playerOne.script.PlayerShip.playerId = msg.playerId;
		                break;

		            case 1:
		                localPlayers[0].script.PlayerShip.playerId = msg.playerId;
		                break;
		        }
		    }
		},
		
		
		PlayerQuit: function (msg) {
		    var player = this.FindPlayer(msg.playerId);

		    if (player) {
		        this.players.removeChild(player);
		        player.destroy();
			}
		},		
		
		
		PlayerSpawned: function (msg) {
		    var player = this.FindPlayer(msg.playerId);

		    if (player) {
		        if (!player.script.PlayerShip.isLocalPlayer)
		            player.script.PlayerShip.Spawn();
		        return;
		    }

		    // if the player was not found, add them, spawn and update
		    player = this.AddPlayer('networkPlayer-' + Date(), msg.playerId, false);
			if (player)
			    player.script.PlayerShip.shipId = msg.shipId;
		},
		
		
		PlayerUpdate: function (msg) {
		    var player = this.FindPlayer(msg.playerId);

		    if (player) {
		        if (!player.script.PlayerShip.isLocalPlayer)
		            player.script.PlayerShip.SvrUpdate(msg.position, msg.orientation);
		        return;
		    }

		    // if the player was not found, add them, spawn and update
		    player = this.AddPlayer('networkPlayer-' + Date(), msg.playerId, false);
            if(player)
			    player.script.PlayerShip.shipId = msg.shipId;
		},
		
		
		AddPlayer: function (name, playerId, localPlayer) {
            // make sure that the player doesn't already exist
		    var player = this.FindPlayer(playerId);

		    if (!player) {
		        player = new pc.Entity(context);
		        player.setName(name);

		        player.addComponent('model', { type: 'asset' });

		        context.systems.script.addComponent(player,
                {
                    scripts:
                    [
                        { url: 'PlayerShip.js', name: 'PlayerShip' },
                        { url: 'Collider.js', name: 'Collider' }
                    ]
                });

		        player.script.PlayerShip.playerId = playerId
		        player.script.PlayerShip.shipId = 0;
		        player.script.PlayerShip.isLocalPlayer = localPlayer;

		        if (localPlayer) {
		            player.script.PlayerShip.localId = playerId;
		            player.script.PlayerShip.playerClient = this.playerClient;

		            var cameraOffset = new pc.Entity(context);
		            cameraOffset.name = 'CameraOffset';
		            player.addChild(cameraOffset);
		        }

		        this.players.addChild(player);
		    }

            return player;
		},


		StartSimulation: function (filename, filters) {
		    if (typeof filename === 'undefined')
		        filename = 'xnaspacerace.simulation.log';

		    if (typeof filters === 'undefined') {
		        filters = ['ServerSpawn', 'ServerUpdate', 'ServerQuit'];
		    }
		    this.playerClient.fire('ClientSimulate', filename, filters);
		},


		SetShips: function (player1ShipId, player2ShipId, invertYAxis) {
            if (this.gameMode === window.GameManager.GameMode.SinglePlayer) {
                var localPlayers = this.FindLocalPlayers();
                // remove player two
                if(localPlayers) {
                    for (var i = 0; i < localPlayers.length; i++){
                        if (localPlayers[i].script.PlayerShip.localId === window.GameManager.PlayerId.PlayerTwo) {
                            this.players.removeChild(localPlayers[i]);
                            localPlayers[i].destroy();
                        }
                    }
                }
            }

            // update player one shipId or add player
            if (player1ShipId) {
                var playerOne = this.AddPlayer('player1', window.GameManager.PlayerId.PlayerOne, true);
                if (playerOne) {
                    playerOne.script.PlayerShip.shipId = player1ShipId;
                    if (playerOne.model.model) {
                        playerOne.model.model = null;
                    }
                }
            }

		    // update player two shipId or add player
            if (player2ShipId) {
                var playerTwo = this.AddPlayer('player2', window.GameManager.PlayerId.PlayerTwo, true);
                if (playerTwo) {
                    playerTwo.script.PlayerShip.shipId = player2ShipId;
                    if (playerTwo.model.model) {
                        playerTwo.model.model = null;
                    }
                }
            }

            this.invertYAxis = invertYAxis;
        },


        GetWinner: function () {

            if (this.players) {
                // since there are only two Winner textures to choose from on the EndScreen.js:
                //     Player One Wins, or Player Two Wins
                // during a local multiplayer game the Player Wins textures reflect correctly
                //
                // during a networked game Player One refers to the local player, and Player Two is 
                // the networked player
                var winnerId = '';
                var winnerTextureIndex = 0;
                var winnerShipId = 0;
                var highestScore = 0;

                var players = this.players.getChildren();

                // incase only one player, and the player exited the game make them the winner
                if (players.length === 1) {
                    return { Winner: winnerTextureIndex, ShipId: players[0].script.PlayerShip.shipId };
                }

                for (var i = 0; i < players.length; i++) {
                    if (players[i].script.PlayerShip.score >= highestScore) {
                        // save the highest score, and the ship id
                        hightestScore = players[i].script.PlayerShip.score;
                        winnerShipId = players[i].script.PlayerShip.shipId;
                        winnerTextureIndex = 1;

                        // if it is a local player it is either player one with network play (and socket id)
                        // or player two with the original assigned id
                        if (players[i].script.PlayerShip.isLocalPlayer) {
                            if (players[i].script.PlayerShip.playerId === window.GameManager.PlayerId.PlayerTwo) {
                                winnerTextureIndex = 1;
                                winnerShipId = players[i].script.PlayerShip.shipId;
                            } else {
                                winnerTextureIndex = 0;
                                winnerShipId = players[i].script.PlayerShip.shipId;
                            }
                        }
                    }
                }

                return { Winner: winnerTextureIndex, ShipId: winnerShipId };

            } else {
                return { Winner: 0, ShipId: 0 };
            }
        },


		ProcessInput: function (dt, inputManager) {
			
			if (!inputManager)
				return;
		},
		
		
		Update: function (dt) {
			
			this.elapsedTime += dt;

		    // update players
			if (this.players) {
			    var players = this.players.getChildren();
			    for (var i = 0; i < players.length; i++) {
			        players[i].script.PlayerShip.Update(dt);

			        // network players motion is simulated
			        if (!players[i].script.PlayerShip.isLocalPlayer)
			            players[i].script.PlayerShip.__update(dt);
			    }
			}
		},
		
		
		Draw3D: function (gd) {
			
			if (!gd)
				return;
		},
		
		
		DrawHUD: function (gd, viewRect, bars, barsLeft, barsWidth, crosshair) {
			
			if (!gd)
				return;
			
			var white = new pc.Vec4().copy(pc.Vec4.ONE);
			var r = new pc.Vec4();
			
			// draw crosshair if requested
			if (crosshair && this.realCrosshairTexture) {
				r.x = viewRect.x + (viewRect.z - this.realCrosshairTexture.width) / 2.0;
				r.y = viewRect.y + (viewRect.w - this.realCrosshairTexture.height) / 2.0;
				r.z = this.realCrosshairTexture.width;
				r.w = this.realCrosshairTexture.height;
				
				this.screenManager.DrawTexture(gd, this.realCrosshairTexture, r, white, ScreenManager.BlendMode.AlphaBlending);
			}
			
			// draw the score HUD
			if (this.realScoreTexture) {
				r.x = viewRect.x + (viewRect.z - this.realScoreTexture.width) / 2.0;
				r.y = viewRect.y;
				r.z = this.realScoreTexture.width;
				r.w = this.realScoreTexture.height;
				
				this.screenManager.DrawTexture(gd, this.realScoreTexture, r, white, ScreenManager.BlendMode.AlphaBlending);
			}
			
			// draw the missile HUD
			if (this.realMissileTexture) {
				r.x = viewRect.x + viewRect.z - this.realMissileTexture.width;
				r.y = viewRect.y + viewRect.w - this.realMissileTexture.height;
				r.z = this.realMissileTexture.width;
				r.w = this.realMissileTexture.height;
				
				this.screenManager.DrawTexture(gd, this.realMissileTexture, r, white, ScreenManager.BlendMode.AlphaBlending);
			}
			
			// draw the energy HUB
			if (this.realEnergyTexture) {
				r.x = viewRect.x;
				r.y = viewRect.y + viewRect.w - this.realEnergyTexture.height;
				r.z = this.realEnergyTexture.width;
				r.w = this.realEnergyTexture.height;
				
				this.screenManager.DrawTexture(gd, this.realEnergyTexture, r, white, ScreenManager.BlendMode.AlphaBlending);
			}
			
			// draw bars
			if (this.realHUDBarsTexture) {
				
				var red = new pc.Color(1.0, 0.0, 0.0, 1.0);
				var green = new pc.Color(0.0, 1.0, 0.0, 1.0);
				var blue = new pc.Color(0.0, 0.0, 1.0, 1.0);
				
				var s = new pc.Vec4(0.0, 0.0, this.realHUDBarsTexture.width, this.realHUDBarsTexture.height);
				
				// draw energy bar
				s.z = barsLeft + (bars.x * barsWidth);
				this.screenManager.DrawClippedTexture(gd, this.realHUDBarsTexture, r, s, red, ScreenManager.BlendMode.AdditiveBlending);
				
				// draw the shield bar
				s.z = barsLeft + (bars.y * barsWidth);
				this.screenManager.DrawClippedTexture(gd, this.realHUDBarsTexture, r, s, green, ScreenManager.BlendMode.AdditiveBlending);
				
				// draw the boost bar
				s.z = barsLeft + (bars.z * barsWidth);
				this.screenManager.DrawClippedTexture(gd, this.realHUDBarsTexture, r, s, blue, ScreenManager.BlendMode.AdditiveBlending);
			}
		},
		
		
		Draw2D: function (gd) {
			
			if (!gd)
				return;

			var rect = new pc.Vec4();
			rect.z = gd.width;
			rect.w = gd.height;
			
			var localPlayers = this.FindLocalPlayers();
			if (localPlayers) {
			    switch (localPlayers.length) {
			        case 0:
			            return;

			        case 1:
			            if (localPlayers[0].script.PlayerShip.IsAlive()) {
			                // draw HUB
			                this.DrawHUD(gd, rect, localPlayers[0].script.PlayerShip.Bars(), 70, 120, !localPlayers[0].script.PlayerShip.camera3DPerson);

			                // draw missile count
			            }

			            // draw damage indicator
			            var color = localPlayers[0].script.PlayerShip.DamageColor();
			            if (color.a > 0) {
			                this.screenManager.FadeScene(gd, color);
			            }
			            break;

			        case 2:
			            break;
			    }
   			}
		},
		
		
        LoadContent: function () {
            var gd = context.graphicsDevice;

            this.CreateShaders(gd);
            this.CreateUniforms(gd);
        },
        
        
        UnloadContent: function() {
        },


        onLevelLoaded: function (levelName) {

            var assets = [];

            if (this.gameMode === window.GameManager.GameMode.SinglePlayer) {
                assets =
                [
                    context.assets.getAssetById(this.spCrosshairTexture),
                    context.assets.getAssetById(this.spScoreTexture),
                    context.assets.getAssetById(this.spMissileTexture),
                    context.assets.getAssetById(this.spEnergyTexture),
                    context.assets.getAssetById(this.spHUDBarsTexture),
                ];
            } else {
                assets =
                [
                    context.assets.getAssetById(this.mpCrosshairTexture),
                    context.assets.getAssetById(this.mpScoreTexture),
                    context.assets.getAssetById(this.mpMissileTexture),
                    context.assets.getAssetById(this.mpEnergyTexture),
                    context.assets.getAssetById(this.mpHUDBarsTexture),
                ];
            }

            context.assets.load(assets).then(function (resources) {
                this.realCrosshairTexture = resources[0];
                this.realScoreTexture = resources[1];
                this.realMissileTexture = resources[2];
                this.realEnergyTexture = resources[3];
                this.realHUDBarsTexture = resources[4];
            }.bind(this));
			
            var menuCamera = context.root.findByName('MenuCamera');
            if (menuCamera)
                menuCamera.enabled = false;

            var camera = context.root.findByName('Camera');
			if (!camera)
                console.log('Camera not found')

			if (this.players) {
			    var players = this.players.getChildren();
			    for (var p = 0; p < players.length; p++) {
			        players[p].script.PlayerShip.LevelLoaded(levelName);
			        if (players[p].script.PlayerShip.isLocalPlayer) {
                        if(camera)
			                players[p].script.PlayerShip.cameraManager = camera.script.CameraManager;
			        }
                }
			}
        },


        onLevelUnloaded: function () {
            if (this.players) {
                var players = this.players.getChildren();
                for (var p = 0; p < players.length; p++) {
                    if (players[p].model.model) {
                        players[p].model.model = null;
                    }
                }
            }
        },


        SetLevel: function (levelEnum) {

            if (window.GameManager.LevelIds && window.GameManager.LevelIds.length > 0) {

                var idx = 0;
                var found = false;
                for (idx = 0; idx < window.GameManager.LevelIds.length; idx++) {
                    if (window.GameManager.LevelIds[idx].name === levelEnum) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    this.screenManager.LoadMenu();
                    return;
                }

                this.currentLevel = window.GameManager.LevelIds[idx].name;
            }
        },


        LoadLevel: function (levelEnum) {

            if (window.GameManager.LevelIds && window.GameManager.LevelIds.length > 0) {

                var idx = 0;
                var found = false;
                for (idx = 0; idx < window.GameManager.LevelIds.length; idx++) {
                    if (window.GameManager.LevelIds[idx].name === levelEnum) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    this.screenManager.LoadMenu();
                    return;
                } else {
                    this.currentLevel = window.GameManager.LevelIds[idx].name;
                    this.screenManager.LoadLevel(window.GameManager.LevelIds[this.currentLevel].id);
                }
            }
        },

        
        NextLevel: function () {

            if (window.GameManager.LevelIds && window.GameManager.LevelIds.length > 0) {

                var idx = 0;
                var found = false;
                for (idx = 0; idx < window.GameManager.LevelIds.length; idx++) {
                    if(window.GameManager.LevelIds[idx].name === this.currentLevel) {
                        found = true;
                        break;
                    }
                }

                if(!found || idx === window.GameManager.LevelIds.length - 1) {
                    this.screenManager.LoadMenu();
                    return;
                } else {
                    this.currentLevel = window.GameManager.LevelIds[idx+1].name;
                    this.screenManager.LoadLevel(window.GameManager.LevelIds[this.currentLevel].id);
                }
            }
        },


        PrevLevel: function () {

            if (window.GameManager.LevelIds && window.GameManager.LevelIds.length > 0) {

                var idx = 0;
                var found = false;
                for (idx = 0; idx < window.GameManager.LevelIds.length; idx++) {
                    if (window.GameManager.LevelIds[idx].name === this.currentLevel) {
                        found = true;
                        break;
                    }
                }

                if (!found || idx === 0) {
                    this.screenManager.LoadMenu();
                    return;
                } else {
                    this.currentLevel = window.GameManager.LevelIds[idx - 1].name;
                    this.screenManager.LoadLevel(window.GameManager.LevelIds[this.currentLevel].id);
                }
            }
        },


        CreateShaders: function (gd) {
            this.CreatePlainShader(gd);
            this.CreatePreviewShader(gd);
        },


        CreatePlainShader: function (gd) {
            var shaderDefinition = {
                attributes: {
                    vertex_position: pc.SEMANTIC_POSITION,
                    vertex_texCoord0: pc.SEMANTIC_TEXCOORD0
                },
                vshader: [
                    "attribute vec3 vertex_position;",
                    "attribute vec2 vertex_texCoord0;",
                    "",
                    "uniform mat4 matrix_viewProjection;",
                    "uniform mat4 matrix_model;",
                    "",
                    "varying vec2 vUv0;",
                    "varying vec3 worldPos;",
                    "",
                    "void main(void)",
                    "{",
                    "    mat4 modelMatrix = matrix_model;",
                    "",
                    "    vec4 positionW = modelMatrix * vec4(vertex_position, 1.0);",
                    "    gl_Position = matrix_viewProjection * positionW;",
                    "",
                    "    vUv0 = vertex_texCoord0;",
                    "    worldPos = positionW.xwz;",
                    "}",
                ].join("\n"),
                fshader: [
                    "precision highp float;",
                    "",
                    "uniform sampler2D texture_diffuseMap;",
                    "",
                    "varying vec2 vUv0;",
                    "varying vec3 worldPos;",
                    "",
                    "void main(void)",
                    "{",
                    "    gl_FragColor = texture2D(texture_diffuseMap, vUv0);",
                    "}",
                ].join("\n")
            };

            this.plainShader = new pc.Shader(gd, shaderDefinition);
        },


        CreatePreviewShader: function (gd) {
            /*
                SEMANTIC_POSITION - Vertex attribute to be treated as a position.
                SEMANTIC_NORMAL - Vertex attribute to be treated as a normal.
                SEMANTIC_TANGENT - Vertex attribute to be treated as a tangent.
                SEMANTIC_BLENDWEIGHT - Vertex attribute to be treated as skin blend weights.
                SEMANTIC_BLENDINDICES - Vertex attribute to be treated as skin blend indices.
                SEMANTIC_COLOR - Vertex attribute to be treated as a color.
                SEMANTIC_TEXCOORD0 - Vertex attribute to be treated as a texture coordinate (set 0).
                SEMANTIC_TEXCOORD1 - Vertex attribute to be treated as a texture coordinate (set 1).
                SEMANTIC_TEXCOORD2 - Vertex attribute to be treated as a texture coordinate (set 2).
                SEMANTIC_TEXCOORD3 - Vertex attribute to be treated as a texture coordinate (set 3).
                SEMANTIC_TEXCOORD4 - Vertex attribute to be treated as a texture coordinate (set 4).
                SEMANTIC_TEXCOORD5 - Vertex attribute to be treated as a texture coordinate (set 5).
                SEMANTIC_TEXCOORD6 - Vertex attribute to be treated as a texture coordinate (set 6).
                SEMANTIC_TEXCOORD7 - Vertex attribute to be treated as a texture coordinate (set 7).
                SEMANTIC_ATTR0 - Vertex attribute with a user defined semantic.
                SEMANTIC_ATTR1 - Vertex attribute with a user defined semantic.
                SEMANTIC_ATTR2 - Vertex attribute with a user defined semantic.
                SEMANTIC_ATTR3 - Vertex attribute with a user defined semantic.
                SEMANTIC_ATTR4 - Vertex attribute with a user defined semantic.
                SEMANTIC_ATTR5 - Vertex attribute with a user defined semantic.
                SEMANTIC_ATTR6 - Vertex attribute with a user defined semantic.
                SEMANTIC_ATTR7 - Vertex attribute with a user defined semantic.
                SEMANTIC_ATTR8 - Vertex attribute with a user defined semantic.
                SEMANTIC_ATTR9 - Vertex attribute with a user defined semantic.
                SEMANTIC_ATTR10 - Vertex attribute with a user defined semantic.
                SEMANTIC_ATTR11 - Vertex attribute with a user defined semantic.
                SEMANTIC_ATTR12 - Vertex attribute with a user defined semantic.
                SEMANTIC_ATTR13 - Vertex attribute with a user defined semantic.
                SEMANTIC_ATTR14 - Vertex attribute with a user defined semantic.
                SEMANTIC_ATTR15 - Vertex attribute with a user defined semantic.
            */
            var shaderDefinition = {
                attributes: {
                    vertex_position: pc.SEMANTIC_POSITION,
                    vertex_normal: pc.SEMANTIC_NORMAL,
                    vertex_tangent: pc.SEMANTIC_TANGENT,
                    vertex_texCoord0: pc.SEMANTIC_TEXCOORD0,
                    vertex_texCoord1: pc.SEMANTIC_TEXCOORD1,
                    vertex_color: pc.SEMANTIC_COLOR
                },
                vshader: [
                    "// Compiler should remove unneeded stuff",
                    "attribute vec3 vertex_position;",
                    "attribute vec3 vertex_normal;",
                    "attribute vec4 vertex_tangent;",
                    "attribute vec2 vertex_texCoord0;",
                    "attribute vec2 vertex_texCoord1;",
                    "attribute vec4 vertex_color;",
                    "",
                    "uniform mat4 matrix_viewProjection;",
                    "uniform mat4 matrix_model;",
                    "uniform mat3 matrix_normal;",
                    "",
                    "varying vec3 vPositionW;",
                    "varying vec3 vNormalW;",
                    "varying vec3 vTangentW;",
                    "varying vec3 vBinormalW;",
                    "varying vec2 vUv0;",
                    "varying vec2 vUv1;",
                    "varying vec4 vVertexColor;",
                    "varying vec3 vNormalV;",
                    "",
                    "struct vsInternalData {",
                    "    vec3 positionW;",
                    "    mat4 modelMatrix;",
                    "    mat3 normalMatrix;",
                    "};",
                    "",
                    "vec2 getUv0(inout vsInternalData data) {",
                    "    return vertex_texCoord0;",
                    "}",
                    "",
                    "mat4 getModelMatrix(inout vsInternalData data) {",
                    "    return matrix_model;",
                    "}",
                    "",
                    "vec4 getPosition(inout vsInternalData data) {",
                    "    data.modelMatrix = getModelMatrix(data);",
                    "    vec4 posW = data.modelMatrix * vec4(vertex_position, 1.0);",
                    "    data.positionW = posW.xyz;",
                    "    return matrix_viewProjection * posW;",
                    "}",
                    "",
                    "vec3 getWorldPosition(inout vsInternalData data) {",
                    "    return data.positionW;",
                    "}",
                    "",
                    "vec3 getNormal(inout vsInternalData data) {",
                    "    data.normalMatrix = matrix_normal;",
                    "    return normalize(data.normalMatrix * vertex_normal);",
                    "}",
                    "",
                    "void main(void) {",
                    "    vsInternalData data;",
                    "",
                    "    gl_Position = getPosition(data);",
                    "    vPositionW  = getWorldPosition(data);",
                    "    vNormalW    = getNormal(data);",
                    "    vec2 uv0    = getUv0(data);",
                    "    vUv0        = uv0;",
                    "}",
                ].join("\n"),
                fshader: [
                    "precision highp float;",
                    "",
                    "// Compiler should remove unneeded stuff",
                    "uniform vec3 view_position;",
                    "",
                    "uniform vec3 light_globalAmbient;",
                    "",
                    "varying vec3 vPositionW;",
                    "varying vec3 vNormalW;",
                    "varying vec3 vTangentW;",
                    "varying vec3 vBinormalW;",
                    "varying vec2 vUv0;",
                    "varying vec2 vUv1;",
                    "varying vec4 vVertexColor;",
                    "varying vec3 vNormalV;",
                    "",
                    "struct psInternalData {",
                    "    vec3 albedo;",
                    "    vec3 specularity;",
                    "    float glossiness;",
                    "    vec3 emission;",
                    "    vec3 normalW;",
                    "    mat3 TBN;",
                    "    vec3 viewDirW;",
                    "    vec3 reflDirW;",
                    "    vec3 diffuseLight;",
                    "    vec3 specularLight;",
                    "    vec4 reflection;",
                    "    float alpha;",
                    "    vec3 lightDirNormW;",
                    "    vec3 lightDirW;",
                    "    vec3 lightPosW;",
                    "    float atten;",
                    "    vec3 shadowCoord;",
                    "    vec2 uvOffset;",
                    "    vec3 normalMap;",
                    "    float ao;",
                    "};",
                    "",
                    "void getViewDir(inout psInternalData data) {",
                    "    data.viewDirW = normalize(view_position - vPositionW);",
                    "}",
                    "",
                    "void getReflDir(inout psInternalData data) {",
                    "    data.reflDirW = normalize(-reflect(data.viewDirW, data.normalW));",
                    "}",
                    "",
                    "void getLightDirPoint(inout psInternalData data, vec3 lightPosW) {",
                    "    data.lightDirW = vPositionW - lightPosW;",
                    "    data.lightDirNormW = normalize(data.lightDirW);",
                    "    data.lightPosW = lightPosW;",
                    "}",
                    "",
                    "float getFalloffLinear(inout psInternalData data, float lightRadius) {",
                    "    float d = length(data.lightDirW);",
                    "    return max(((lightRadius - d) / lightRadius), 0.0);",
                    "}",
                    "",
                    "float square(float x) {",
                    "    return x*x;",
                    "}",
                    "",
                    "float saturate(float x) {",
                    "    return clamp(x, 0.0, 1.0);",
                    "}",
                    "",
                    "float getFalloffInvSquared(inout psInternalData data, float lightRadius) {",
                    "",
                    "    float sqrDist = dot(data.lightDirW, data.lightDirW);",
                    "    float falloff = 1.0 / (sqrDist + 1.0);",
                    "    float invRadius = 1.0 / lightRadius;",
                    "",
                    "    falloff *= 16.0;",
                    "    falloff *= square( saturate( 1.0 - square( sqrDist * square(invRadius) ) ) );",
                    "",
                    "    return falloff;",
                    "}",
                    "",
                    "float getSpotEffect(inout psInternalData data, vec3 lightSpotDirW, float lightInnerConeAngle, float lightOuterConeAngle) {",
                    "",
                    "    float cosAngle = dot(data.lightDirNormW, lightSpotDirW);",
                    "    return smoothstep(lightOuterConeAngle, lightInnerConeAngle, cosAngle);",
                    "}",
                    "",
                    "uniform vec3 light0_color;",
                    "uniform vec3 light0_direction;",
                    "",
                    "void getNormal(inout psInternalData data) {",
                    "    data.normalW = normalize(vNormalW);",
                    "}",
                    "",
                    "vec3 gammaCorrectInput(vec3 color) {",
                    "    return pow(color, vec3(2.2));",
                    "}",
                    "",
                    "float gammaCorrectInput(float color) {",
                    "    return pow(color, 2.2);",
                    "}",
                    "",
                    "vec4 gammaCorrectInput(vec4 color) {",
                    "    return vec4(pow(color.rgb, vec3(2.2)), color.a);",
                    "}",
                    "",
                    "vec4 texture2DSRGB(sampler2D tex, vec2 uv) {",
                    "    vec4 rgba = texture2D(tex, uv);",
                    "    rgba.rgb = gammaCorrectInput(rgba.rgb);",
                    "    return rgba;",
                    "}",
                    "",
                    "vec4 textureCubeSRGB(samplerCube tex, vec3 uvw) {",
                    "    vec4 rgba = textureCube(tex, uvw);",
                    "    rgba.rgb = gammaCorrectInput(rgba.rgb);",
                    "    return rgba;",
                    "}",
                    "",
                    "vec3 gammaCorrectOutput(vec3 color) {",
                    "    return pow(color, vec3(0.45));",
                    "}",
                    "",
                    "uniform float exposure;",
                    "vec3 toneMap(vec3 color) {",
                    "    return color * exposure;",
                    "}",
                    "",
                    "vec3 addFog(inout psInternalData data, vec3 color) {",
                    "    return color;",
                    "}",
                    "",
                    "uniform sampler2D texture_diffuseMap;",
                    "void getAlbedo(inout psInternalData data) {",
                    "    data.albedo = texture2DSRGB(texture_diffuseMap, vUv0 + data.uvOffset).rgb;",
                    "}",
                    "",
                    "uniform float material_opacity;",
                    "void getOpacity(inout psInternalData data) {",
                    "    data.alpha = material_opacity;",
                    "}",
                    "",
                    "uniform sampler2D texture_emissiveMap;",
                    "vec3 getEmission(inout psInternalData data) {",
                    "    return texture2D(texture_emissiveMap, vUv0 + data.uvOffset).rgb;",
                    "}",
                    "",
                    "float antiAliasGlossiness(inout psInternalData data, float power) {",
                    "    return power;",
                    "}",
                    "",
                    "uniform vec3 material_specular;",
                    "void getSpecularity(inout psInternalData data) {",
                    "    data.specularity = material_specular;",
                    "}",
                    "",
                    "uniform float material_shininess;",
                    "void getGlossiness(inout psInternalData data) {",
                    "    data.glossiness = material_shininess;",
                    "}",
                    "",
                    "void getTBN(inout psInternalData data) {",
                    "    data.TBN = mat3(normalize(vTangentW), normalize(vBinormalW), normalize(vNormalW));",
                    "}",
                    "",
                    "uniform sampler2D texture_heightMap;",
                    "uniform float material_heightMapFactor;",
                    "",
                    "void getParallax(inout psInternalData data) {",
                    "    float parallaxScale = material_heightMapFactor;",
                    "    const float parallaxBias = 0.01;",
                    "",
                    "    float height = texture2D(texture_heightMap, vUv0).r * parallaxScale - parallaxBias;",
                    "    vec3 viewDirT = data.viewDirW * data.TBN;",
                    "",
                    "    data.uvOffset = min(height * viewDirT.xy, vec2(parallaxBias));",
                    "}",
                    "",
                    "void addAmbient(inout psInternalData data) {",
                    "    data.diffuseLight = light_globalAmbient;",
                    "}",
                    "",
                    "float getLightDiffuse(inout psInternalData data) {",
                    "    return max(dot(data.normalW, -data.lightDirNormW), 0.0);",
                    "}",
                    "",
                    "float getLightSpecular(inout psInternalData data) {",
                    "    float specPow = data.glossiness;",
                    "",
                    "    specPow = antiAliasGlossiness(data, specPow);",
                    "",
                    "    // Hack: On Mac OS X, calling pow with zero for the exponent generates hideous artifacts so bias up a little",
                    "    return pow(max(dot(data.reflDirW, -data.lightDirNormW), 0.0), specPow + 0.0001);",
                    "}",
                    "",
                    "vec3 combineColor(inout psInternalData data) {",
                    "    return data.albedo * data.diffuseLight + data.specularLight * data.specularity;",
                    "}",
                    "",
                    "",
                    "void main(void) {",
                    "    psInternalData data;",
                    "    data.diffuseLight = vec3(0);",
                    "    data.specularLight = vec3(0);",
                    "    data.reflection = vec4(0);",
                    "",
                    "    getViewDir(data);",
                    "    getTBN(data);",
                    "    getParallax(data);",
                    "    getNormal(data);",
                    "    getReflDir(data);",
                    "    getAlbedo(data);",
                    "    getSpecularity(data);",
                    "    getGlossiness(data);",
                    "    getOpacity(data);",
                    "    addAmbient(data);",
                    "    data.lightDirNormW = light0_direction;",
                    "    data.atten = 1.0;",
                    "    data.atten *= getLightDiffuse(data);",
                    "    data.diffuseLight += data.atten * light0_color;",
                    "    data.atten *= getLightSpecular(data);",
                    "    data.specularLight += data.atten * light0_color;",
                    "",
                    "    gl_FragColor.rgb = combineColor(data);",
                    "    gl_FragColor.rgb += getEmission(data);",
                    "    gl_FragColor.rgb = addFog(data, gl_FragColor.rgb);",
                    "    gl_FragColor.rgb = toneMap(gl_FragColor.rgb);",
                    "    gl_FragColor.rgb = gammaCorrectOutput(gl_FragColor.rgb);",
                    "    gl_FragColor.a = data.alpha;",
                    "    gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);",
                    "}",
                ].join("\n")
            };

            this.previewShader = new pc.Shader(gd, shaderDefinition);
        },


        CreateUniforms: function(gd) {
            // Uniforms
            var scope = gd.scope;
            this.projId = scope.resolve('matrix_projection');
            this.viewId = scope.resolve('matrix_view');
            this.viewId3 = scope.resolve('matrix_view3');
            this.viewInvId = scope.resolve('matrix_viewInverse');
            this.viewProjId = scope.resolve('matrix_viewProjection');
            this.viewPosId = scope.resolve('view_position');
            this.nearClipId = scope.resolve('camera_near');
            this.farClipId = scope.resolve('camera_far');
            this.lightRadiusId = scope.resolve('light_radius');

            this.fogColorId = scope.resolve('fog_color');
            this.fogStartId = scope.resolve('fog_start');
            this.fogEndId = scope.resolve('fog_end');
            this.fogDensityId = scope.resolve('fog_density');

            this.modelMatrixId = scope.resolve('matrix_model');
            this.normalMatrixId = scope.resolve('matrix_normal');
            this.poseMatrixId = scope.resolve('matrix_pose[0]');
            this.boneTextureId = scope.resolve('texture_poseMap');
            this.boneTextureSizeId = scope.resolve('texture_poseMapSize');

            this.alphaTestId = scope.resolve('alpha_ref');
            this.shadowEnableId = scope.resolve('shadow_enable');

            // Shadows
            this._shadowAabb = new pc.shape.Aabb();
            this._sceneAabb = new pc.shape.Aabb();
            this._shadowState = { blend: false };
            this.centroid = new pc.Vec3();

            this.fogColor = new Float32Array(3);
            this.ambientColor = new Float32Array(3);
        },


        SetLighting: function (gd, lighting) {

            var lights = lighting.lights;
            var numLights = lights.length;
            var i;

            var scope = gd.scope;

            this.ambientColor[0] = lighting.ambient.r;
            this.ambientColor[1] = lighting.ambient.g;
            this.ambientColor[2] = lighting.ambient.b;

            if (lighting.gammaCorrection) {
                for (i = 0; i < 3; i++) {
                    this.ambientColor[i] = Math.pow(this.ambientColor[i], 2.2);
                }
            }

            scope.resolve("light_globalAmbient").setValue(this.ambientColor);
            scope.resolve("exposure").setValue(lighting.exposure);

            for (i = 0; i < numLights; i++) {

                var light = lights[i];

                var lightName = "light" + i;
                var lightColor = new pc.Vec3(light.color.r, light.color.g, light.color.b);

                if (lighting.gammaCorrection) {
                    for (i = 0; i < 3; i++) {
                        lightColor[i] = Math.pow(lightColor[i], 2.2);
                    }
                }

                scope.resolve(lightName + "_color").setValue(lightColor.data);
                scope.resolve(lightName + "_direction").setValue(light.direction.normalize().data);
            }
        },


        DrawModel: function (gd, technique, model, cameraPos, world, view, projection, viewProjection, lighting) {

            if (!gd || !model)
                return;

            var prevMaterial = null;

            for (var i = 0; i < model.meshInstances.length; i++) {

                var meshInstance = model.meshInstances[i];

                var mesh = meshInstance.mesh;
                var material = meshInstance.material;

                var modelMatrix = meshInstance.node.worldTransform;
                var normalMatrix = meshInstance.normalMatrix;

                modelMatrix.invertTo3x3(normalMatrix);

                world.mul(modelMatrix);
                this.modelMatrixId.setValue(world.data);

                normalMatrix.transpose();
                this.normalMatrixId.setValue(normalMatrix.data);

                this.viewId.setValue(view.data);
                this.projId.setValue(projection.data);
                this.viewProjId.setValue(viewProjection.data);

                if (meshInstance.skinInstance) {
                    if (gd.supportsBoneTextures) {
                        this.boneTextureId.setValue(meshInstance.skinInstance.boneTexture);
                        var w = meshInstance.skinInstance.boneTexture.width;
                        var h = meshInstance.skinInstance.boneTexture.height;
                        this.boneTextureSizeId.setValue([w, h])
                    } else {
                        this.poseMatrixId.setValue(meshInstance.skinInstance.matrixPalette);
                    }
                }
                this.shadowEnableId.setValue(meshInstance.receiveShadow);

                if (material !== prevMaterial) {
                    if (material.shader) {
                        gd.setShader(material.shader);
                    } else {
                        switch(technique) {
                            case window.GameManager.RenderTechnique.PlainMapping:
                                gd.setShader(this.plainShader);
                                break;

                            case window.GameManager.RenderTechnique.NormalMapping:
                                gd.setShader(this.previewShader);
                                break;

                            default:
                                gd.setShader(this.previewShader);
                                break;
                        }
                    }

                    if (lighting) {
                        this.SetLighting(gd, lighting);
                    }

                    this.viewPosId.setValue(cameraPos.data);

                    var parameters = material.parameters;
                    for (var paramName in parameters) {
                        var parameter = parameters[paramName];
                        if (!parameter.scopeId) {
                            parameter.scopeId = gd.scope.resolve(paramName);
                        }
                        parameter.scopeId.setValue(parameter.data);
                    }

                    this.alphaTestId.setValue(material.alphaTest);

                    gd.setBlending(material.blend);
                    gd.setBlendFunction(material.blendSrc, material.blendDst);
                    gd.setBlendEquation(material.blendEquation);
                    gd.setColorWrite(material.redWrite, material.greenWrite, material.blueWrite, material.alphaWrite);
                    gd.setCullMode(material.cull);
                    gd.setDepthWrite(material.depthWrite);
                    gd.setDepthTest(material.depthTest);
                }

                gd.setVertexBuffer(mesh.vertexBuffer, 0);
                style = meshInstance.renderStyle;
                gd.setIndexBuffer(mesh.indexBuffer[style]);
                gd.draw(mesh.primitive[style]);

                prevMaterial = material;
            }
        }
    };

    return GameManager;
});
