/**
*  @module cloudkid
*/
(function(undefined){

	"use strict";

	/**
	*   PixiDisplay is a display plugin for the CloudKid Framework 
	*	that uses the Pixi library for rendering.
	*
	*   @class PixiDisplay
	*	@constructor
	*	@param {String} id The id of the canvas element on the page to draw to.
	*	@param {Object} options The setup data for the Pixi stage.
	*	@param {String} [options.forceContext=null] If a specific renderer should be used instead of WebGL 
	*					falling back to Canvas. Use "webgl" or "canvas2d" to specify a renderer.
	*	@param {Boolean} [options.clearView=false] If the stage should wipe the canvas between renders.
	*	@param {uint} [options.backgroundColor=0x000000] The background color of the stage (if it is not transparent).
	*	@param {Boolean} [options.transparent=false] If the stage should be transparent.
	*	@param {Boolean} [options.preMultAlpha=false] If the WebGL renderer should draw with all images as pre-multiplied alpha.
	*				In most cases, you probably do not want to set this option to true.
	*/
	var PixiDisplay = function(id, options)
	{
		this.id = id;
		options = options || {};
		this.canvas = document.getElementById(id);
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this._visible = this.canvas.style.display != "none";
		//make stage
		this.stage = new PIXI.Stage(this.options.backgroundColor || 0);
		//make the renderer
		var transparent = !!this.options.transparent || false;
		var preMultAlpha = !!this.options.preMultAlpha || false;
		if(this.options.forceContext == "canvas2d")
		{
			this.renderer = new PIXI.CanvasRenderer(
				this.width, 
				this.height, 
				this.canvas, 
				transparent
			);
		}
		else if(this.options.forceContext == "webgl")
		{
			this.renderer = new PIXI.WebGLRenderer(
				this.width, 
				this.height,
				this.canvas, 
				transparent,
				false,//antialias, not all browsers may support it
				preMultAlpha
			);
		}
		else
		{
			this.renderer = PIXI.autoDetectRenderer(
				this.width, 
				this.height,
				this.canvas, 
				transparent,
				false,//antialias, not all browsers may support it
				preMultAlpha
			);
		}
		this.renderer.clearView = !!options.clearView;
		this.enabled = true;//enable mouse/touch input
	};

	var p = PixiDisplay.prototype = {};

	/**
	*  the canvas managed by this display
	*  @property {DOMElement} canvas
	*  @readOnly
	*  @public
	*/
	p.canvas = null;

	/**
	*  The DOM id for the canvas
	*  @property {String} id
	*  @readOnly
	*  @public
	*/
	p.id = null;

	/**
	*  Convenience method for getting the width of the canvas element
	*  would be the same thing as canvas.width
	*  @property {int} width
	*  @readOnly
	*  @public
	*/
	p.width = 0;

	/**
	*  Convenience method for getting the height of the canvas element
	*  would be the same thing as canvas.height
	*  @property {int} height
	*  @readOnly
	*  @public
	*/
	p.height = 0;

	/**
	*  The rendering library's stage element, the root display object
	*  @property {PIXI.Stage}
	*  @readOnly
	*  @public
	*/
	p.stage = null;

	/**
	*  The Pixi renderer.
	*  @property {PIXI.CanvasRenderer|PIXI.WebGLRenderer}
	*  @readOnly
	*  @public
	*/
	p.renderer = null;

	/**
	*  If rendering is paused on this display only. Pausing all displays can be done
	*  using Application.paused setter.
	*  @property {Boolean} paused
	*  @public
	*/
	p.paused = false;

	/**
	*  If input is enabled on the stage.
	*  @property {Boolean} _enabled
	*  @private
	*/
	p._enabled = false;

	/**
	*  If input is enabled on the stage for this display. The default is true.
	*  @property {Boolean} enabled
	*  @public
	*/
	Object.defineProperty(p, "enabled", {
		get: function(){ return this._enabled; },
		set: function(value)
		{
			this._enabled = value;
			if(value)
			{
				stage.setInteractive(true);
			}
			else
			{
				stage.setInteractive(false);
				// force an update that disables the whole stage (the stage doesn't 
				// update the interaction manager if interaction is false)
				stage.forceUpdateInteraction();
			}
		}
	});

	/**
	*  If the display is visible.
	*  @property {Boolean} _visible
	*  @private
	*/
	p._visible = false;

	/**
	*  If the display is visible, using "display: none" css on the canvas. Invisible displays won't render.
	*  @property {Boolean} visible
	*  @public
	*/
	Object.defineProperty(p, "visible", {
		get: function(){ return this._visible; },
		set: function(value)
		{
			this._visible = value;
			this.canvas.style.display = value ? "block" : "none";
		}
	});

	/**
	* Resizes the canvas and the renderer. This is only called by the Application.
	* @method resize
	* @internal
	* @param {int} width The width that the display should be
	* @param {int} height The height that the display should be
	*/
	p.resize = function(width, height)
	{
		this.canvas.width = width;
		this.canvas.height = height;
	};

	/** 
	* Updates the stage and draws it. This is only called by the Application.
	* This method does nothing if paused is true or visible is false.
	* @method render
	* @internal
	* @param {int} elapsed
	*/
	p.render = function(elapsed)
	{
		if(this.paused || !this._visible) return;

		this.renderer.render(this.stage);
	};

	/**
	*  Destroys the display. This method is called by the Application and should 
	*  not be called directly, use Application.removeDisplay(id). 
	*  The stage recursively removes all display objects here.
	*  @method destroy
	*  @internal
	*/
	p.destroy = function()
	{
		this.enabled = false;
		this.stage.removeChildren(true);
		this.stage.destroy();
		this.renderer.destroy();
		this.renderer = this.stage = this.canvas = null;
	};

	// Assign to the global namespace
	namespace('cloudkid').PixiDisplay = PixiDisplay;
	namespace('cloudkid.pixi').PixiDisplay = PixiDisplay;

}());