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
pc.script.create('SpriteManager', function (context) {

    // Creates a new SpriteManager instance
    var SpriteManager = function (entity) {
        
        this.entity = entity;
        this.root = null;
        
        this.colorShader = null;                // simple color effect
        this.colorTextureShader = null;         // color + texure effect

        this.vertexFormat = null;               // screen quad vertex declaration and buffer
        this.vertexBuffer = null;
        
        this.projection = null;
        this.modelView = null;
        this.texRotation = null;
    };

    window.SpriteManager =
    {
        RenderTechnique: Object.freeze(
        {
            Color: 0,
            ColorTexture: 1
        })
    };


    SpriteManager.prototype = {

        // Called once after all resources are loaded and before the first update
        initialize: function () {

            this.root = context.root.getChildren()[0];

            var gd = context.graphicsDevice;

            this.projection = new pc.Mat4();
            this.modelView = new pc.Mat4();

            this.CreateColorShader(gd);
            this.CreateColorTextureShader(gd);

            this.vertexFormat = new pc.VertexFormat(context.graphicsDevice, [
                { semantic: pc.SEMANTIC_POSITION, components: 2, type: pc.ELEMENTTYPE_FLOAT32 },
                { semantic: pc.SEMANTIC_TEXCOORD0, components: 2, type: pc.ELEMENTTYPE_FLOAT32 }
            ]);

            this.vertexBuffer = new pc.VertexBuffer(context.graphicsDevice, this.vertexFormat, 6, pc.BUFFER_DYNAMIC);
        },


        RenderClipSprite: function (gd, technique, texture, rect, clipRect, color, rotation) {

            if (!gd)
                return;

            gd.setScissor(clipRect.x, clipRect.y, clipRect.z, clipRect.w);

            this.RenderSprite(gd, technique, texture, rect, color, rotation);

            gd.setScissor(0, 0, gd.width, gd.height);
        },


        RenderSprite: function (gd, technique, texture, rect, color, rotation) {

            if(!gd)
                return;

            this.projection = new pc.Mat4().setOrtho(0, gd.width, gd.height, 0, 0.1, 1000.0);
            this.modelView = new pc.Mat4().setTranslate(0.0, 0.0, -1.0);
            this.texRotation = new pc.Mat4().setIdentity();

            if (rotation != 0.0) {
                var t1 = new pc.Mat4().setTranslate(0.5, 0.5, 0.0);
                var t2 = new pc.Mat4().setTranslate(-0.5, -0.5, 0.0);
                var r = new pc.Mat4().setFromEulerAngles(0.0, 0.0, rotation);
                this.texRotation.setIdentity();
                this.texRotation.mul(t1);
                this.texRotation.mul(r);
                this.texRotation.mul(t2);
            }

            this.UpdateVertexBuffer(gd, rect.x, rect.y, rect.z, rect.w);

            switch (technique) {
                case window.SpriteManager.RenderTechnique.Color:
                    gd.setShader(this.colorShader);
                    gd.scope.resolve("projection").setValue(this.projection.data);
                    gd.scope.resolve("modelView").setValue(this.modelView.data);
                    gd.scope.resolve("modColor").setValue(color.data);
                    break;

                case window.SpriteManager.RenderTechnique.ColorTexture:
                    gd.setShader(this.colorTextureShader);
                    gd.scope.resolve("projection").setValue(this.projection.data);
                    gd.scope.resolve("modelView").setValue(this.modelView.data);
                    gd.scope.resolve("rotation").setValue(this.texRotation.data);
                    gd.scope.resolve("modColor").setValue(color.data);
                    gd.scope.resolve("theColorMap").setValue(texture);
                    break;
            }

            gd.setVertexBuffer(this.vertexBuffer, 0);
            gd.draw({
                type: pc.PRIMITIVE_TRIANGLES,
                base: 0,
                count: 6,
                indexed: false
            });
        },


        UpdateVertexBuffer: function (gd, x, y, width, height) {

            this.vertexBuffer.lock();

            var iterator = new pc.VertexIterator(this.vertexBuffer);

            iterator.element[pc.SEMANTIC_POSITION].set(x, y);
            iterator.element[pc.SEMANTIC_TEXCOORD0].set(0, 1);
            iterator.next();
            iterator.element[pc.SEMANTIC_POSITION].set(x, y+height);
            iterator.element[pc.SEMANTIC_TEXCOORD0].set(0, 0);
            iterator.next();
            iterator.element[pc.SEMANTIC_POSITION].set(x+width, y+height);
            iterator.element[pc.SEMANTIC_TEXCOORD0].set(1, 0);
            iterator.next();
            iterator.element[pc.SEMANTIC_POSITION].set(x, y);
            iterator.element[pc.SEMANTIC_TEXCOORD0].set(0, 1);
            iterator.next();
            iterator.element[pc.SEMANTIC_POSITION].set(x+width, y+height);
            iterator.element[pc.SEMANTIC_TEXCOORD0].set(1, 0);
            iterator.next();
            iterator.element[pc.SEMANTIC_POSITION].set(x+width, y);
            iterator.element[pc.SEMANTIC_TEXCOORD0].set(1, 1);

            iterator.end();

            this.vertexBuffer.unlock();
        },


        CreateColorShader: function (gd) {
            var shaderDefinition = {
                attributes: {
                    aPosition: pc.SEMANTIC_POSITION,
                    aTexCoord: pc.SEMANTIC_TEXCOORD0
                },
                vshader: [
                    "attribute vec2 aPosition;",
                    "",
                    "uniform mat4 projection;",
                    "uniform mat4 modelView;",
                    "",
                    "void main(void)",
                    "{",
                    "   gl_Position = projection * modelView * vec4(aPosition.xy, 0.5, 1.0);",
                    "}"
                ].join("\n"),
                fshader: [
                    "precision " + context.graphicsDevice.precision + " float;",
                    "",
                    "uniform vec4 modColor;",
                    "",
                    "void main(void)",
                    "{",
                    "    gl_FragColor = modColor;",
                    "}"
                ].join("\n")
            };

            this.colorShader = new pc.Shader(gd, shaderDefinition);
        },


        CreateColorTextureShader: function (gd) {

            var shaderDefinition = {
                attributes: {
                    aPosition: pc.SEMANTIC_POSITION,
                    aTexCoord: pc.SEMANTIC_TEXCOORD0
                },
                vshader: [
                    "attribute vec2 aPosition;",
                    "attribute vec2 aTexCoord;",
                    "",
                    "uniform mat4 projection;",
                    "uniform mat4 modelView;",
                    "",
                    "varying vec2 theTextureCoord;",
                    "",
                    "void main(void)",
                    "{",
                    "   theTextureCoord = aTexCoord;",
                    "   gl_Position = projection * modelView * vec4(aPosition.xy, 0.0, 1.0);",
                    "}"
                ].join("\n"),
                fshader: [
                    "precision " + context.graphicsDevice.precision + " float;",
                    "",
                    "uniform vec4 modColor;",
                    "uniform vec2 uvScale;",
                    "uniform mat4 rotation;",
                    "uniform sampler2D theColorMap;",
                    "",
                    "varying vec2 theTextureCoord;",
                    "",
                    "void main(void)",
                    "{",
                    "    vec2 uv = (rotation * vec4(theTextureCoord, 0, 1)).xy;",
                    "",
                    "    vec4 theColor = modColor * texture2D(theColorMap, uv);",
                    "    gl_FragColor = theColor;",
                    "}"
                ].join("\n")
            };

            this.colorTextureShader = new pc.Shader(gd, shaderDefinition);
        },
    };

    return SpriteManager;
});
