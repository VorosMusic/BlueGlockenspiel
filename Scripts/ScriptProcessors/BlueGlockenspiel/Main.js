Content.makeFrontInterface(1500, 1200);

Synth.deferCallbacks(true);

//Zoom
namespace ZoomHandler
{
	const var MIN_ZOOM = 0.1;
	const var MAX_ZOOM = 1.0;
	const var ZOOM_STEP = 0.01;
	const var INTERFACE_WIDTH = 1500;
	const var INTERFACE_HEIGHT = 1200;

	const var Zoom_Pnl = Content.getComponent("Zoom_Pnl");
	
	Zoom_Pnl.setPaintRoutine(function(g)
	{
		g.setColour(Colours.withAlpha(Colours.white, (this.data.hover && this.data.allowDrag) ? 1 : 0.7));
		g.fillPath(Triangle, [1427, 1130, 65, 65]);
	});
	
	inline function allowZoom(panel, on)
	{
		panel.data.allowDrag = on;
		panel.setMouseCursor(on ?"BottomRightCornerResizeCursor" : "NormalCursor", Colours.white, [0, 0]);
		panel.repaint();
	}
	
	allowZoom(Zoom_Pnl, true);
	
	Zoom_Pnl.setMouseCallback(function(event)
	{
		this.data.hover = event.hover;
		
		if(event.clicked)
		{
			this.data.zoomStart = Settings.getZoomLevel();
		}
		if(event.mouseUp)
		{
			return;
		}
	
		if(event.drag)
		{
			if(!this.data.allowDrag)
				return;
	
			var diagonal = Math.sqrt(INTERFACE_WIDTH*INTERFACE_WIDTH + INTERFACE_HEIGHT*INTERFACE_HEIGHT);
			var currentZoom = Settings.getZoomLevel();
			var dragPixel = 0;
			
			if(event.dragX > event.dragY)
				dragPixel = (event.dragX * currentZoom) / INTERFACE_WIDTH;
			else
				dragPixel = (event.dragY * currentZoom) / INTERFACE_HEIGHT;
			
			
			var maxScaleFactor = Content.getScreenBounds(false)[3] / INTERFACE_HEIGHT;
			var diagonalDrag = this.data.zoomStart + dragPixel;
			
			diagonalDrag += (ZOOM_STEP / 2);
			
			diagonalDrag = Math.min(diagonalDrag, maxScaleFactor);
			
			diagonalDrag -= Math.fmod(diagonalDrag, ZOOM_STEP);
			diagonalDrag = Math.range(diagonalDrag, MIN_ZOOM, MAX_ZOOM);
			
			var zoomToUse = diagonalDrag;
	
			if(currentZoom != zoomToUse)
			{
				Settings.setZoomLevel(zoomToUse);
			}
		}
		
		this.repaint();
	});
}


//Keyboard
const var Keyboard = Content.getComponent("Keyboard");

const var Keyboard_LAF = Content.createLocalLookAndFeel();

Keyboard_LAF.registerFunction("drawWhiteNote", function(g, obj)
{
	var a = obj.area;
	a[1] = -3;
	a[2] = 45;
	a[3] = (obj.down ? 140 : 150);
	var atexta = [obj.area[0], 75, obj.area[2], (obj.down ? 90 : 100)];
	
	//Base
	g.setColour(Colours.white);
	g.fillRoundedRectangle(a, 5);
	
	g.setGradientFill([Colours.withAlpha(0x031020, 1.0), 0, 0, Colours.withAlpha(0x0975A5, 0.0), 0, 130]);
	g.fillRoundedRectangle(a, 5);
	
	//Color
	if(obj.keyColour)
	{
		g.setColour(Colours.withAlpha(obj.keyColour, 0.35));
		g.fillRect(a);
	}
	
	//Text
	if(obj.noteNumber % 12 == 0)
	{
		g.setColour(0xFF222222);
		g.setFont("Oxygen", 20);
		g.drawAlignedText("C" + (parseInt(obj.noteNumber / 12) - 2), atexta, "centred");
	}
	
	//Hover
	if(obj.hover)
	{
		g.setGradientFill([Colours.withAlpha(0x000509, 0.2), 0, 0, Colours.withAlpha(0x203A40, .1), 0, 90]);
		g.fillRect(a);
	}
	else
	{
		g.setColour(Colours.withAlpha(Colours.white, 0.0));
		g.fillRect(a);
	}
});

Keyboard_LAF.registerFunction("drawBlackNote", function(g, obj)
{
	var a = obj.area;
	a[1] = -2;
	a[2] = 25;
	a[3] = (obj.down ? 80 : 85);

	//Base
	g.setColour(Colours.black);
	g.fillRoundedRectangle(a, 4);
	
	g.setGradientFill([Colours.withAlpha(0x000000, 0.4), 0, 25, Colours.withAlpha(0xFFFFFF, 0.30), 0, 65]);
	g.fillRoundedRectangle([a[0] + 5, a[1], a[2] - 10, a[3] - 10], 5);
	
	//Color
	if(obj.keyColour)
	{
		g.setColour(Colours.withAlpha(obj.keyColour, 0.15));
		g.fillRect(a);
	}
	
	//Hover
	if(obj.hover)
	{
		g.setColour(Colours.withAlpha(0x000000, 0.35));
		g.fillRoundedRectangle(a, 5);
	}
	else
	{
		g.setColour(Colours.withAlpha(0x000000, 0.0));
		g.fillRect(a);
	}
});

Keyboard.setLocalLookAndFeel(Keyboard_LAF);

//KeyColor
for (i = 53; i < 101; i++)
{
	Engine.setKeyColour(i, 0xFFFFFF);
}

for (i = 67; i < 92; i++)
{
	Engine.setKeyColour(i, 0x00BBFF);
}

//Reverb
const var Reverb = Synth.getEffect("Reverb");

inline function onReverbControl(component, value)
{
	Reverb.setAttribute(1, value);
};
Content.getComponent("Reverb").setControlCallback(onReverbControl);


//Drive
const var Saturation = Synth.getEffect("Saturation");

inline function onDriveControl(component, value)
{
	reg va = (-value)*10;

	Saturation.setAttribute(3, va);
	Saturation.setAttribute(0, value);
};

Content.getComponent("Drive").setControlCallback(onDriveControl);


//Spread
const var SpreadR = Synth.getEffect("Spread R");
const var SpreadS = Synth.getEffect("Spread S");

inline function onSpreadControl(component, value)
{
	reg v = value*100;
	SpreadR.setAttribute(1, v);
	SpreadS.setAttribute(1, v);
}
Content.getComponent("Spread").setControlCallback(onSpreadControl);


//Articulation Switch
const var UI = Content.getComponent("UI");

var LightDark = 1;

inline function onSwitchControl(component, value)
{
	LightDark = (1-value);
	if(value)
	{
		UI.setPosition(0, -1200, 1500, 2400);
		RegularSMP.setBypassed(1);
		SoftSMP.setBypassed(0);
	}
	else
	{
		UI.setPosition(0 , 0, 1500, 2400);
		RegularSMP.setBypassed(0);
		SoftSMP.setBypassed(1);
	}
	Settings_Pnl.changed();
};
Content.getComponent("Switch").setControlCallback(onSwitchControl);

//Tremolo
const var TremoloR = Synth.getModulator("Tremolo R");
const var TremoloS = Synth.getModulator("Tremolo S");

inline function onTremoloControl(component, value)
{
	TremoloR.setIntensity(value);
	TremoloS.setIntensity(value);
};
Content.getComponent("Tremolo").setControlCallback(onTremoloControl);

//Phaser
const var PhaserR = Synth.getEffect("Phaser R");
const var PhaserS = Synth.getEffect("Phaser S");

inline function onPhaserControl(component, value)
{
	PhaserR.setAttribute(3, value);
	PhaserS.setAttribute(3, value);
};
Content.getComponent("Phaser").setControlCallback(onPhaserControl);

//Vibrato
const var VibratoR = Synth.getModulator("Vibrato R");
const var VibratoS = Synth.getModulator("Vibrato S");

inline function onVibratoControl(component, value)
{
	VibratoR.setIntensity(value);
	VibratoS.setIntensity(value);
};
Content.getComponent("Vibrato").setControlCallback(onVibratoControl);

//Extend Keyrange
const var Extend = Content.getComponent("Extend");
const var RegularSMP = Synth.getChildSynth("Regular_SMP");
const var Regular_SMP = Synth.getSampler("Regular_SMP");
const var SoftSMP = Synth.getChildSynth("Soft_SMP");
const var Soft_SMP = Synth.getSampler("Soft_SMP");

inline function onExtendControl(component, value)
{
	if(value == 1)
	{
	Regular_SMP.loadSampleMap("RegularExtended");
	Soft_SMP.loadSampleMap("SoftExtended");

	for (i = 60; i < 67; i++)
		{
		Engine.setKeyColour(i, 0x0070FF);
		}
	for (i = 92; i < 97; i++)
		{
		Engine.setKeyColour(i, 0x0070FF);
		}
	}
	else
	{
	Regular_SMP.loadSampleMap("Regular");
	Soft_SMP.loadSampleMap("Soft");

	for (i = 60; i < 67; i++)
		{
		Engine.setKeyColour(i, 0xFFFFFF);
		}
	for (i = 92; i < 97; i++)
		{
		Engine.setKeyColour(i, 0xFFFFFF);	
		}
	}
};
Content.getComponent("Extend").setControlCallback(onExtendControl);

//Settings
//Path
const var Wheel = Content.createPath();
const WheelData = [110,109,133,171,249,67,123,212,103,67,98,31,101,248,67,0,192,92,67,20,110,243,67,0,128,84,67,0,128,237,67,0,128,84,67,108,31,229,222,67,113,253,80,67,98,92,79,220,67,164,48,56,67,21,110,215,67,236,17,33,67,10,183,208,67,236,145,12,67,108,92,207,217,67,
11,215,234,66,98,184,254,221,67,154,25,218,66,10,151,222,67,195,117,192,66,153,153,219,67,246,40,173,66,98,153,153,219,67,246,40,173,66,153,153,219,67,246,40,173,66,10,151,219,67,185,30,173,66,98,184,158,215,67,83,184,154,66,235,81,211,67,32,133,137,
66,82,184,206,67,176,71,115,66,98,10,183,206,67,53,51,115,66,195,181,206,67,53,51,115,66,195,181,206,67,53,51,115,66,98,144,226,201,67,176,71,91,66,154,121,195,67,63,10,96,66,62,74,191,67,144,194,128,66,108,11,183,179,67,216,35,165,66,98,11,119,169,67,
175,71,138,66,175,231,157,67,32,133,109,66,72,129,145,67,12,215,88,66,108,0,192,143,67,4,0,200,65,98,0,192,143,67,110,102,82,65,72,161,139,67,112,184,78,64,154,25,134,67,64,246,40,63,98,82,24,134,67,228,102,38,63,11,23,134,67,228,102,38,63,195,21,134,
67,64,246,40,63,98,154,25,128,67,184,69,97,190,206,204,115,67,184,69,97,190,124,212,103,67,64,246,40,63,98,237,209,103,67,228,102,38,63,93,207,103,67,228,102,38,63,206,204,103,67,64,246,40,63,98,114,189,92,67,113,184,78,64,1,128,84,67,110,102,82,65,1,
128,84,67,4,0,200,65,108,114,253,80,67,12,215,88,66,98,165,48,56,67,32,133,109,66,237,17,33,67,175,71,138,66,237,145,12,67,216,35,165,66,108,13,215,234,66,144,194,128,66,98,126,20,218,66,63,10,96,66,136,107,192,66,175,71,91,66,187,30,173,66,175,71,115,
66,98,85,184,154,66,31,133,137,66,34,133,137,66,82,184,154,66,180,71,115,66,185,30,173,66,98,180,71,91,66,134,107,192,66,67,10,96,66,124,20,218,66,146,194,128,66,11,215,234,66,108,218,35,165,66,236,145,12,67,98,177,71,138,66,236,17,33,67,36,133,109,66,
164,48,56,67,16,215,88,66,113,253,80,67,108,12,0,200,65,0,128,84,67,98,137,61,82,65,0,128,84,67,0,113,77,64,0,192,92,67,64,247,40,63,123,212,103,67,98,184,65,97,190,205,204,115,67,184,65,97,190,154,25,128,67,64,247,40,63,195,21,134,67,108,13,72,113,64,
11,215,137,67,98,116,143,2,65,216,99,141,67,125,61,128,65,1,192,143,67,12,0,200,65,1,192,143,67,108,16,215,88,66,73,129,145,67,98,36,133,109,66,175,231,157,67,177,71,138,66,12,119,169,67,218,35,165,66,12,183,179,67,108,146,194,128,66,63,74,191,67,98,
128,20,104,66,83,120,194,67,118,61,95,66,94,239,198,67,200,245,102,66,217,3,203,67,108,57,51,115,66,197,181,206,67,98,57,51,115,66,197,181,206,67,57,51,115,66,13,183,206,67,180,71,115,66,84,184,206,67,98,34,133,137,66,238,81,211,67,85,184,154,66,115,
157,215,67,187,30,173,66,12,151,219,67,98,218,35,173,66,155,153,219,67,248,40,173,66,155,153,219,67,248,40,173,66,155,153,219,67,98,197,117,192,66,12,151,222,67,156,25,218,66,186,254,221,67,12,215,234,66,94,207,217,67,108,236,145,12,67,12,183,208,67,
98,236,17,33,67,22,110,215,67,164,48,56,67,94,79,220,67,113,253,80,67,32,229,222,67,108,0,128,84,67,1,128,237,67,98,0,128,84,67,206,108,243,67,113,189,92,67,144,98,248,67,205,204,103,67,134,171,249,67,98,92,207,103,67,206,172,249,67,236,209,103,67,206,
172,249,67,123,212,103,67,134,171,249,67,98,205,204,115,67,42,28,250,67,154,25,128,67,42,28,250,67,195,21,134,67,134,171,249,67,98,11,23,134,67,206,172,249,67,82,24,134,67,206,172,249,67,154,25,134,67,134,171,249,67,98,72,161,139,67,144,98,248,67,0,192,
143,67,206,108,243,67,0,192,143,67,1,128,237,67,108,72,129,145,67,32,229,222,67,98,174,231,157,67,93,79,220,67,10,119,169,67,22,110,215,67,10,183,179,67,12,183,208,67,108,61,74,191,67,94,207,217,67,98,225,122,195,67,186,254,221,67,30,229,201,67,12,151,
222,67,82,184,206,67,12,151,219,67,98,236,81,211,67,114,157,215,67,184,158,215,67,237,81,211,67,10,151,219,67,84,184,206,67,98,10,151,222,67,33,229,201,67,184,254,221,67,227,122,195,67,92,207,217,67,64,74,191,67,108,10,183,208,67,13,183,179,67,98,20,
110,215,67,13,119,169,67,92,79,220,67,177,231,157,67,30,229,222,67,74,129,145,67,108,255,127,237,67,2,192,143,67,98,19,110,243,67,2,192,143,67,30,101,248,67,2,160,139,67,132,171,249,67,197,21,134,67,98,40,28,250,67,156,25,128,67,40,28,250,67,210,204,
115,67,132,171,249,67,128,212,103,67,99,109,246,232,173,67,133,107,135,67,98,0,160,172,67,0,128,141,67,226,58,170,67,133,43,147,67,51,243,166,67,10,55,152,67,98,71,33,163,67,153,25,158,67,153,25,158,67,71,33,163,67,10,55,152,67,51,243,166,67,98,133,43,
147,67,225,58,170,67,0,128,141,67,0,160,172,67,133,107,135,67,246,232,173,67,98,184,190,128,67,41,92,175,67,143,130,114,67,41,92,175,67,246,40,101,67,246,232,173,67,98,0,0,89,67,0,160,172,67,246,168,77,67,226,58,170,67,236,145,67,67,51,243,166,67,98,
205,204,55,67,71,33,163,67,113,189,45,67,153,25,158,67,154,25,38,67,10,55,152,67,98,62,138,31,67,133,43,147,67,0,192,26,67,0,128,141,67,21,46,24,67,133,107,135,67,98,175,71,21,67,184,190,128,67,175,71,21,67,143,130,114,67,21,46,24,67,246,40,101,67,98,
1,192,26,67,0,0,89,67,62,138,31,67,246,168,77,67,154,25,38,67,236,145,67,67,98,113,189,45,67,205,204,55,67,205,204,55,67,113,189,45,67,236,145,67,67,154,25,38,67,98,246,168,77,67,62,138,31,67,0,0,89,67,0,192,26,67,246,40,101,67,21,46,24,67,98,144,130,
114,67,175,71,21,67,184,190,128,67,175,71,21,67,133,107,135,67,21,46,24,67,98,0,128,141,67,1,192,26,67,133,43,147,67,62,138,31,67,10,55,152,67,154,25,38,67,98,153,25,158,67,113,189,45,67,71,33,163,67,205,204,55,67,51,243,166,67,236,145,67,67,98,225,58,
170,67,246,168,77,67,0,160,172,67,0,0,89,67,246,232,173,67,246,40,101,67,98,41,92,175,67,144,130,114,67,41,92,175,67,184,190,128,67,246,232,173,67,133,107,135,67,99,101,0,0];
Wheel.loadFromData(WheelData);

//Button
const var Settings_Btn = Content.getComponent("Settings_Btn");

const var SetBtn_LAF = Content.createLocalLookAndFeel();

SetBtn_LAF.registerFunction("drawToggleButton", function(g, obj)
{
	var a = obj.area;

	g.setColour(Colours.withAlpha(Colours.white, (obj.over) ? 1 : 0.7));
	g.fillPath(Wheel, [a[0]+10, a[1]+10, 65, 65]);
});

Settings_Btn.setLocalLookAndFeel(SetBtn_LAF);


const var Hand = Content.getComponent("Hand");
Hand.setMouseCursor("PointingHandCursor", Colours.white, [0, 0]);

//Path
const var Triangle = Content.createPath();
const TriangleData = [110,109,113,61,234,64,246,104,202,67,108,246,104,202,67,113,61,234,64,98,62,74,207,67,246,40,28,192,123,52,215,67,246,40,28,192,10,23,220,67,113,61,234,64,108,10,23,220,67,113,61,234,64,98,82,248,224,67,215,163,136,65,82,248,224,67,215,163,3,66,10,23,
220,67,82,184,42,66,108,82,184,42,66,195,21,220,67,98,20,174,3,66,11,247,224,67,82,184,136,65,11,247,224,67,112,61,234,64,195,21,220,67,108,112,61,234,64,195,21,220,67,98,248,40,28,192,123,52,215,67,248,40,28,192,62,74,207,67,112,61,234,64,174,103,202,
67,99,109,174,71,20,67,164,144,202,67,108,133,75,202,67,236,209,20,67,98,205,44,207,67,93,15,11,67,10,23,215,67,93,15,11,67,154,249,219,67,236,209,20,67,108,154,249,219,67,236,209,20,67,98,226,218,224,67,123,148,30,67,226,218,224,67,246,104,46,67,154,
249,219,67,21,46,56,67,108,215,163,55,67,113,61,220,67,98,72,225,45,67,185,30,225,67,205,12,30,67,185,30,225,67,174,71,20,67,113,61,220,67,108,174,71,20,67,113,61,220,67,98,31,133,10,67,41,92,215,67,31,133,10,67,236,113,207,67,174,71,20,67,92,143,202,
67,99,109,51,179,223,67,10,215,153,67,108,51,179,223,67,61,170,198,67,98,51,179,223,67,153,121,212,67,72,129,212,67,133,171,223,67,235,177,198,67,133,171,223,67,108,184,222,153,67,133,171,223,67,98,41,188,142,67,133,171,223,67,246,40,137,67,194,53,210,
67,245,8,145,67,10,87,202,67,108,184,94,202,67,72,1,145,67,98,112,61,210,67,144,34,137,67,51,179,223,67,195,181,142,67,51,179,223,67,11,215,153,67,108,51,179,223,67,11,215,153,67,99,101,0,0];
Triangle.loadFromData(TriangleData);

//Open-Close
const var Settings_Pnl = Content.getComponent("Settings_Pnl");

inline function onSettings_BtnControl(component, value)
{

	Settings_Pnl.set("visible", 1-value);
};

Content.getComponent("Settings_Btn").setControlCallback(onSettings_BtnControl);

//Settings Panel
Settings_Pnl.loadImage("{PROJECT_FOLDER}Menu-regular.png", "MenuR");
Settings_Pnl.loadImage("{PROJECT_FOLDER}Menu-soft.png", "MenuS");

Settings_Pnl.setPaintRoutine(function(g)
{
	if(LightDark == 1)
	{
		g.drawImage("MenuR", [0, 0, 400, 600], 0, 0);
	}
	else
	{
		g.drawImage("MenuS", [0, 0, 400, 600], 0, 0);
	}

	g.setColour(Colours.white);
	g.drawRoundedRectangle([3, 3, 394, 594], 35, 6);
});

//Settings FloatingTile
const var Settings_Tl = Content.getComponent("Settings_Tl");

const var Settings_LAF = Content.createLocalLookAndFeel();

//Combo Boxes
Settings_LAF.registerFunction("drawComboBox", function(g, obj)
{
	g.setColour(Colours.withAlpha(Colours.black, 0.4));
	g.fillRoundedRectangle([0, 0, 170, 28], 5);
	
	g.setColour(Colours.white);
	g.drawRoundedRectangle([1, 1, 170, 28], 5, 2);
	
	g.drawAlignedText(obj.text, [10, 0, 170, 28], "left");
});

//Ideal Size
Settings_LAF.registerFunction("getIdealPopupMenuItemSize", function(g, obj)
{
	 return 35;
});

Settings_LAF.registerFunction("drawPopupMenuItem", function(g, obj)
{
	g.setFont("Oxygen", 20.0);

	if(obj.isHighlighted == 0)
	{
		g.setColour(0xFF555555);
		g.fillRoundedRectangle([0, 0, 175, 33], 0);
	}
	else
	{
		if(LightDark == 1)
		{
			g.setColour(0xFF5db0cc);
			g.fillRoundedRectangle([0,0, 175, 33], 5);
			g.setColour(Colours.white);
			g.drawRoundedRectangle([1, 1, 173, 31], 5, 2);
		}
		else
		{
			g.setColour(0xFF306699);
			g.fillRoundedRectangle([0, 0, 175, 33], 5);
			g.setColour(Colours.white);
			g.drawRoundedRectangle([1, 1, 173, 31], 5, 2);
		}
	}
	
	g.setColour(Colours.white);
	g.drawAlignedText(obj.text, [10, 0, 175, 33], "left");
});

Settings_LAF.registerFunction("drawDialogButton", function(g, obj)
{
	g.setColour(0xFFFFFFFF);
	g.setFont("Oxygen", 20.0);
	g.drawAlignedText(obj.text, [0, 0, 340, 30], "centred");
	
	if (obj.over) {
		g.setColour(0x44FFFFFF);
		g.fillRoundedRectangle([0, 0, 340, 30], 10);
	}
});

Settings_LAF.registerFunction("drawPopupMenuBackground", function(g, obj)
{
	g.fillAll(0xFF3F3F3F);
});

Settings_LAF.registerFunction("drawScrollbar", function(g, obj)
{
	var h = obj.handle;
	h[1] = h[1]+40;
	h[2] = 8;
	h[3] = h[3]-50;

	g.setColour(Colours.withAlpha(Colours.white, 0.5));
	g.fillRoundedRectangle(h, 4);
	
	if(obj.over)
	{
		g.setColour(Colours.white);
		g.fillRoundedRectangle(h, 4);	
	}
});

Settings_Tl.setLocalLookAndFeel(Settings_LAF);

//Reverb Sample
Engine.loadAudioFilesIntoPool();function onNoteOn()
{
	
}
 function onNoteOff()
{
	
}
 function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 