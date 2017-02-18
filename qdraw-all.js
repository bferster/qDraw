////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PIE.JS 
// Provides pie/radial menu 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function PieMenu(options, parObj)											// CONSTRUCTOR
{
	var x,y,i,ang;
	var _this=this;																// Save context
	this.ops=options;															// Save options
	this.parObj=parObj;															// Save calling context
	this.active=false;															// Inactive
	this.ops.segMode=false;														// Assume full menu
	var w=this.ops.wid/2;														// Center
	var iw=(this.ops.wid/200*24).toFixed(4);									// Calc scale
	var r=w-(w/4);																// Radius
	this.curSlice=0;															// Current slice
	if (options.sx == undefined) 	options.sx=options.x;						// Use center y if no start offset
	if (options.sy == undefined) 	options.sy=options.y;						// Y
	options.x-=w;																// Center x
	options.y-=w;																// Center y
	this.ops.parent=options.parent ? options.parent : "body";					// If a parent div spec'd use it

	var str="<div id='pimenu' class='pi-main unselectable'></div>";				// Main shell
	$(this.ops.parent).append(str);												// Add to DOM														
	str="<img id='piback' class='pi-slice' src='"+this.ops.dial+"'/>";			// Menu back			
	str+="<img id='pihigh' class='pi-slice' style='pointer-events: none' src='"+this.ops.hilite+"'/>";	// Slice highlight				
	str+="<div id='piicons'>";
	if (this.ops.slices[0]) {													// If a center slice defined
		str+="<img id='sliceicon0' src='"+this.ops.slices[0].ico+"' style='position:absolute;";	// Center Icon
		str+="left:"+(w-iw/2)+"px;top:"+(w-iw/2)+"px;width:"+iw+"px'/>";		// Position
		}
	for (i=1;i<9;++i) {															// For each option
		if (!this.ops.slices[i])	this.ops.slices[i]={ type:"" };				// Make blank object
		if (!this.ops.slices[i].ico)											// No icon
			continue;															// Skip
		ang=(45*i)-22.5;														// Next angle
		x=Math.floor(w+(Math.sin((ang)*0.0174533)*r-iw/2));						// Calc x
		y=Math.floor((w-Math.cos((ang)*0.0174533)*r)-iw/2);						// Y
			str+="<img id='sliceicon"+i+"' src='"+this.ops.slices[i].ico+"' style='position:absolute;";	// Icon
		str+="left:"+x+"px;top:"+y+"px;width:"+iw+"px'/>";						// Position
		}
	str+="</div>"
	$("#pimenu").append(str);													// Add to DOM														
	this.ShowPieMenu(false);													// Hide it
	
	$("#piback").on("mousemove",function(e) { 									// ON HOVER ON
 		var lastSlice=_this.curSlice;											// Save existing slice state
		var alpha=0,cur="auto",cs=-1;											// Assume off
   		var w=_this.ops.wid/2;													// Size
 		var x=e.clientX-(_this.ops.x+w);										// Dx from center
 		var y=e.clientY-(_this.ops.y+w);										// Dy from center
 		var h=Math.sqrt(x*x+y*y); 												// Euclidian distance from center
		if (h < w/5) {															// In settings
			alpha=0;   cur="pointer"; 											// Show it
			cs=0;																// Center slice
			}
		else if (h > w/2) {														// In first orbit ring
			cs=Math.floor((180-Math.atan2(x,y)*(180/Math.PI))/_this.ops.ang)+1;	// Get current slice
			if (_this.ops.slices[cs].type)										// If a valid slice
				alpha=1,cur="pointer"											// Show it
			}
		if ((cs != lastSlice) && (h < w)) {										// A slice change
			_this.curSlice=cs;													// Change it
			_this.HideSubMenus(true);											// Hide submenus										
			if (cs >= 0) {														// A valid slice
   				$("#pihigh").css({"transform":"rotate("+(cs-1)*_this.ops.ang+"deg)"}); // Rotate highlight
				var o=_this.ops.slices[cs];										// Point at slice
 				if (o.type == "col")	   _this.ShowColorBars(cs,"color",o.def); 	// Set color bars
				else if (o.type == "edg")  _this.ShowColorBars(cs,"edge",o.def);  	// Set color and edge
				else if (o.type == "txt")  _this.ShowColorBars(cs,"text",o.def);  	// Show text picker
				else if (o.type == "men")  _this.ShowMenuPick(cs,o.def);		// Show menu picker
				else if (o.type == "typ")  _this.ShowTextType(cs,o.def);		// Show text picker
				else if (o.type == "sli")  _this.ShowSlider(cs,o.def);			// Show slider
				else if (o.type == "ico")  _this.ShowIcons(cs,o.def);			// Show icons
				}
			}
		$("#pihigh").css({"opacity":alpha});									// Set highlight
		$("#pimenu").css({"cursor":cur});										// Set cursor
		});	

	for (i=1;i<9;++i) 															// For each slice
 		if (this.ops.slices[i].type == "but")									// If a button
			$("#sliceicon"+i).on("click",function(e) { 							// Add click handler
				var id=e.currentTarget.id.substr(9)-0;							// Extract id
				_this.SendMessage("click",id);									// Send event
				});
 }

PieMenu.prototype.ShowPieMenu=function(mode)								// SHOW PIE MENU
{
	var o=this.ops;																// Point at ops
	this.active=mode;															// Set active status
	var w=o.wid/2-27;
	if (mode) {																	// If showing
		$("#pimenu").css({"width":"0px","height":"0px"});						// Hide
		$("#pimenu").css({"top":o.sy+"px","left":o.sx+"px"});					// Position
		$("#pimenu").animate({ width:o.wid, height:o.wid,top:o.y, left:o.x,opacity:1});	// Zoom on
		$("#pamenu").animate({ top:o.y+w, left:o.x+w });						// Zoom on
		$("#piicons").animate({ width:o.wid, height:o.wid});					// Zoom on
		$("#piicons").css({ display:"initial"});								// Show
		}
	else{																		// If hiding
		this.ops.segMode=false;													// Full drawing mode
		this.parObj.curShape=0;													// Pointer shape					
		this.HideSubMenus(true);												// Hide submenus										
		$("#piicons").css({ display:"none"});									// Hide
		$("#pimenu").animate({ width:0, height:0,top:o.sy,left:o.sx, opacity:1},0);	// Zoom off
		$("#pamenu").animate({ top:o.sy-25, left:o.sx-25 },0);					// Zoom off
		}	
}

PieMenu.prototype.HideSubMenus=function(mode)									// HIDE SUBMENUS
{
	if (!mode)
		return;
	$("#pisubback").remove();													// Remove colorbars
}

PieMenu.prototype.SetSlice=function(num, obj)								// SET SLICE INFO
{
	$("#sliceicon"+num).prop("src",obj.ico);									// Change icon
	this.ops.slices[num]=obj;													// Set data
}

PieMenu.prototype.ShowTextType=function(num, def)							// TYPE IN A VALUE
{
	var _this=this;																// Save context
	var ang=(num)*this.ops.ang-22.5;											// Start angle
	var w=this.ops.wid/2;														// Center
	var r=w+18;																	// Radius
	x=Math.floor(w+(Math.sin((ang)*0.0174533)*r))-7;							// Calc x
	y=Math.floor((w-Math.cos((ang)*0.0174533)*r))-7;							// Y
	if (ang > 180) x-=96;														// Shift if on left side

	var str="<div id='pisubback' class='pi-subbar unselectable'>";				// Shell
 	str+="<input type='text' class='pi-type' id='pitype' "; 					// Input
	if (def)	str+="value='"+def+"'";											// Add default
	str+="style='left:"+x+"px;top:"+y+"px'>";									// Position
	$("#pimenu").append(str+"</div>");											// Add to menu														

	$("#pitype").on("change",function(){										// TYPING TEXT
		_this.SendMessage("click",_this.curSlice+"|"+$("#pitype").val());		// Send event
		});
}

PieMenu.prototype.ShowMenuPick=function(num, def)							// SHOW TEXT PICK
{
	var x,y,i,j,t,str;
	var _this=this;																// Save context
	var o=this.ops.slices[num];													// Point at data
	var n=o.options.length;														// Number of options
	var ang=(num)*this.ops.ang-11.5-(n*11);										// Angle
	var w=this.ops.wid/2;														// Center
	var r=w+16;																	// Radius
	inSub=false;

	var str="<div id='pisubback' class='pi-subbar unselectable'>";				// Main shell
	for (i=0;i<n;++i) {															// For each option
		str+="<div class='pi-textopt' id='pitext"+i+"'>"; 						// Add div
		t="";																	// Assume nothing
		if (o.options[i])														// If an option spec'd
			t=o.options[i].split(":")[0];										// Use first level
		str+=t+"</div>";														// Add label
		}
	$("#pimenu").append(str+"</div>");											// Add to menu														
	
	if (def != undefined)														// If a default
		$("#pitext"+def).css({"opacity":1});									// Highlight

	for (i=0;i<n;++i) {															// For each option
		if (((ang+360)%360 > 180) && $("#pitext"+i).text())						// Shift if on left side
			t=$("#pitext"+i).css("width").replace(/px/,"")-0;					// Accomodate text
		else																	// 0-180
			t=0;																// No shift
		x=Math.floor(w+(Math.sin((ang)*0.0174533)*r-t-7));						// Calc x
		y=Math.floor((w-Math.cos((ang)*0.0174533)*r)-7);						// Y
		ang+=18;																// Next angle
		
		$("#pitext"+i).css({"left":x+"px","top":y+"px"});						// Position
		
		$("#pitext"+i).on("mouseover", function(e) {							// OVER ITEM
			$(this).css({opacity:1});											// Highlight
			if (inSub)	return;													// Ignore if in submenu already
			inSub=true;															// In submenu
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			var v=o.options[id].split(":");										// Split out sub options
			if (v.length > 1)													// If multi-level
				$(this).css({"border-radius":"4px",height:"auto"});				// Smaller radius, auto scale
			var str="<div id='pitextsub-0' style='padding-bottom:.5em;font-weight:bold'>"+v[0]+"</div>";	 // Add title
			for (i=1;i<v.length;++i)											// For each sub
				str+="<div id='pitextsub-"+i+"'>"+v[i]+"</div>";				// Add submenu as a span
			$(this).html(str);													// Set menu up
			for (j=1;j<v.length;++j) {
				$("#pitextsub-"+j).on("mouseover", function(e) {				// OVER SUBITEM
					$(this).css({"color":"#00a8ff"});							// Highlight
					});
				$("#pitextsub-"+j).on("mouseout", function(e) {					// OUT OF SUBITEM
					$(this).css({color:"#666"});								// Restore  color
					});
				}
			});
	
		$("#pitext"+i).on("mouseout", function(e) {								// OUT OF ITEM
			if (e.relatedTarget && (e.relatedTarget.id.substr(0,10) == "pitextsub-"))	// If a submenu
				return;															// Not out
			inSub=false;														// Out of submenu
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			$(this).css({"opacity":.75,"border-radius":"16px"});				// Restore 
			$(this).html(o.options[id].split(":")[0]);							// Only title	
			});

		$("#pitext"+i).on("click", function(e) {								// CLICK ITEM
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			if (e.target.id == "pitextsub-0")	;								// Main menu uses id of main option
			else id=(id*10)+(e.target.id.substr(10)-0);							// Extract sub id
			_this.SendMessage("click",_this.curSlice+"|"+id);					// Send event
			Sound("click");														// Click
			});
		}
}

PieMenu.prototype.ShowColorBars=function(num, mode, def)					// SET COLOR / EDGE / TYPE
{
	var x,y,i,n=4;
	var _this=this;																// Save context
	var wids=[8,6,4,3,2,1];														// Width choice
	var cols=[ "#0000aa","#3182bd","#6baed6","#9ecae1","#aa0000","#e6550d","#fd8d3c","#fdae6b",
			   "#ffcc00","None","#00cc00","#31a354","#74c476","#a1d99b","#756bb1","#9e9ac8",
			   "#bcbddc","#ffffff","#cccccc","#888888","#666666","#444444","#000000"
				];	
	var str="<div id='pisubback' class='pi-subbar unselectable' >";				// Color shell
 	for (i=0;i<cols.length;++i)													// For each color
  		str+="<div id='pichip"+i+"' class='pi-colchip'></div>";					// Make color chip
 	if (mode == "edge") {														// If setting edge
		str+="<div id='pilinback' class='pi-subbar unselectable' style='width:50px;height:72px'>";			// Line shell
		if (this.parObj.curShape < 3)											// Line or poly
			str+="<div id='picurve' class='pi-fdrop unselectable'></div>";		// Add curve
		if (this.parObj.curShape < 5)											// Not text
			for (i=0;i<wids.length;++i)											// For each width
  				str+="<div id='piline"+i+"' class='pi-linechip'></div>";		// Make width chip
		str+="</div><div id='piarrback' class='pi-subbar unselectable' style='width:50px;height:72px'>";	// Arrow shell
		if (this.parObj.curShape == 3) { 										// If drawing boxes
			str+="<div id='piarr0' class='pi-arrow'></div>";					// Make arrow chip
			str+="<div id='piarr1' class='pi-arrow'></div>";					// Make arrow chip
			}
		else if (this.parObj.curShape < 4)										// Not in circles or text
			for (i=0;i<4;++i)													// For each width
  				str+="<div id='piarr"+i+"' class='pi-arrow'></div>";			// Make arrow chip
		
		if (this.parObj.curShape < 5) 											// Not text
			str+="<div id='pidrop' class='pi-fdrop unselectable'>Drop</div>";	// Add drop
		str+="</div>";
		}
	$("#pimenu").append(str+"</div>");											// Add to menu														
	$("#pichip9").text("X");													// None icon
	if (!def)	def=["#000000,0,0,0,0,"];										// If no def defined, set default
	def=def.split(",");															// Split int params
	if (!def[1]) def[1]=0;														// Force to none
	if (!def[2]) def[2]=0;														// Force to none
	if (!def[3]) def[3]=0;														// Force to none
	if (!def[4]) def[4]=0;														// Force to none
	if (!def[5]) def[5]="";														// Force to none
	var ang=(num)*this.ops.ang-82.5;											// Start of colors angle
	var w=this.ops.wid/2;														// Center
	var r=w+32;																	// Radius
	var ang2=ang+62;															// Center angle																
	var ix=Math.floor(w+(Math.sin((ang2)*0.0174533)*r))-3;						// Calc x
	var iy=Math.floor((w-Math.cos((ang2)*0.0174533)*r))-3;						// Y
	if (ang2 > 180) ix-=58;														// Shift if on left side
	str="<input type='text' class='pi-coltext' id='picoltext' "; 
	str+="style='left:"+ix+"px;top:"+iy+"px'>";
	str+="<div id='pitextcol' class='pi-colchip unselectable' style='";	
	str+="border:.5px solid #999;left:"+(ix+49)+"px;top:"+(iy+3)+"px;height:7px;width:8px'></div>";
	if ((this.parObj.curShape == 5) && mode == "edge") {						// Text
		str+="<select class='pi-select' id='pifont'";							// Add font selection
		str+="style='position:absolute;width:64px;left:"+ix+"px;top:"+(iy-18)+"px'>";	
		str+="<option value='0'>Arial</option>";
		str+="<option value='1'>Times</option>";
		str+="<option value='2'>Courier</option></select>";
		str+="<div id='pibold' class='pi-fstyle unselectable' " ;				// Bold
		str+="style='left:"+(ix+70)+"px;top:"+(iy-18)+"px'>B</div>";	
		str+="<div id='piital' class='pi-fstyle unselectable' ";				// Ital
		str+="style='left:"+(ix+89)+"px;top:"+(iy-18)+"px'><i>I</i></div>";	
		str+="<div id='pidrop' class='pi-fdrop unselectable' " ;				// Drop
		str+="style='left:"+(ix+70)+"px;top:"+(iy)+"px'>Drop</div>";	
		str+="<div id='pifsize' class='pi-fstyle unselectable' ";				// Size
		str+="style='width:50px;height:0px;left:"+(ix+5)+"px;top:"+(iy-32)+"px'></div>";	
		str+="<input type='text' class='pi-coltext' id='pisiztxt' "; 
		str+="style='text-align:center;width:19px;height:9px;left:"+(ix+70)+"px;top:"+(iy-36)+"px'>";	
			str+="<input type='text' class='pi-coltext' id='pitxt' "; 
		str+="style='width:89px;height:9px;left:"+ix+"px;top:"+(iy+18)+"px'>";	

//		str+="<div id='pifdemo' class='pi-fdemo unselectable' " ;				// Demo letter
//		str+="style='left:"+ix+"px;top:"+(iy+36)+"px'>A</div>";	
		}
	$("#pisubback").append(str);												// Add to color bar														
	$("#pitextcol").css("background-color",def[0]);								// Def col
	$("#picoltext").val(def[0]);												// Def text
	$("#pifont").val(def[3]-0);													// Def font
	$("#pifontsty").val(def[4]-0);												// Def font style
	$("#pisiztxt").val(def[1]);													// Def text size
	$("#pitxt").val(def[5]);													// Def text 
	$("#pifsize").slider({														// Init size slider
		min:10,max:99,step:2,value:def[1],										// Params
		slide: function(e,ui) { $("#pisiztxt").val(ui.value)},					// On slide
		stop: function(e,ui) { 													// On stop
			def[1]=ui.value;													// Get size
			updateColor("click");												// Update menu
			Sound("click");														// Click
			}
		});	
	
	$("#picoltext").on("change",function(){										// TYPING OF COLOR
		def[0]=$("#picoltext").val();											// Get text
		if (def[0].substr(0,1) != "#") def[0]="#"+def[0];						// Add # if not there
		updateColor("click");													// Update menu
		});
	
	r=w+12;																		// Set color chip radius
	for (i=0;i<cols.length;++i) {												// For each color
		x=(w+(Math.sin(ang*0.0174533)*r)-6).toFixed(4);							// Calc x
		y=(w-Math.cos(ang*0.0174533)*r-6).toFixed(4);							// y
		$("#pichip"+i).css(
			{"transform":"translate("+x+"px,"+y+"px) rotate("+ang+"deg)",		// Rotate 
			"background-color":cols[i]											// Chip color
			}); 	
		ang+=7;																	// Next angle for chip
		
		$("#pichip"+i).on("click", function(e) {								// COLOR CHIP CLICK
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			def[0]=cols[id];													// Get color
			updateColor("click");												// Update menu
			Sound("click");														// Click
			});

		$("#pichip"+i).on("mouseover", function(e) {							// COLOR CHIP HOVER
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			$(this).css("opacity",.5);											// Darken
			if (mode == "color") {												// If just setting color
				def[0]=cols[id];												// Get color
				updateColor();													// Update menu
				}
			});
	
		$("#pichip"+i).on("mouseout", function() {								// COLOR OUT
			$(this).css("opacity",1);											// Restore
			});
	}

	ix+=12;																		// Starting point
	for (i=0;i<wids.length;++i) {												// For each width
		$("#piline"+i).css({ "top":(13*i)+"px","height":wids[i]+1+"px" }); 		// Set line width
		
		$("#piline"+i).on("mouseover", function() {								// LINE HOVER
			$(this).css("opacity",.5);											// Darken
			});
		
		$("#piline"+i).on("mouseout", function() {								// LINE OUT
			$(this).css("opacity",1);											// Restore
			});
		
		$("#piline"+i).on("click", function(e) {								// LINE HOVER
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			def[1]=wids[id];													// Get width
			Sound("click");														// Click
			updateColor("click");												// Update menu
			});
		}
	
	for (i=0;i<4;++i) {															// For each arrow
		$("#piarr"+i).css({ "top":(19*i)+10+"px" }); 							// Set position
		
		$("#piarr"+i).on("mouseover", function(e) {								// ARROW HOVER
			$(this).css("opacity",.5);											// Darjen
			});
		
		$("#piarr"+i).on("mouseout", function(e) {								// ARROW OUT
			$(this).css("opacity",1);											// Restore
			});
		
		$("#piarr"+i).on("click", function(e) {									// LINE HOVER
			var id=e.currentTarget.id.substr(5)-0;								// Extract id
			def[3]=id;															// Get arrow
			Sound("click");														// Click
			updateColor("click");												// Update menu
			});
		}
	
	if (this.parObj.curShape == 3) { 											// If drawing boxes
		$("#piarr0").css({ "height":"10px","left":"0px","top":"10px" })
		$("#piarr1").css({ "height":"10px","left":"0px","top":"28px","border-radius":"4px" })
		$("#pidrop").css({ "height":"12px","left":"-5px","top":"46px" })
		}
	else if (this.parObj.curShape == 4) { 										// If drawing circles
		$("#pidrop").css({ "height":"12px","left":"-5px","top":"8px" })
		}
	else if (this.parObj.curShape < 3) {										// Drawing arrows
		$("#piarr1").append("<div id='parr1' class='pi-rarr' style='left:16px;top:-5px'</div>")
		$("#piarr2").append("<div id='parr2' class='pi-larr' style='left:-2px;top:-5px'</div>");
		$("#piarr3").append("<div id='parr3' class='pi-larr' style='left:-2px;top:-5px'</div>");
		$("#piarr3").append("<div id='parr4' class='pi-rarr' style='left:16px;top:-5px'</div>")
		$("#pidrop").css({ "height":"12px","left":"-5px","top":"84px" })
		$("#picurve").css({ "height":"12px","left":"5px","top":"-20px" })
		}
	$("#pilinback").css({														// Set b/g for lines
		"left":ix+"px","top":iy-4-(12*wids.length)+"px",						// Position
		"height":12*wids.length+"px"											// Height
		});
	$("#piarrback").css({ "left":ix+10+"px","top":iy+15+"px" });				// Set b/g for arrows
	updateColor();																// Update menu

	$("#pifont").on("change", function() {										// ON FONT CHANGE
		def[3]=$(this).val();													// Get font
		updateColor("click");													// Update menu
		Sound("click");															// Click
		});

	$("#pibold").on("click", function() {										// ON FONT BOLD CLICK
		if (def[4]&1)															// If bold 
			def[4]&=2;															// Retain italic status and unbold
		else																	// Not bold
			def[4]|=1;															// Bold it														
		updateColor("click");													// Update menu
		Sound("click");															// Click
		});

	$("#piital").on("click", function() {										// ON FONT ITAL CLICK
		if (def[4]&2)															// If ital 
			def[4]&=1;															// Retain bold status and unital
		else																	// Not ital
			def[4]|=2;															// Ital it														
		updateColor("click");													// Update menu
		Sound("click");															// Click
		});

	$("#pidrop").on("click", function() {										// ON FONT DROP CLICK
		def[2]=(def[2]-0+1)%3;													// Force number and step 0-2
		updateColor("click");													// Update menu
		Sound("click");															// Click
		});

	$("#picurve").on("click", function() {										// ON CURVE CLICK
		def[4]=(def[4]-0+1)%2;													// Force number and step 0-2
		updateColor("click");													// Update menu
		Sound("click");															// Click
		});

	$("#pisiztxt").on("change", function(e) {									// ON FONT SIZE CHANGE
		def[1]=$(this).val();													// Get font
		updateColor("click");													// Update menu
		Sound("click");															// Click
		});

	$("#pitxt").on("change",function() {										// TYPING OF VALUE
		def[5]=$(this).val();													// Get text
		updateColor("click");													// Update menu
		Sound("click");															// Click
		});

	function updateColor(send) {												// SET COLOR INFO
		$("#picoltext").val(def[0]);											// Show value
		$("#pitextcol").css("background-color",def[0]);							// Color chip
		$("#pidrop").css("background-color",(def[2]>0) ? "#00a8ff" : "#999");	// Color drop
		$("#pidrop").css("color",(def[2]>1) ? "#000" : "#fff");					// Color drop text
		$("#pibold").css("background-color",(def[4]&1) ? "#00a8ff" : "#999");	// Color bold
		$("#piital").css("background-color",(def[4]&2) ? "#00a8ff" : "#999");	// Color ital
		$("#picurve").text((def[4] > 0) ? "Curve" : "Line");					// Show curve status
		$("#pifsize").slider("value",def[1]);									// Set font size
/*		var font="Sans-serif";													// Assume sans
		if (def[3] == 1)		font="Serif";									// Serif
		else if (def[3] == 2)	font="Courier";									// Fixed
		var drop="transparent";													// Assume no drop
		if (def[2] == 1)		drop="#ffffff";									// White drop
		else if (def[2] == 2)	drop="#000000";									// Black drop
		$("#pifdemo").css({"color":def[0],"font-size":def[1]+"px",				// Font size and color
			"font-weight":def[4]&1 ? "bold" : "normal",							// Bold
			"font-style":def[4]&2 ? "italic" : "normal",						// Italic
			"font-family":font,"text-shadow":"4px 4px 16px "+drop				// Drop													// Font
			});
*/		
		for (j=0;j<wids.length;++j) 											// For each width
			$("#piline"+j).css("background-color",(wids[j] == def[1]) ? "#00a8ff" : "#e8e8e8");	// Make blue
		for (j=0;j<4;++j) {														// For each arrow
			$("#piarr"+j).css("background-color",(j == def[3]) ? "#00a8ff" : "#e8e8e8");	// Make blue
			if (j == 1)
				$("#parr1").css("border-left","6px solid "+((j == def[3]) ? "#00a8ff" : "#e8e8e8"));	// Make blue
			if (j == 2)
				$("#parr2").css("border-right","6px solid "+((j == def[3]) ? "#00a8ff" : "#e8e8e8"));	// Make blue
			if (j == 3) {
				$("#parr3").css("border-right","6px solid "+((j == def[3]) ? "#00a8ff" : "#e8e8e8"));	// Make blue
				$("#parr4").css("border-left","6px solid "+((j == def[3]) ? "#00a8ff" : "#e8e8e8"));	// Make blue
				}
			}
		if (send)																// If sending s message
			_this.SendMessage(send,_this.curSlice+"|"+def.toString());			// Send event
		}
}

PieMenu.prototype.ShowSlider=function(num, def)								// SHOW SLIDER
{
	var x,y,i;
	var _this=this;																// Save context
	var str="<div id='pisubback' class='pi-subbar unselectable'>";				// Shell
 	for (i=0;i<60;++i)															// For each arc part
  		str+="<div id='piarc"+i+"' class='pi-sliarc'></div>";					// Make arc chip
	str+="<div id='pislidot' class='pi-slidot'></div>";							// Make slider dot
	$("#pimenu").append(str+"</div>");											// Add to menu														
	var ang=(num)*this.ops.ang-22.5-30;											// Start of angle
	var w=this.ops.wid/2;														// Center
	var r=w+16;																	// Radius
	var ang2=ang+28;															// Center angle																
	x=Math.floor(w+(Math.sin((ang2)*0.0174533)*(r+18)))-7;						// Calc x
	y=Math.floor((w-Math.cos((ang2)*0.0174533)*(r+18)))-7;						// Y
	str="<input type='text' class='pi-coltext' id='pislitext' "; 				// Make angle input
	str+="style='left:"+x+"px;top:"+y+"px;width:16px;text-align:center'>";		// Style it
	$("#pisubback").append(str);												// Add to submenu														
	setDot(def);																// Put up dot

	$("#pislidot").draggable({
		drag:function(e,ui) {
		   	var w=_this.ops.wid/2;												// Size
			var x=e.clientX-(_this.ops.x+w);									// Dx from center
 			var y=e.clientY-(_this.ops.y+w);									// Dy from center
			var a=Math.floor((180-Math.atan2(x,y)*57.296));						// Get angle
			if ((a < 60) && (ang > 270)) a+=360;								// If it crosses 360 
			a=Math.max(0,Math.min(a-ang,60));									// Cap 0-60
			var rad=(a+ang)*0.0174533;											// Radians
			x=Math.floor((Math.sin(rad)*r)+w)-5;								// Calc x
			y=Math.floor((w-Math.cos(rad)*r))-5;								// Y
			ui.position.left=x;		ui.position.top=y;							// Position dot
			var val=Math.round(a/.6);											// Convert to 0-100
			$("#pislitext").val(val);											// Set text
			},
		stop:function(event,ui) {
			var val=$("#pislitext").val();										// Get val
			setDot(val);														// Finalize dot
			_this.SendMessage("click",_this.curSlice+"|"+val);					// Send event
			Sound("click");														// Click
			}
		})

	$("#pislitext").on("change",function() {									// TYPING OF VALUE
		var val=$(this).val();													// Get val
		val=val ? val : 0;														// Fix if null
		val=Math.max(0,Math.min(val,100));										// Cap 0-100
		setDot(val);
		});

	ang2=ang;
	for (i=0;i<60;++i) {														// For each color
		x=(w+(Math.sin(ang2*0.0174533)*r)).toFixed(4);							// Calc x
		y=(w-Math.cos(ang2*0.0174533)*r).toFixed(4);							// Y
		$("#piarc"+i).css({"transform":"translate("+x+"px,"+y+"px) rotate("+ang+"deg)"}); // Rotate 
		ang2+=1;																// Next angle for arc

		$("#piarc"+i).on("click",function(e) {									// CLICK ON ARC SECTION
			var id=e.currentTarget.id.substr(5)-0;								// Extract id
			setDot(Math.floor(id*1.666));										// Move dot there
			});
		}

	function setDot(val) {
		val=val ? val : 0;														// Fix if null
		val=Math.max(0,Math.min(val,100));										// Cap 0-100
		$("#pislitext").val(val);												// Set text
		var a=(num)*_this.ops.ang-52.5;											// Start of angle
		a=(a+(val*.6))*0.0174533;												// Calc angle
		x=Math.floor((Math.sin(a)*r)+w)-5;										// Calc x
		y=Math.floor((w-Math.cos(a)*r))-5;										// Y
		$("#pislidot").css({"left":+x+"px","top":+y+"px"});						// Position
	}
}

PieMenu.prototype.ShowIcons=function(num, def)								// SHOW ICON RING
{
	var x,y,i,str;
	var _this=this;																// Save context
	var o=this.ops.slices[num];													// Point at data
	var n=o.options.length;														// Number of options
	var ang=(num)*this.ops.ang-11.5-(n*11);										// Angle
	var w=this.ops.wid/2;														// Center
	var r=w+10;																	// Radius
	var str="<div id='pisubback' class='pi-subbar unselectable'>";				// Main shell
	for (i=0;i<n;++i) {															// For each option
		str+="<div class='pi-icon' id='piicon"+i+"'>"; 							// Add div
		str+="<img src='"+o.options[i]+"' width='18'></img></div>";				// Add icon
		}
	$("#pimenu").append(str+"</div>");											// Add to menu														
	
	if (def != undefined)														// If a default
		$("#piicon"+def).css({"opacity":1});									// Highlight

	for (i=0;i<n;++i) {															// For each option
		x=Math.floor(w+(Math.sin((ang)*0.0174533)*r-14));						// Calc x
		y=Math.floor((w-Math.cos((ang)*0.0174533)*r)-14);						// Y
		ang+=19;																// Next angle
		$("#piicon"+i).css({"left":x+"px","top":y+"px"});						// Position
		
		$("#piicon"+i).on("mouseover", function(e) {							// OVER ITEM
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			for (var j=0;j<n;++j)												// For each width
				$("#piicon"+j).css({"opacity":(j == id) ? 1: .75 });			// Highlight if current
			});
		$("#piicon"+i).on("click", function(e) {								// CLICK ITEM
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			_this.SendMessage("click",_this.curSlice+"|"+id);					// Send event
			Sound("click");														// Click
			});


		}
}

PieMenu.prototype.SendMessage=function(cmd, msg) 							// SEND HTML5 MESSAGE 
{
	var str=cmd+"|"+this.ops.id;												// Add src and id						
	if (msg)																	// If more to it
		str+="|"+msg;															// Add it
	window.parent.postMessage(str,"*");											// Send message to parent wind		
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// QDRAW.JS 
// Drawing tool
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function QDraw(dockSide, dockPos, parent)									// CONSTRUCTOR
{
	var _this=this;																// Save context
	parent=parent ? parent : "body";											// If a parent div spec'd use it
	if (parent != "body")  	parent="#"+parent;									// Add #
	this.parent=parent;		this.dockSide=dockSide;	this.dockPos=dockPos;		// Save settings

	this.cVolume=33;		this.gridSnap=0;	this.numSelect=0;				// General settings
	this.showSnap=true;		this.showInfo=false;
	this.curUndo=0;			this.curRedo=0;		this.changed=false;				// Undo/redo
	this.clipboard=[];															// Holds cut and paste segs

	this.curCurve=0;	this.curCol="#e6550d";	this.curText="Text";			// Default drawing settings
	this.curDrop=0;		this.curShape=0;		this.curAlpha=100;				// Common options
	this.curEwid=1;		this.curEcol="#000000";	this.curEtip=0;					// Edge options
	this.curTsiz=24;	this.curTsty=0;			this.curTfon=0;					// Text options
	
	this.segs=[];																// Drawing data
	this.undos=[];																// Undo data
	var str="<div id='pamenu' class='pa-main unselectable'>";					// Main shell
	str+="<div id='pacoldot' class='pa-dot unselectable'>";						// Color dot
	$(parent).append(str);														// Add to DOM														

	var ops={id:"qdraw",x:330,y:334,wid:150,ang:45,slices:[]};
	ops.dial="img/piback.png";													// Dial background
	ops.hilite="img/philite.png";												// Slice highlight
	ops.slices[1]={ type:"col", ico:"img/color-icon.png", def:this.curCol+",0,"+this.curDrop };	// Color slice 
	ops.slices[2]={ type:"edg", ico:"img/edge-icon.png", def:this.curEcol+","+this.curEwid+","+this.curDrop+","+this.curEtip+","+this.curCurve };	// Edge 
	ops.slices[3]={ type:"sli", ico:"img/alpha-icon.png", def:100 };			// Alpha slice 
	ops.slices[4]={ type:"but", ico:"img/redo-icon.png", options:["Redo"]};		// Redo slice 
	ops.slices[5]={ type:"but", ico:"img/undo-icon.png",options:["Undo"]};		// Undo slice 
	ops.slices[6]={ type:"men", ico:"img/align-icon.png", options:["Align:Top:Middle:Bottom:Left:Center:Right","Distribute:Horiz:Vert","Arrange:To back:Backward:Forward:To front"]};	// Align  
	ops.slices[7]={ type:"but", ico:"img/gear-icon.png" };						// Center 
	ops.slices[8]={ type:"ico", ico:"img/draw-icon.png", def:this.curShape };	// Blank slice 
	ops.slices[8].options=["img/point-icon.png","img/line-icon.png","img/poly-icon.png","img/box-icon.png","img/circle-icon.png","img/text-icon.png"] ;

	this.gd=new Gdrive();														// Google drive access
	Sound("click",true);														// Init sound
	Sound("ding",true);															// Init sound
	Sound("delete",true);														// Init sound

	this.pie=new PieMenu(ops,this);												// Init pie menu
	this.GraphicsInit();														// Init graphics
	this.DrawMenu();															// Draw it
	this.cVolume=this.GetCookie("volume")    ? this.GetCookie("volume")-0 : 33;	// Get cookies
	this.gridSnap=this.GetCookie("gridSnap") ? this.GetCookie("gridSnap")-0 : 0;								
	this.showSnap=this.GetCookie("showSnap")-0 ? true : false;							
	this.showInfo=this.GetCookie("showInfo")-0 ? true : false;								
	this.ShowInfoBox(true);														// Hide or show info box
	document.onkeyup=$.proxy(this.onKeyUp,this);								// Keyup listener
	document.onkeydown==$.proxy(this.onKeyDown,this);							// Keydown listener
	
	$("#pamenu").draggable({													// Make it draggable
		 containment: "parent",
		 start:function(e,ui) {													// On start
			$(this).css({"border-radius":"100px"});								// Make into dot
			_this.pie.ShowPieMenu(false);										// Hide menu
			},
		stop:function(e,ui) {													// On stop
			var l=$(_this.parent).width()*.1;									// L
			var r=$(_this.parent).width()*.8;									// R
			var t=$(_this.parent).height()*.1;									// T
			var b=$(_this.parent).height()*.9;									// B
			if (e.clientX < l)			_this.dockSide="left";					// Left
			else if (e.clientX > r)		_this.dockSide="right";					// Right
			else if (e.clientY < t)		_this.dockSide="top";					// Top
			else if (e.clientY > b)		_this.dockSide="bottom";				// Bottom
			else						_this.dockSide="float";					// Float
			_this.pie.ops.sx=e.clientX;	_this.pie.ops.sy=e.clientY;				// Start point
			_this.dockPos=null;													// Set y
			_this.DrawMenu();													// Redraw it
			Sound("click");														// Click
	
			}
		});

		$("#pamenu").on("contextmenu", function(e) {							// RIGHT CLICK
			$(this).trigger("click");											// Treat as a click
			return false;														// Don't pull up context menu
		});

		$("#pamenu").on("click", function(e) {									// CLICK ITEM
			var x=$("#pamenu").position().left+25;								// Get cx
			var y=$("#pamenu").position().top+25;								// Get cy
			var w=_this.pie.ops.wid/2;											// Get width/2
			if (_this.dockSide == "left") {										// Dock left
				_this.pie.ops.x=x+40;											// Place to the right
				_this.pie.ops.y=y-w;											// Center
				}
			else if (_this.dockSide == "right") {								// Dock right
				_this.pie.ops.x=x-w-w-108;										// Place to the left
				_this.pie.ops.y=y-w;											// Center
				}
			else if (_this.dockSide == "top") {									// Dock top
				_this.pie.ops.y=y+60;											// Place down
				_this.pie.ops.x=x-w;											// Center
				}
			else if (_this.dockSide == "bottom") {								// Dock bottom
				_this.pie.ops.y=y-w-w-40;										// Place up
				_this.pie.ops.x=x-w;											// Center
				}
			else if (_this.dockSide == "float") {								// Floating
				_this.pie.ops.y=y-w;											// Center
				_this.pie.ops.x=x-w;											// Center
				}
			if (_this.drawMode && _this.drawMode.match(/newxy/)) 				// If needing to stop drawing
				_this.EndDrawing();												// End current drawing
			else{																// Regular click
				_this.pie.ShowPieMenu(!_this.pie.active);						// Toggle
				_this.DrawMenu();												// Draw menu dot
				}	
			});
	
	$(parent).on("mouseup",function(e) { 										// CLICK ON BACKGROUND
		if (e.target.id == "Q-SVG")	{											// If on background
			_this.pie.ShowPieMenu(false);										// Hide it
			_this.DrawMenu();													// Redraw dot
			}
		}); 
}

QDraw.prototype.DrawMenu=function()											// SHOW DRAWING TOOL MENU
{
	var col=this.curCol;														// Set color
	var icons=["point","line","poly","box","circle","text"];					// Names of icons
	var x=$(this.parent).position().left+$(this.parent).width()-50;				// Right side
	var y=$(this.parent).position().top+$(this.parent).height()-50;				// Bottom side
	if (!col || (col == "None"))												// If a null color
		col="transparent";														// Make transparent
	$("#pacoldot").css({"background":col+" url('img/"+icons[this.curShape]+"-icon.png') no-repeat center center" });
	$("#pacoldot").css({"background-size":"20px 20px","opacity":this.curAlpha/100});// Size it
	var ops=this.pie.ops;
	ops.slices[1]={ type:"col", ico:"img/color-icon.png", def:this.curCol+",0,"+this.curDrop };	// Color slice 
	if (this.curShape == 5)														// If text
		this.pie.SetSlice(2,{type:"edg", ico:"img/font-icon.png", def:this.curCol+","+this.curTsiz+","+this.curDrop+","+this.curTfon+","+this.curTsty+","+this.curText});// Text menu 
	else																		// If shape
		this.pie.SetSlice(2,{type:"edg", ico:"img/edge-icon.png", def:this.curEcol+","+this.curEwid+","+this.curDrop+","+this.curEtip+","+this.curCurve});	// Edge menu
	ops.slices[3]={ type:"sli", ico:"img/alpha-icon.png", def:this.curAlpha };	// Alpha slice 
	ops.slices[8]={ type:"ico", ico:"img/draw-icon.png", def:this.curShape };	// Blank slice 
	ops.slices[8].options=["img/point-icon.png","img/line-icon.png","img/poly-icon.png","img/box-icon.png","img/circle-icon.png","img/text-icon.png"] ;
	
	col=(this.curEcol == "None") ? this.curCol : this.curEcol					// Set edge
	$("#pacoldot").css({"border":"2px solid "+col} );							// Edge color
	
	if (this.pie.active) 														// If pie menu is visible
		$("#pamenu").css({"border-radius":"100px"});							// Make it round
	else{																		// Pie hidden
		if (this.dockSide == "left")
			$("#pamenu").css({"border-radius":"0px","left":"0px",
				"border-top-right-radius":"100px",
				"border-bottom-right-radius":"100px",
				"top":this.dockPos+"%"
				});								
		else if (this.dockSide == "right")
			$("#pamenu").css({"border-radius":"0px","left":x+"px",
				"border-top-left-radius":"100px",
				"border-bottom-left-radius":"100px",
				"top":this.dockPos+"%"
				});								
		else if (this.dockSide == "top")
			$("#pamenu").css({"border-radius":"0px","top":"0px",
				"border-bottom-left-radius":"100px",
				"border-bottom-right-radius":"100px",
				"left":this.dockPos+"%"
				});								
		else if (this.dockSide == "bottom")
			$("#pamenu").css({"border-radius":"0px","top":y+"px",
				"border-top-left-radius":"100px",
				"border-top-right-radius":"100px",
				"left":this.dockPos+"%"
				});								
		else if (this.dockSide == "float")
			$("#pamenu").css({"top":this.sx+"px","left":this.sy+"px" });								
	}
}

QDraw.prototype.HandleMessage=function(msg)									// REACT TO DRAW EVENT
{
	var vv,v=msg.split("|");													// Split into parts
	
	if ((v[1] == "qdraw") && (v[0] == "click")) {								// A click in main menu
		if (v[2])																// If not center
			this.pie.ops.slices[v[2]].def=v[3];									// Set new default
		if (v[3])																// If def set
			vv=v[3].split(",");													// Split into sub parts
		switch(v[2]-0) {														// Route on slice
			case 1:																// Color
				this.curCol=vv[0];												// Set color
				this.StyleSelectedSegs(this.changed=true);						// Style all selected segs
				break;
			case 2:																// Edge or text styling 
				if (this.curShape == 5) {										// If text
					this.curCol=vv[0];											// Set color
					this.curTsiz=vv[1];											// Set size
					this.curDrop=vv[2];											// Set drop 
					this.curTfon=vv[3];											// Set font
					this.curTsty=vv[4];											// Set style
					this.curText=vv[5];											// Set text
					}
				else{															// Edge													
					this.curEcol=vv[0];											// Set color
					this.curEwid=vv[1];											// Set width
					this.curDrop=vv[2];											// Set drop 
					this.curEtip=vv[3];											// Set tip
					this.curCurve=(vv[4] == undefined) ? 0 : vv[4];				// Set curve
					}
				this.StyleSelectedSegs(this.changed=true);						// Style all selected segs
				break;
			case 3:																// Alpha
				this.curAlpha=vv[0];											// Set alpha
				this.StyleSelectedSegs(this.changed=true);						// Style all selected segs
				break;
			case 4:																// Red
				this.ReDo();													// Do it
				break;
			case 5:																// Undo
				this.UnDo();													// Undo it
				break;
			case 6:
				if (vv[0] < 11)													// Align
					this.AlignSegs(vv[0]%10);									// Align segs
				else if (vv[0] < 21)											// Distribute
					this.AlignSegs(vv[0]%10+10);								// Distribute widths
				else if (vv[0] < 31)											// Arrange
					this.ArrangeSegs(vv[0]%10);									// Arrange Z-order
				break;
			case 7:																// Settings
				this.Settings();
				break;
			case 8:																// Shape
				this.curShape=vv[0];											// Set shape
				this.DrawShape(this.curShape);									// Start drawing process
				break;
			}
		this.DrawMenu();														// Redraw menu
		}
}

QDraw.prototype.Settings=function()											// SETTINGS MENU
{
	var _this=this;																// Save context
	var str="<table style='font-size:10px;color:#666'>";
	str+="<tr style='height:18px'><td><b>Click volume&nbsp;&nbsp;&nbsp;&nbsp;</b></td>";
	str+="<td><div id='cvol' class='unselectable' style='width:80px;display:inline-block'></div>&nbsp;&nbsp;&nbsp;&nbsp;"
	str+="<div id='cvolt' class='unselectable' style='display:inline-block'>"+this.cVolume+"</div></td></tr>";
	str+="<tr style='height:18px'><td><b>Grid snap</b></td>";
	str+="<td><div id='csnap' class='unselectable' style='width:80px;display:inline-block'></div>&nbsp;&nbsp;&nbsp;"
	str+="<div id='csnapt' class='unselectable' style='display:inline-block'>"+(this.gridSnap ? this.gridSnap : "Off")+"</div></td></tr>";
	str+="<tr style='height:18px'><td><b>See snap lines</b></td>";
	str+="<td><input type=checkbox id='lsnap' class='unselectable'"+(this.showSnap ? " checked" :"")+"></td></tr>";
	str+="<tr style='height:18px'><td><b>See x/y info</b></td>";
	str+="<td><input type=checkbox id='sinfo' class='unselectable'"+(this.showInfo ? " checked" :"")+"></td></tr>";
	str+="<tr style='height:18px'><td><b>Save/load</b></td>";
	str+="<td><select class='pi-select' style='padding-top:0px;' id='csave'><option></option>";
	str+="<option>Load</option><option>Save</option>";
	str+="<option>Save As...</option><option>Clear</option></select></td></tr>";
	str+="<tr><td><b>This drawing</b></td><td id='sfname'>"+(this.gd.lastName ? this.gd.lastName : "None")+"</td></tr>";
	str+="<tr><td><br></td></tr>";
	str+="<tr><td><b>Help</b></td><td><a href='https://docs.google.com/document/d/1oTbVfuBwFQvgo8EZogyuoXBu7ErCK0oAH3Ny8N_E_Mg/edit?usp=sharing' target='_blank'>";
	str+="<img src='img/helpicon.gif' style='vertical-align:bottom' title='Show help'></a></td></tr>";
	str+="</table>";

	this.Dialog("Settings",str,270, function() {
		_this.cVolume=$("#cvolt").text();
		_this.gridSnap=$("#csnap").slider("value");
		_this.SetCookie("volume",_this.cVolume,365);							// Save cookies
		_this.SetCookie("gridSnap",_this.gridSnap,365);							
		_this.SetCookie("showSnap",_this.showSnap ? 1 : 0,365);							
		_this.SetCookie("showInfo",_this.showInfo ? 1 : 0,365);							
		});
		
	$("#lsnap").on("click", function() {										// Line snap
		_this.showSnap=!_this.showSnap;											// Toggle state
		});
	$("#sinfo").on("click", function() {										// See info
		_this.showInfo=!_this.showInfo;											// Toggle state
		_this.ShowInfoBox(true);												// Hide or show it
		});
	$("#cvol").slider({															// Init volume slider
		min:0, max:100, value: _this.cVolume,									// Params
		slide: function(e,ui) { $("#cvolt").text(ui.value)},					// On slide
		});	
	$("#csnap").slider({														// Init snap slider
		min:0, max:100, step:5, value: _this.gridSnap,							// Params
		slide: function(e,ui) {													// On slide
			$("#csnapt").text(ui.value ? ui.value : "Off" );					// Set label 
			}, 
		});	
	$("#csave").on("change", function() {										// On save menu change
		var i;
		var op=$(this).val();													// Get option chosen
		$(this).val("");														// Reset option
		x=new XMLSerializer();													// Create XML serializer
		var data="<!-- "+JSON.stringify(_this.segs)+" -->\n";					// Add raw data
		var w=$(_this.parent).width();											// Container wid
		var h=$(_this.parent).height();											// Container hgt
		data+='<svg viewBox="0 0 '+w+' '+h+'" xmlns="http://www.w3.org/2000/svg">\n';// SVG header
		for (i=0;i<_this.segs.length;++i)										// For each seg
			data+=x.serializeToString(_this.segs[i].svg)+"\n";					// Add seg's SVG
		data+='</svg>';															// Close SVG
		if ((op == "Save As...") || ((op == "Save") && !_this.gd.lastId)) {		// Save to new file
			if (_this.GetTextBox("Type name of new drawing","","",function(name) {	// Type name
					_this.gd.AccessAPI(function() {
					 	_this.gd.CreateFolder(_this.gd.folderName,function(res) {	// Make sure there's a folder
							_this.gd.Upload(name,data, null,function(res) {
								 $("#sfname").text(_this.gd.lastName ? _this.gd.lastName : "None");
								// trace(res); 
								 }); 
							});
						});
				}));
			}
		else if (op == "Save") {												// Save to existing file
			_this.gd.AccessAPI(function() {
			 	_this.gd.CreateFolder(_this.gd.folderName,function(res) { 		// Make sure there's a folder
					_this.gd.Upload($("#myName").val(),data,_this.gd.lastId ? _this.gd.lastId : "",function(res) {
						$("#sfname").text(_this.gd.lastName ? _this.gd.lastName : "None");
					 	Sound("ding");											// Ding
					 	 //trace(res); 
					 	 }); 
				 	 }); 
				 });
			}
		else if (op == "Load") {												// Load
		 	 _this.gd.AccessAPI(function() {
				 _this.gd.CreateFolder(_this.gd.folderName,function(res) {
					 _this.gd.Picker(true,function(res) {
							 	 _this.gd.AccessAPI(function() {
							 	 	 _this.gd.Download(_this.gd.lastId,function(res) {
										$("#sfname").text(_this.gd.lastName ? _this.gd.lastName : "None");
								 	 	var data=res.match(/<!-- (.+) -->/)[1];	// Extract raw seg data
						 	 	 		_this.Do();								// Save undo		
							 	 	 	_this.segs=$.parseJSON(data);			// Set it
							 	 	 	_this.RefreshSVG();						// Remake SVG
									 	Sound("ding");							// Ding
							 	 	 	//trace(res); 
							 	 	 	 }); 
							 	 	 }); 
							 	 }); 
				 	 	 	 }); 
				 	 	 }); 
				}
		else if (op == "Clear")	{												// Clear
			if (_this.ConfirmBox("Are you sure?", function() {					// Are you sure?
					_this.gd.lastId=null;										// Clear last id
					_this.gd.lastName="";										// Clear last name
					_this.Do();													// Save undo
					_this.segs=[];												// Erase all segs
					_this.RefreshSVG();											// Reset SVG
					Sound("delete");											// Delete sound
					}));
			}

		});
}

QDraw.prototype.ShowInfoBox=function(setting)								// SHOW/HIDE INFO BOX
{
	var str;
	if (setting) {																	// If hiding or adding
		$("#infoboxDiv").remove();													// Remove old one
		if (this.showInfo) {														// If adding
			str="<div class='pi-infobox' id='infoboxDiv'></div>";					// Add div
			$(this.parent).append(str);												// Add to parent
			$("#infoboxDiv").draggable({ containment: "parent" });					// Make it draggable
			this.mx=this.my=0;														// Init
			}
		}
	str="&nbsp;"+this.mx+","+this.my+"&nbsp;";										// Update position into
	$("#infoboxDiv").html(str);														// Set position
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UNDO / REDO / CUT /PASTE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


QDraw.prototype.Do=function(useTempData)									// SAVE DRAWING IN SESSION STORAGE
{
	var o={};
	o.date=new Date().toString().substr(0,21);									// Get date
	o.script=this.segs;															// Get drawing data
	if (useTempData)															// If saving temp data
		o.script=this.tempSeg;													// Use it
	if (!o.script)																// No data there
		return false;															// Quit
	this.undos[this.curUndo]=$.parseJSON(JSON.stringify(o));					// Save undo
	this.undos[this.curUndo].svg=null;											// Remove svg from seg
	this.curRedo=0;																// Stop any redos
	this.changed=false;															// Reset changed flag
	this.curUndo++;																// Inc undo count
	this.SetUndoStatus();														// Set undo/redo icons
	this.tempSeg=null;															// Kill temp data
}
	
QDraw.prototype.UnDo=function()												// GET DRAWING FROM SESSION STORAGE
{
	var o={};
	if (this.curUndo < 1)														// Nothing to undo
		return;																	// Quit
	o.date=new Date().toString().substr(0,21);									// Get date
	o.script=this.segs;															// Get drawing data
	this.undos[this.curUndo]=$.parseJSON(JSON.stringify(o));					// Save undo
	this.undos[this.curUndo].svg=null;											// Remove svg from seg
	var o=this.undos[this.curUndo-1];											// Get undo
	this.segs=o.script;															// Get data
	this.RefreshSVG();															// Restore SVG
	Sound("delete");															// Delete
	this.curRedo++;																// Inc redo count
	this.curUndo--;																// Dec undo count
	this.SetUndoStatus();														// Set undo/reco icons
}

QDraw.prototype.ReDo=function()												// REDO DRAWING FROM UNDO
{
	if (!this.curRedo)															// Nothing to redo
		return;																	// Quit
	var o=this.undos[this.curUndo+1];											// Get redo data
	this.segs=o.script;															// Get data
	this.RefreshSVG();															// Restore SVG
	Sound("ding");																// Click
	this.curUndo++;																// Inc undo count
	this.curRedo--;																// Dec redo count
	this.SetUndoStatus();														// Set undo/reco icons
}

QDraw.prototype.SetUndoStatus=function()									// SET UNDO/REDO ICONS
{
	$("#sliceicon5").css("opacity",(this.curUndo > 1) ? 1 : .33);
	$("#sliceicon4").css("opacity",(this.curRedo > 0) ? 1 : .33);
}

QDraw.prototype.ClipboardCut=function()										// CLIPBOARD CUT
{
	this.Do();																	// Save undo
	this.ClipboardCopy();														// Copy selected segs
	for (i=this.segs.length-1;i>=0;--i) 										// For each seg, backwards
		if (this.segs[i].select) {												// If selected
			$("#QWire-"+i).remove();											// Remove wireframe
			$("#QSeg-"+i).remove();												// Remove SVG
			this.segs.splice(i,1);												// Remove from seg list
			}																	// Add to clipboard
	this.RefreshIds();															// Refresh SVG ids to match seg order
	Sound("delete");															// Delete
}

QDraw.prototype.ClipboardCopy=function()									// CLIPBOARD COPY
{
	var i;
	this.clipboard=[];															// Clear clipboard
	for (i=0;i<this.segs.length;++i) 											// For each seg
		if (this.segs[i].select) 												// If selected
			this.clipboard.push(JSON.parse(JSON.stringify(this.segs[i])));		// Unlink and copy seg to clipboard
	if (this.clipboard.length)													// If something copied
		Sound("click");															// Click
}

QDraw.prototype.ClipboardPaste=function()									// CLIPBOARD PASTE
{
	var i;
	this.Do();																	// Save undo
	this.DeselectSegs();														// Deselect all oder sects
	for (i=0;i<this.clipboard.length;++i) {										// For each seg
		this.clipboard[i].svg=null;												// Clear old svg
		this.segs.push(this.clipboard[i]);										// Add seg in
		this.AddSeg(this.segs.length-1);										// Add it in
		this.StyleSeg(this.segs.length-1);										// Add it in
		}
	if (this.clipboard.length)													// If pasted something
		Sound("ding");															// Ding
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KEY EVENTS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

QDraw.prototype.onKeyUp=function(e)											// KEY UP HANDLER
{
	if ((e.key == "z") && e.ctrlKey)											// Control z
		this.UnDo();															// Undo
	else if ((e.key == "Z") && e.ctrlKey)										// Control-shift Z
		this.ReDo();															// Undo
	else if ((e.key == "y") && e.ctrlKey)										// Control y
		this.ReDo();															// Redo
	else if ((e.key == "c") && e.ctrlKey)										// Control c
		this.ClipboardCopy();													// Copy
	else if ((e.key == "v") && e.ctrlKey)										// Control v
		this.ClipboardPaste();													// Paste
	else if ((e.key == "x") && e.ctrlKey)										// Control x
		this.ClipboardCut();													// Cut
	else if (e.keyCode == 27)													// Esc
		this.EndDrawing();														// End drawing
	else if (e.keyCode == 8)													// Delete
		this.RemoveLastPoint();													// Remove last point drawn
}

QDraw.prototype.onKeyDown=function(e)										// KEY DOWN HANDLER
{
	if ((e.keyCode == 8) &&														// Look for deletes key
        (e.target.tagName != "TEXTAREA") && 									// In text area
        (e.target.tagName != "INPUT")) { 										// or input
		e.stopPropagation();													// Trap it
     	return false;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GOOGLE DRIVE ACCESS 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Gdrive()															// CONSTRUCTOR
{
	this.clientId="81792849751-1c76v0vunqu0ev9fgqsfgg9t2sehcvn2.apps.googleusercontent.com";	// Google client id
	this.scope="https://www.googleapis.com/auth/drive";							// Scope of access
	this.key="AIzaSyAVjuoRt0060MnK_5_C-xenBkgUaxVBEug";							// Google API key
	this.contentType="image/svg+xml";											// SVG mime type
	this.folderName="QDrawings";												// Name of drawings folder
	this.folderId="";															// Id of drawings folder
	this.lastId="";																// Id of last drawing saved/loaded
	this.lastName="";															// Name of last file
}

Gdrive.prototype.AccessAPI=function(apiCall, callback)						// CHECK FOR AUTHORIZATION and ACCESS API
{
	gapi.auth.authorize(														// Get logged-in status
		{"client_id": this.clientId, "scope": this.scope, 						// Client info
		"immediate": true},handleAuthResult										// Immediate
		);
		
	function handleAuthResult(authResult) {										// ON GDRIVE RESPONSE
        if (authResult && !authResult.error)  									// If logged in
	 		gapi.client.load('drive', 'v2', function() {						// Load API
 	 			apiCall(callback);												// Run API callback
	 		});
	 	else																	// Not logged in
			gapi.auth.authorize(												// Ask for auth
				{"client_id": this.clientId, "scope": this.scope, 				// Client info
				"immediate": false},handleAuthResult							// Force looking for auth
				);
		}
 }

Gdrive.prototype.Download=function(id, callback)							// DOWNLOAD DATA FROM G-DRIVE
{
	var request = gapi.client.drive.files.get({ 'fileId': id });				// Request file
	request.execute(function(resp) {											// Get data
		if (resp.downloadUrl) {													// If a link
		    var accessToken=gapi.auth.getToken().access_token;					// Get access token
		    var xhr=new XMLHttpRequest();										// Ajax
		    xhr.open("GET",resp.downloadUrl);									// Set open url
		    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);		// Set header
		    xhr.onload = function()  {  callback(xhr.responseText);   };		// On load
		    xhr.send();															// Do it
		  	}
		});
}

Gdrive.prototype.CreateFolder=function(folderName, callback)				// CREATE NEW FOLDER ON G-DRIVE
{
	var _this=this;																// Save context
	var token=gapi.auth.getToken().access_token;								// Get access token

	var request=gapi.client.drive.files.list({									// Make request object
	  	q:"title='"+folderName+"' and mimeType='application/vnd.google-apps.folder' and trashed = false" // Look for name and folder mimetype
	 	});
	request.execute(function(resp) {											// Get data
  		if (resp.items.length) {												// If folder exists
  			_this.folderId=resp.items[0].id;									// Get folder's id									
 			callback(_this.folderId);											// Run callback with id
 			}
		else{																	// Need to create it
		 	var request2=gapi.client.request({									// Make request object
				path: "/drive/v2/files/",
				method: "POST",
		       	headers: {
		           	"Content-Type": "application/json",
		           	"Authorization": "Bearer "+token,             
		      		},
		       body:{
		           	title: folderName,
		          	mimeType: "application/vnd.google-apps.folder",
		  	     	}
		  	 	});
			request2.execute(function(resp) {									// Get data
		      	_this.folderId=resp.id;											// Save last id set
	 			callback(_this.folderId);										// Run callback with id
				});	
			}	
  		});

}

Gdrive.prototype.Upload=function(name, data, id, callback)					// UPLOAD DATA TO G-DRIVE
{
	const boundary = '-------314159265358979323846264';							// Bounds	
    const delimiter = "\r\n--" + boundary + "\r\n";								// Opener
    const close_delim = "\r\n--" + boundary + "--";								// Closer
	var metadata={ 																// Set metadata
		'title': name, 'mimeType': this.contentType, 							// Name and mimetype							
		parents:[{ id: this.folderId}]											// Folder to place it in
		};
	var base64Data=btoa(data); 													// Encode to base-64 Stringify if JSON
	var _this=this;																// Save context
	id=id ? "/"+id : "";														// Add id if set
    var multipartRequestBody =													// Multipart request
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + this.contentType + '\r\n' +							// Set content type
        'Content-Transfer-Encoding: base64\r\n' +								// Base 64
        '\r\n' +
        base64Data +															// Add metadate
        close_delim;															// Closer
    var request = gapi.client.request({											// Create request
        'path': '/upload/drive/v2/files'+id,									// Service
        'method': id ? 'PUT' : 'POST',											// Method based on update or create mode
   		'params': id ? {'uploadType': 'multipart', 'alt': 'json'} : {'uploadType': 'multipart'},
        'headers': {'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'},
        'body': multipartRequestBody});
  
   request.execute(function(arg) {												// Run request
       	_this.lastId=arg.id;													// Save last id set
      	_this.lastName=arg.title;												// Save last name set
      	callback(arg);															// Run callback
    	});
}

Gdrive.prototype.Picker=function(allFiles, callback)						// RUN G-DRIVE PICKER
{
	var _this=this;																// Save context
	LoadPicker(allFiles, function(s) {											// Load picker
		callback(s.url);
		});
	
 	function LoadPicker(allFiles, callback)									// LOAD G-DRIVE PICKER
	{
	  	var pickerApiLoaded=false;
		var oauthToken;
		gapi.load('auth', { 'callback': function() {
				window.gapi.auth.authorize( {
	              	'client_id': _this.clientId,
	             	'scope': [ _this.scope,],
	              	'immediate': false }, function(authResult) {
							if (authResult && !authResult.error) {
	          					oauthToken=authResult.access_token;
	          					createPicker();
	          					}
	          				});
				}
			});
		
		gapi.load('picker', {'callback': function() {
				pickerApiLoaded=true;
		        createPicker();
	    	   	}
			});
	
		function createPicker() {
	        if (pickerApiLoaded && oauthToken) {
	           	var view=new google.picker.DocsView().
	           		setOwnedByMe(allFiles).
	           		setParent(_this.folderId).
					setIncludeFolders(true);
	          	var picker=new google.picker.PickerBuilder().
	          		addView(view).
					setOAuthToken(oauthToken).
					setDeveloperKey(_this.key).
					setCallback(pickerCallback).
					setSelectableMimeTypes(_this.contentType).
					build();
				picker.setVisible(true);
	       		}
	    	}
	
		function pickerCallback(data) {
	        if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
         		var doc=data[google.picker.Response.DOCUMENTS][0];
	      		_this.lastId=doc.id;
		     	_this.lastName=doc.name;
	      		callback(doc)
	       		}
			}
	   
	}	// End closure
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

QDraw.prototype.SetCookie=function(cname, cvalue, exdays)				// SET COOKIE
{
	var d=new Date();
	d.setTime(d.getTime()+(exdays*24*60*60*1000));
	var expires = "expires="+d.toGMTString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

QDraw.prototype.GetCookie=function(cname) {								// GET COOKIE
	var name=cname+"=",c;
	var ca=document.cookie.split(';');
	for (var i=0;i<ca.length;i++)  {
	  c=ca[i].trim();
	  if (c.indexOf(name) == 0) 
	  	return c.substring(name.length,c.length);
	  }
	return "";
}

QDraw.prototype.GetTextBox=function (title, content, def, callback)		// GET TEXT LINE BOX
{
	$("#alertBoxDiv").remove();												// Remove any old ones
	$("body").append("<div class='unselectable' id='alertBoxDiv'></div>");														
	var str="<p><img src='img/shantilogo32.png' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span id='gtBoxTi'style='font-size:18px;text-shadow:1px 1px #ccc;color:#666'><b>"+title+"</b></span><p>";
	str+="<div style='font-size:14px;margin:14px'>"+content;
	str+="<p><input class='is' type='text' id='gtBoxTt' value='"+def+"'></p></div>";
	$("#alertBoxDiv").append(str);	
	$("#alertBoxDiv").dialog({ width:400, buttons: {
				            	"OK": 		function() { Sound("click");  callback($("#gtBoxTt").val()); $(this).remove(); },
				            	"Cancel":  	function() { Sound("delete"); $(this).remove(); }
								}});	
		
	$("#alertBoxDiv").dialog("option","position",{ my:"center", at:"center", of:this.parent });
	
	$("#gtBoxTt").on("change", function() {									// Handle change in text field (return)
		callback($(this).val()); 											// Run callback
		$("#alertBoxDiv").remove(); 										// Kill dialog
		});
}

QDraw.prototype.Dialog=function (title, content, width, callback, callback2) // DIALOG BOX
{
	$("#dialogDiv").remove();											// Remove any old ones
	$("body").append("<div class='unselectable' id='dialogDiv'></div>");														
	var str="<p><img src='img/shantilogo32.png' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span id='gtBoxTi'style='font-size:18px;text-shadow:1px 1px #ccc;color:#666'><b>"+title+"</b></span><p>";
	str+="<div style='font-size:14px;margin:14px'>"+content+"</div>";
	$("#dialogDiv").append(str);	
	$("#dialogDiv").dialog({ width:width, buttons: {
				            	"OK": 		function() { Sound("click"); if (callback)
				            								callback(); 
				            								$(this).remove();  
				            								},
				            	"Cancel":  	function() { Sound("delete"); if (callback2)	            		
				            								callback2();
				            								$(this).remove(); }
								}});	
	$("#dialogDiv").dialog("option","position",{ my:"center", at:"center", of:this.parent });
}

QDraw.prototype.ConfirmBox=function(content, callback)					// CONFIRMATION BOX
{
	$("body").append("<div class='unselectable' id='confirmBoxDiv'></div>");														
	var str="<p><img src='images/qlogo32.png' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span style='font-size:18px;text-shadow:1px 1px #ccc;color:#666'><b>Are you sure?</b></span><p>";
	str+="<div style='font-size:14px;margin:14px'>"+content+"</div>";
	$("#confirmBoxDiv").append(str);	
	$("#confirmBoxDiv").dialog({ width:400, buttons: {
				            	"Yes": function() { Sound("click"); $(this).remove(); callback() },
				            	"No":  function() { Sound("delete"); $(this).remove(); }
								}});	
	Sound("ding");															
	$("#confirmBoxDiv").dialog("option","position",{ my:"center", at:"center", of:this.parent });
}////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// QDRAW2.JS 
// Drawing guts
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

QDraw.prototype.GraphicsInit=function()									// INIT GRAPHICS
{
	var i;
	var _this=this;															// Context
	this.segs=[];															// Init segment list
	this.drawMode="";														// Current drawing mode
	this.drawX=0;	this.drawY=0;											// Last point drawn
	this.NS="http://www.w3.org/2000/svg";									// Name space
	this.svg=document.createElementNS(this.NS,"svg");						// Create SVG object
  	this.svg.setAttribute("id","Q-SVG");									// ID
   	this.svg.setAttribute("width","100%");									// Width
   	this.svg.setAttribute("height","100%");									// Height
 	
 	this.svg.addEventListener("click", function(e) { 						// ON CLICK
       		if (_this.drawMode && _this.drawMode.match(/newxy/)) 			// Drawing points
       			return;														// Quit
       		if (e.altKey) {													// Adding a point
       			_this.AddPointToSeg(e.clientX,e.clientY);					// Add point to first selected seg
       			return;														// Quit
       			}
      		if ((_this.curShape == 0) && (e.target.id == "Q-SVG"))			// If in container
				_this.DeselectSegs(),Sound("click");						// Deselect all segs
  			else if (e.target.id.substr(0,5) != "QSeg-")					// If not on seg
				_this.curShape=0;											// Pointer
			});
 
 	this.svg.addEventListener("mousemove", function(e) { 					// ON MOVE
 			var i,j,s,n,dx,dy;
 			var v=_this.drawMode.split("-");								// Get parts
  			_this.mx=e.clientX;		_this.my=e.clientY;						// Current pos
  			_this.ShowInfoBox();											// Show xy pos
     		if ((v[0] == "newxy") && (v[1] == 1))							// Rubbering to next point
				_this.Rubberband(v[2],_this.drawX,_this.drawY,e.clientX,e.clientY,e.shiftKey);	// Rubber band
  			else if ((v[0] == "ds") && (v[2] == 0)) {						// If full seg drag start
				_this.Do(true);												// Save temp seg as undo
				s=_this.segs[v[1]];											// Point at seg
				dy=e.clientY-s.y[0]-_this.mouseDY;							// Delta y to move
				dx=e.clientX-s.x[0]-_this.mouseDX;							// Delta x
				for (j=0;j<_this.segs.length;++j) {							// for each selected seg
					if (!_this.segs[j].select)								// Not selected
						continue;											// Skip it
					s=_this.segs[j];										// Point at seg
					n=s.x.length;											// Length of coords
					for (i=0;i<n;++i) {										// For each coord
						s.x[i]+=dx;											// Set x pos
						s.y[i]+=dy;											// Set Y pos
						if (_this.gridSnap) {								// If snapping
							s.x[i]-=s.x[i]%_this.gridSnap;					// Snap x								
							s.y[i]-=s.y[i]%_this.gridSnap;					// Snap y								
							}			
					_this.StyleSeg(j);										// Move it
					_this.AddWireframe(j);									// Redraw select
					}
				}
			}
			else if ((v[0] == "ds") && (v[2])) {							// If point seg drag start
				_this.Do(true);												// Save tempseg as undo
				var s=_this.segs[v[1]];										// Point at seg
				var x=e.clientX, y=e.clientY;								// Get current pos
				if (_this.gridSnap) {										// If snapping
					x-=x%_this.gridSnap;									// Snap x								
					y-=y%_this.gridSnap;									// Snap y								
					}			
				if (s.type < 3) {											// Box or circle
					if (e.shiftKey && (v[2] > 0)) {							// If snapping to 90 degrees
						var p=(v[2] == 1) ? v[2] : v[2]-2;					// Account for fist point
						dx=x-s.x[p];		dy=y-s.y[p];					// Make vector
						a=180-Math.atan2(dx,dy)*(180/Math.PI);				// Get angle from last
						if (a < 45)			x=s.x[p];						// Force vert
						else if (a < 135)	y=s.y[p];						// Force horz
						else if (a < 225)	x=s.x[p];						// Force vert
						else if (a < 315)	y=s.y[p];						// Force horz
						else				x=s.x[p];						// Force vert
						}
					s.x[v[2]-1]=x;			s.y[v[2]-1]=y;					// Set pos
					}
				if ((s.type == 3) || (s.type == 4)) {						// Box or circle
					s.x[v[2]-1]=x;			s.y[v[2]-1]=y;					// Set pos
					if (e.shiftKey)	{										// If shift key is down
						var w=Math.abs(s.x[1]-s.x[0]);						// Original wid
						var h=Math.abs(s.y[2]-s.y[1]);						// Original hgt
						if (v[2] == 1)		s.y[1]=s.y[0]=s.y[2]-w,s.x[3]=s.x[0];	// TL
						else if (v[2] == 2)	s.y[0]=s.y[1]=s.y[2]-w,s.x[2]=s.x[1];	// TR
						else if (v[2] == 3)	s.y[3]=s.y[2]=s.y[1]+w,s.x[1]=s.x[2];	// BR
						else if (v[2] == 4)	s.y[2]=s.y[3]=s.y[1]+w,s.x[0]=s.x[3];	// BL
						}
					else{
						if (v[2] == 1)		s.y[1]=s.y[0],s.x[3]=s.x[0];	// TL
						else if (v[2] == 2)	s.y[0]=s.y[1],s.x[2]=s.x[1];	// TR
						else if (v[2] == 3)	s.y[3]=s.y[2],s.x[1]=s.x[2];	// BR
						else if (v[2] == 4)	s.y[2]=s.y[3],s.x[0]=s.x[3];	// BL
						}
					}
				_this.StyleSeg(v[1]);										// Move it
				_this.AddWireframe(v[1]);									// Redraw select
	 			}
 	
 			});
 	 

 		this.svg.addEventListener("mousedown", function(e) {				// ON MOUSE DOWN
	 		var v=_this.drawMode.split("-");								// Get parts
     		if ((v[0] == "newxy") && (v[1] == 0)) {							// Drawing first point
				if ((v[2] == 1) || (v[2] == 2)) {							// Line / polygon
	    			_this.Do();												// Save undo
       				_this.segs.push({ type:v[2],col:_this.curCol,			// Add seg
     					ewid:_this.curEwid,ecol:_this.curEcol,
     					alpha:_this.curAlpha,drop:_this.curDrop,
     					select:false,etip:_this.curEtip,
     					curve:_this.curCurve,x:[],y:[]});
					_this.AddSeg(_this.segs.length-1);						// Add to SVG
					_this.StyleSeg(_this.segs.length-1);					// Set style
	   				}
				else if (v[2] == 5) {										// Text
					_this.GetTextBox("Type Text","","",function(txt) {		// Type name
		   				_this.Do();											// Save undo
		     			_this.drawMode="";									// Finished drawing
		       			_this.segs.push({ type:v[2],col:_this.curCol,		// Add seg
		     					tsiz:_this.curTsiz,tsty:_this.curTsty,
		     					alpha:_this.curAlpha,drop:_this.curDrop,
		     					select:false,tfon:_this.curTfon,text:txt,
		     					x:[e.clientX],y:[e.clientY]});
						_this.AddSeg(_this.segs.length-1);					// Add to SVG
						_this.StyleSeg(_this.segs.length-1);				// Set style
						Sound("ding");										// Ding
						});
					$("#Q-SVG").attr("cursor","default");					// Normal cursor
					return;
					}
          		_this.drawX=e.clientX;										// Save first coord X	
     			_this.drawY=e.clientY;										// Y
     			_this.drawMode="newxy-1-"+v[2]								// Change mode to drawing next point
 				}		
    		if (v[0] == "newxy") {											// Drawing any point
          		_this.drawX=e.clientX;										// Save first coord X	
     			_this.drawY=e.clientY;										// Y
     			_this.drawMode="newxy-1-"+v[2]								// Change mode to drawing next point
				}
			});
	
 		this.svg.addEventListener("mouseup", function(e) {					// ON MOUSE UP
	 		var v=_this.drawMode.split("-");								// Get parts
			var x1=_this.drawX,y1=_this.drawY;								// Last point
			var x2=e.clientX,y2=e.clientY;									// This point
			if (_this.gridSnap) {											// If snapping
				x1-=x1%_this.gridSnap;										// Snap x1								
				y1-=y1%_this.gridSnap;										// Y1								
				x2-=x2%_this.gridSnap;										// X2								
				y2-=y2%_this.gridSnap;										// Y2							
				}			
 			if ((v[0] == "newxy") && (v[1] == 1)) {							// Drawing next point(s)
	   			if ((v[2] == 1 || v[2] == 2)) {								// Line / polygon
       				var i=_this.segs.length-1;								// Point at seg
			 		if (e.shiftKey) {										// If snapping to 90 degrees
						var n=_this.segs[i].x.length-1;						// Point at last coord
						x1=_this.segs[i].x[n];								// Last coord x
						y1=_this.segs[i].y[n];								// Y
						dx=x2-x1;		dy=y2-y1;							// Make vector
						a=180-Math.atan2(dx,dy)*(180/Math.PI);				// Get angle from last
						if (a < 45)			x2=x1;							// Force vert
						else if (a < 135)	y2=y1;							// Force horz
						else if (a < 225)	x2=x1;							// Force vert
						else if (a < 315)	y2=y1;							// Force horz
						else				x2=x1;							// Force vert
						}
      				_this.segs[i].x.push(x2);								// Add x
      				_this.segs[i].y.push(y2);								// Y
  					_this.StyleSeg(i);										// Show new point
     				}
	   			else if ((v[2] == 3 || v[2] == 4)) {						// Box / circle
       				if (e.shiftKey)	y2=y1+Math.abs(x2-x1);					// Make it square/circle		
	   				_this.Do();												// Save undo
     				_this.Rubberband(0);									// Kill rubber box
     				_this.drawMode="";										// Finished drawing
       				_this.segs.push({ type:v[2],col:_this.curCol,			// Add seg
     					ewid:_this.curEwid,ecol:_this.curEcol,
     					alpha:_this.curAlpha,drop:_this.curDrop,
     					select:false,etip:_this.curEtip,
     					x:[x1,x2,x2,x1],y:[y1,y1,y2,y2]});
					_this.AddSeg(_this.segs.length-1);						// Add to SVG
					_this.StyleSeg(_this.segs.length-1);					// Set style
					$("#Q-SVG").attr("cursor","default");					// Crosshair cursor
					Sound("ding");											// Ding
     				}
     			}
	   		else if (v[0] == "ds")											// If dragging
 				_this.drawMode="de-"+v[1]+"-"+v[2];							// Set mode
			});

  	document.getElementById("containerDiv").appendChild(this.svg);			// Add to DOM
	$(this.svg).on("contextmenu", function() { return false; });			// Inhibit default right-click menu
	this.RefreshSVG();														// Refresh SVG space
	
	var c;	
 	for (i=0;i<4;i++) {
		c=i*30;
		this.segs[i]={ type:3,col:"#cccccc",ewid:1,ecol:"#990000",alpha:100,drop:0,select:false,
		x:[20+c,120+c,120+c,20+c],y:[50+c,50+c,250+c,250+c]}
		this.AddSeg(i);this.StyleSeg(i)
		}
	c+=30;
	this.segs[i]={ type:4,col:"#cccccc",ewid:1,ecol:"#000099",alpha:100,drop:0,select:false,
	x:[20+c,120+c,120+c,20+c],y:[50+c,50+c,150+c,150+c]}
	this.AddSeg(i);this.StyleSeg(i++);
	c+=30;
	this.segs[i]={ type:2,col:"#cccccc",ewid:1,ecol:"#990000",alpha:100,drop:0,select:false,curve:0,
	x:[20+c,120+c,120+c],y:[50+c,50+c,250+c]}
	this.AddSeg(i);this.StyleSeg(i++)
	c+=30;
	this.segs[i]={ type:1,col:"#cccccc",ewid:4,ecol:"#990000",alpha:100,drop:0,select:false,curve:0,
	x:[20+c,120+c,120+c],y:[50+c,50+c,250+c]}
	this.AddSeg(i);this.StyleSeg(i++)
	c+=30;
	this.segs[i]={ type:5,col:"#009900",tsiz:60,tsty:0,tfon:0,alpha:100,drop:0,select:false,text:"ABC",
	x:[20+c],y:[50+c]}
	this.AddSeg(i);this.StyleSeg(i++)
}

QDraw.prototype.RefreshSVG=function()									// REFRESH SVG 
{
	var i,n=this.segs.length;
 	this.tempSeg=null;														// Clear temp 
	$("#Q-SVG").empty();													// Remove all segs
	this.AddDropFilter("QdropFilterB","#000000",4);							// Add black SVG filter for drop shadows
	this.AddDropFilter("QdropFilterW","#ffffff",4);							// Add white 
	this.AddDropFilter("QdropFilterR","#ffffff",2);							// Add rubber 
	for (i=0;i<n;++i) {														// For each seg
		this.segs[i].svg=null;												// Clear so a new geg will be added
		this.AddSeg(i);														// Add it
		this.StyleSeg(i);													// Style it
		}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SEGS 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

QDraw.prototype.StyleSeg=function(segNum)								// STYLE SEGMENT 
{
	var s=this.segs[segNum];												// Point at seg data
	var o=s.svg;															// Point at SVG element
	if ((s.type < 3) && (s.x.length > 1)) {									// A line or polygon with at leaat 2 points

	if ((s.type == 1) && (s.etip > 0)) {									// If an arrow tip on a line											
		var aa;
		var hh=s.ewid*4;													// Set size
		var xx=[],yy=[];													// Arrow arrays
		o.childNodes[1].setAttribute("d","");								// Remove starting tip
		o.childNodes[2].setAttribute("d","");								// Remove ending tip
		if (s.etip&2) {														// A starting arrow
			aa=Math.atan2(s.y[0]-s.y[0+1],s.x[0]-s.x[0+1]);					// Angle of line
			xx[0]=s.x[0]-hh*Math.cos(aa-Math.PI/6),
			yy[0]=s.y[0]-hh*Math.sin(aa-Math.PI/6);			
			xx[1]=s.x[0];	yy[1]=s.y[0];									// Tip point
			xx[2]=s.x[0]-hh*Math.cos(aa+Math.PI/6),
			yy[2]=s.y[0]-hh*Math.sin(aa+Math.PI/6);			
	
			var str="M"+xx[0]+" "+yy[0];									// Start
		 	str+=" L"+xx[1]+" "+yy[1];										// Tip
		 	str+=" L"+xx[2]+" "+yy[2];										// End
		 	str+=" Z";														// End of arrow
			o.childNodes[1].setAttribute("d",str);							// Add starting tip
			o.childNodes[1].style.fill=s.col;								// Set fill color
			}
		if (s.etip&1) {														// An ending arrow
			var n=s.x.length-1;												// Last point
			aa=Math.atan2(s.y[n]-s.y[n-1],s.x[n]-s.x[n-1]);					// Angle of line
			xx[0]=s.x[n]-hh*Math.cos(aa-Math.PI/6),
			yy[0]=s.y[n]-hh*Math.sin(aa-Math.PI/6);			
			xx[1]=s.x[n];	yy[1]=s.y[n];									// Tip point
			xx[2]=s.x[n]-hh*Math.cos(aa+Math.PI/6),
			yy[2]=s.y[n]-hh*Math.sin(aa+Math.PI/6);			
			str="M"+xx[0]+" "+yy[0];										// Start
		 	str+=" L"+xx[1]+" "+yy[1];										// Tip
		 	str+=" L"+xx[2]+" "+yy[2];										// End
		 	str+=" Z";														// End of arrow arrow
			o.childNodes[2].setAttribute("d",str);							// Add  ending tip
			o.childNodes[2].style.fill=s.col;								// Set fill color
			}
		}
	
		var str="M"+s.x[0]+" "+s.y[0];										// Start
		if (s.curve > 0) {													// If curved
			var open=true;													// Assume open
			if ((Math.abs(s.x[0]-s.x[s.x.length-1]) < 3) && (Math.abs(s.y[0]-s.y[s.y.length-1]) < 3)) {
					s.x[x.length-1]=s.x[0];
					s.y[y.length-1]=s.y[0];
					open=false;
					}
				x=s.x[0]-0+((s.x[1]-s.x[0])/2)-0;
				y=s.y[0]-0+((s.y[1]-s.y[0])/2)-0;
				if (open) {
					str+="L"+x+",";											// Pos x
					str+=y+" ";												// Pos y
			 		}			
				for (j=1;j<s.x.length-1;++j) {								// For each coord
					x=s.x[j]-0+((s.x[j+1]-s.x[j])/2)-0;						// Mid x										
					y=s.y[j]-0+((s.y[j+1]-s.y[j])/2)-0;						// Mid y										
					str+="Q";												// Line to
					str+=s.x[j]+",";										// Pos x
					str+=s.y[j]+" ";										// Pos y
					str+=x+",";												// Control x
					str+=y+" ";												// Control y
					}
				if (open){													// If not closed
					str+="L"+s.x[j]+",";									// Pos x
					str+=s.y[j]+" ";										// Pos y
			 		}			
				}
			else{
				for (j=1;j<s.x.length;++j) {								// For each coord
					str+="L";												// Line to
					str+=s.x[j]+",";										// Pos x
					str+=s.y[j]+" ";										// Pos y
					}
				}
		if (s.type == 2)	str+=" Z";										// Close it if filled
		else				s.col="";
		if (s.type == 1)	o.childNodes[0].setAttribute("d",str);			// Add coords to line
		else				o.setAttribute("d",str);						// Add coords to polygon				
		}
	else if (s.type == "3") {												// A rect
		var tip=0;
		o.setAttribute("height",Math.abs(s.y[2]-s.y[0]));					// Height
		o.setAttribute("width",Math.abs(s.x[2]-s.x[0]));					// Width
		o.setAttribute("x",s.x[0]);											// X
		o.setAttribute("y",s.y[0]);											// Y
		if (s.etip == 1)													// If rounded
			tip=Math.abs(s.x[2]-s.x[0])/10;									// Set value based on size
		o.setAttribute("rx",tip);											// Set X radius
		o.setAttribute("ry",tip);											// Y
		}
	else if (s.type == "4") {												// An ellipse
		var w=Math.abs(s.x[2]-s.x[0])/2;	o.setAttribute("rx",w);			// Width
		var h=Math.abs(s.y[2]-s.y[0])/2;	o.setAttribute("ry",h);			// Height
		o.setAttribute("cx",s.x[0]+w);										// X
		o.setAttribute("cy",s.y[0]+h);										// Y
		}
	else if (s.type == "5") {												// Text
		var fam=["sans-serif","serif","courier"];							// Font
		o.setAttribute("x",s.x[0]);											// X
		o.setAttribute("y",s.y[0]);											// Y
		o.setAttribute("fill",s.col);										// Col
		o.setAttribute("font-size",s.tsiz);									// Size
		o.setAttribute("font-family",fam[s.tfon]);							// Font
		o.setAttribute("font-style",s.tsty&2 ? "italic" : "normal");		// Italics
		o.setAttribute("font-weight",s.tsty&1 ? "bold" : "normal");			// Bold
		$(o).css("user-select","none");										// No select
		$(o).text(s.text);													// Text
		}
	o.setAttribute("opacity",s.alpha/100);									// Opacity
	if (s.type != "5") {													// Text
		o.setAttribute("stroke-width",((s.type < 3)? s.ewid*2 : s.ewid)+"px");	// Stroke width (double for lines)
		if (s.col)		o.style.fill=s.col;									// Fill color
		else			o.style.fill="none";								// No fill	
		if (s.ecol)		o.style.stroke=s.ecol;  							// Stroke color
		else			o.style.stroke="none";								// No stroke	
		}
	if (s.drop == 1)														// White drop
		o.setAttribute("filter","url(#QdropFilterW)");						// Set white filter
	else if (s.drop == 2)													// Black drop
		o.setAttribute("filter","url(#QdropFilterB)");						// Set black filter
	else																	// No drop
		o.setAttribute("filter","");										// Remove filter
}


QDraw.prototype.SelectSeg=function(segNum, mode)						// SELECT A SEG
{
	var i,sel=0
	var s=this.segs[segNum];												// Point at seg data
	var n=this.segs.length;													// Number of segs
	s.select=0;																// Start with none
	if (mode) {																// If selecting
		for (i=0;i<n;++i) 													// For each other seg
			if (this.segs[i].select)	sel++;								// Add to count if selected
		this.numSelect=s.select=sel+1;										// Add this one too
		this.curAlpha=(s.alpha == undefined ) ? 100 : s.alpha;				// Alpha
		this.curCol=s.col;		this.curDrop=s.drop;						// Set parameters
		this.curEcol=s.ecol;	this.curEtip=s.etip;
		this.curTsiz=s.tsiz;	this.curTsty=s.tsty;
		this.curTfon=s.tfon;	this.curCurve=s.curve;	
		this.curText=s.text;	this.curEwid=s.ewid;
		}
	this.AddWireframe(segNum);												// Draw selected wireframe	
}


QDraw.prototype.AddPointToSeg=function(x, y)							// ADD POINT TO FIRST SELECTED SEG
{
	var i,a,b;
	var c={x:x,y:y}
	var n=this.segs.length;													// Number of segs
	this.Do();																// Set up for undo
	for (i=0;i<n;++i) {														// For each seg
		if (this.segs[i].select)											// If selected
			break;															// Stop looking
		}
	if (i == n)																// Didn't find one
		return;																// Quit
	if (this.segs[i].type > 2)												// Not a lone or polygon
		return;																// Quit
	var xs=this.segs[i].x;													// Point x data
	var ys=this.segs[i].y;													// Point i data
	for (i=0;i<xs.length-1;++i) {											// For each point
		a={ x:xs[i], y:ys[i] };												// First point
		b={ x:xs[i+1],y:ys[i+1] };											// Second point
		if (isBetween(a,b,c,10))											// See if its in this seg
			break;															// Quit looking
		}
	xs.splice(++i,0,x);														// Add x coord
	ys.splice(i,0,y);														// y 
	this.RefreshSVG();														// Remake SVG
	Sound("ding");															// Ding

	function isBetween(a, b, c, tolerance){
	  	//test if the point c is inside a pre-defined distance (tolerance) from the line
	    var distance = Math.abs((c.y - b.y)*a.x - (c.x - b.x)*a.y + c.x*b.y - c.y*b.x) / Math.sqrt(Math.pow((c.y-b.y),2) + Math.pow((c.x-b.x),2));
	    if (distance > tolerance){ return false; }
	    //test if the point c is between a and b
	    var dotproduct = (c.x - a.x) * (b.x - a.x) + (c.y - a.y)*(b.y - a.y)
	    if(dotproduct < 0){ return false; }
	    var squaredlengthba = (b.x - a.x)*(b.x - a.x) + (b.y - a.y)*(b.y - a.y);
	    if (dotproduct > squaredlengthba){ return false; }
	    return true;
		}
	}


QDraw.prototype.CalMiniMax=function(segNum)								// CALC MINIMAX OF SEG
{
	var i;
	var o={minx:999999,maxx:-999999,miny:999999,maxy:-999999};				// Default to extemes
	var xs=this.segs[segNum].x;												// Point at x coord	
	var ys=this.segs[segNum].y;												// Point at x coord	
	for (i=0;i<xs.length;++i) {												// For each coord	
		if (xs[i] < o.minx)	o.minx=xs[i];									// New minx
		if (ys[i] < o.miny)	o.miny=ys[i];									// New miny
		if (xs[i] > o.maxx)	o.maxx=xs[i];									// New maxx
		if (ys[i] > o.maxy)	o.maxy=ys[i];									// New maxy
		}
	if (this.segs[segNum].type == 5) {										// Text
		o.maxx=o.minx+this.segs[segNum].svg.getBBox().width;				// Text width
		o.miny=o.miny-(this.segs[segNum].svg.getBBox().height*.66);			// Text height, accomodating for accents
		o.maxy=o.miny+(this.segs[segNum].svg.getBBox().height*.66);			// Text height, accomodating for accents
		}
	o.dx=o.maxx-o.minx;														// Width	
	o.dy=o.maxy-o.miny;														// Height	
	o.cx=o.minx+(o.dx/2);													// Center x		
	o.cy=o.miny+(o.dy/2);													// Y	
	return(o);																// Return minimax object
}

QDraw.prototype.DeselectSegs=function()									// DESELECT ALL SEGS
{
	var i;
	var n=this.segs.length;													// Number of segs
	this.numSelect=0;														// Nothing selected
	for (i=0;i<n;++i) {														// For each seg
		this.segs[i].select=0;												// Unselect them
		$("#QWire-"+i).remove();											// Remove old one
		}
}

QDraw.prototype.ArrangeSegs=function(how)								// ARRANGE SEGS
{
	var i,first=-1;
	var tsegs=[];
	this.Do();																// Set up for undo
	for (i=0;i<this.segs.length;++i)										// For each seg
		if (this.segs[i].select) {											// If selected
			if (first < 0)	first=i;										// Set first selected seg index
			tsegs.push(JSON.parse(JSON.stringify(this.segs[i])));			// Unlink and copy seg to array
			this.segs.splice(i,1);											// Remove from seg list
			--i;															// Don't skip next one
			}
	
	tsegs.sort(function(a,b) { return a.select < b.select ? -1 : 1 } );		// Sort by select order
	switch(how) {
		case 1:																// To back
			for (i=0;i<tsegs.length;++i)									// For each selected seg
				this.segs.unshift(tsegs[i]);								// Add it back from the start
				break;
		case 2:																// Backward
			first--;														// Before
			for (i=0;i<tsegs.length;++i)									// For each selected seg
				this.segs.splice(first,0,tsegs[i]);							// Add it back from the start
				break;
		case 3:																// Forward
			first++;														// After
			for (i=0;i<tsegs.length;++i)									// For each selected seg
				this.segs.splice(first,0,tsegs[i]);							// Add it back from the start
				break;
		case 4:																// To front
			for (i=0;i<tsegs.length;++i)									// For each selected seg
				this.segs.push(tsegs[i]);									// Add it back from the end
				break;
		}
	this.RefreshSVG();														// Rebuild SVG
	for (i=0;i<this.segs.length;++i)										// For each seg
		if (this.segs[i].select) 											// If selected
			this.AddWireframe(i);											// Draw selected wireframe	
	Sound("ding");															// Ding
}

QDraw.prototype.AlignSegs=function(how)									// ALIGN OR DISTRIBUTE SELECTED SEGS
{
	var mins=[],sels=[];
	var i,j,k,l,first,dx,dy;
	var minx=999999,miny=999999,maxx=-999999,maxy=-999999;
	this.Do();																// Setup for undo
	for (i=0;i<this.segs.length;++i)										// For each seg
		if (this.segs[i].select) {											// If selected
			mins[i]=this.CalMiniMax(i);										// Get minimax
			sels.push({ ind: i, pos:mins[i]} );								// Add to list
			if (!first)	first=mins[i];										// Use first one as reference
			}
	if (how == 11)
		sels.sort(function(a,b) { return a.pos.minx < b.pos.minx ? -1 : 1 } );	// Sort left-right
	if (how == 12)
		sels.sort(function(a,b) { return a.pos.miny < b.pos.miny ? -1 : 1 } );	// Sort top-bottom
	var n=sels.length;
	if (how > 9) {															// Distribute
		var ox=0,oy=0,sel=0;
		for (j=0;j<n;++j) {													// For each selected seg
			i=sels[j].ind;													// Point at selected segment
			if (mins[i].minx < minx)	minx=mins[i].minx;					// New minx
			if (mins[i].miny < miny)	miny=mins[i].miny;					// New miny
			if (mins[i].maxx > maxx)	maxx=mins[i].maxx;					// New maxx
			if (mins[i].maxy > maxy)	maxy=mins[i].maxy;					// New maxy
			ox+=mins[i].dx;													// Add to overall width
			oy+=mins[i].dy;													// Add to overall height
			}
		ox=((maxx-minx)-ox)/Math.max(n-1,1);								// X space 
		oy=((maxy-miny)-oy)/Math.max(n-1,1);								// Y
		--n;																// Dont move last one
		}
	for (j=1;j<n;++j) {														// For each selected seg
		i=sels[j].ind;														// Point at selected segment
		l=sels[j-1].ind;													// Previous seg
		dx=dy=0;															// Assume no shift
		if (how == 1) 	  	dy=first.miny-mins[i].miny;						// Align top
		else if (how == 2) 	dy=first.cy-mins[i].cy;							// Middle
		else if (how == 3) 	dy=first.maxy-mins[i].maxy;						// Bottom
		else if (how == 4) 	dx=first.minx-mins[i].minx;						// Left
		else if (how == 5) 	dx=first.cx-mins[i].cx;							// Center
		else if (how == 6) 	dx=first.maxx-mins[i].maxx;						// Right
		else if (how == 11) dx=(mins[l].maxx+ox)-mins[i].minx;				// Distribute widths
		else if (how == 12) dy=(mins[l].maxy+oy)-mins[i].miny;				// Distribute heights
		
		for (k=0;k<this.segs[i].x.length;++k) {								// For each point
			this.segs[i].x[k]+=dx;											// Shift x
			this.segs[i].y[k]+=dy;											// Y
			}
		}	
	this.RefreshSVG();														// Rebuild SVG
	Sound("ding");															// Ding
}

QDraw.prototype.RefreshIds=function()									// UPDATE ALL SVG IDS TO MATCH SEG ORGER
{
	var i;
	var n=this.segs.length;													// Number of segs
	for (i=0;i<n;++i) 														// For each seg
		this.segs[i].svg.setAttribute("id","QSeg-"+i);						// Set id
}

QDraw.prototype.StyleSelectedSegs=function()							// STYLE SELECTED SEGS
{
	var i,s;
	var n=this.segs.length;													// Number of segs
	this.Do();																// Save an undo
	for (i=0;i<n;++i) 														// For each seg
		if (this.segs[i].select) {											// If selected
			s=this.segs[i];													// Point at seg
			s.col=this.curCol;		s.drop=this.curDrop;					// Set parameters
			s.alpha=this.curAlpha;	s.ewid=this.curEwid;
			s.ecol=this.curEcol;	s.etip=this.curEtip;
			s.tsiz=this.curTsiz;	s.tsty=this.curTsty;
			s.tfon=this.curTfon;	s.curve=this.curCurve;
			s.text=this.curText;
			this.StyleSeg(i);												// Style it
			this.changed=true;												// Set changed flag
			}
}

QDraw.prototype.AddWireframe=function(segNum, col)						// ADD WIREFRAME TO DRAWING
{
	var _this=this;															// Context
	$("#QWire-"+segNum).remove();											// Remove old one
	if (this.segs[segNum].select)	col="#3399ff";							// It's already selected, put blue wire up
	else if (!col)					return;									// Don't add any wireframe if no col spec'd
	var s=this.segs[segNum];												// Point at seg data
	var group=document.createElementNS(this.NS,"g");						// Create element
	this.svg.appendChild(group);											// Add element to DOM
	group.setAttribute("id","QWire-"+segNum);								// Id
	
	if (s.type < 3) {														// A l1ne or polygon
		var o=document.createElementNS(this.NS,"path");						// Create element
		group.appendChild(o);												// Add element to DOM
		var str="M"+s.x[0]+" "+s.y[0];										// Start
		if (s.curve > 0) {													// If curved
			var open=true;													// Assume open
			if ((Math.abs(s.x[0]-s.x[s.x.length-1]) < 3) && (Math.abs(s.y[0]-s.y[s.y.length-1]) < 3)) {
					s.x[x.length-1]=s.x[0];
					s.y[y.length-1]=s.y[0];
					open=false;
					}
				x=s.x[0]-0+((s.x[1]-s.x[0])/2)-0;
				y=s.y[0]-0+((s.y[1]-s.y[0])/2)-0;
				if (open) {
					str+="L"+x+",";											// Pos x
					str+=y+" ";												// Pos y
			 		}			
				for (j=1;j<s.x.length-1;++j) {								// For each coord
					x=s.x[j]-0+((s.x[j+1]-s.x[j])/2)-0;						// Mid x										
					y=s.y[j]-0+((s.y[j+1]-s.y[j])/2)-0;						// Mid y										
					str+="Q";												// Line to
					str+=s.x[j]+",";										// Pos x
					str+=s.y[j]+" ";										// Pos y
					str+=x+",";												// Control x
					str+=y+" ";												// Control y
					}
				if (open) {
					str+="L"+s.x[j]+",";									// Pos x
					str+=s.y[j]+" ";										// Pos y
			 		}			
				}
			else{
				for (j=1;j<s.x.length;++j) {								// For each coord
					str+="L";												// Line to
					str+=s.x[j]+",";										// Pos x
					str+=s.y[j]+" ";										// Pos y
					}
				}
		if (s.col && (s.col != "None"))	str+=" Z";							// Close it if filled
		o.setAttribute("d",str);											// Add coords
		o.style.fill="none";												// No fill	
		o.style.stroke=col;  												// No color 
		o.setAttribute("stroke-width","1px");								// Stroke width
		for (i=0;i<s.x.length;++i)											// For each coord
			AddDot(s.x[i],s.y[i],o,i+1);									// Add dot
		}
	else if (s.type == "3") {												// A rect
		var o=document.createElementNS(this.NS,"rect");						// Create element
		group.appendChild(o);												// Add element to DOM
		o.setAttribute("height",Math.abs(s.y[2]-s.y[0]));					// Height
		o.setAttribute("width",Math.abs(s.x[2]-s.x[0]));					// Width
		o.setAttribute("x",s.x[0]);											// X
		o.setAttribute("y", s.y[0]);										// Y
		o.style.fill="none";												// No fill	
		o.style.stroke=col;  												// No color 
		o.setAttribute("stroke-width","1px");								// Stroke width
		AddDot(s.x[0],s.y[0],o,1);											// Add dot
		AddDot(s.x[1],s.y[1],o,2);											// Add dot
		AddDot(s.x[2],s.y[2],o,3);											// Add dot
		AddDot(s.x[3],s.y[3],o,4);											// Add dot
		}
	else if (s.type == "4") {												// An ellipse
		var o=document.createElementNS(this.NS,"ellipse");					// Create element
		group.appendChild(o);												// Add element to DOM
		var w=Math.abs(s.x[2]-s.x[0])/2;	o.setAttribute("rx",w);			// Width
		var h=Math.abs(s.y[2]-s.y[0])/2;	o.setAttribute("ry",h);			// Height
		o.setAttribute("cx",s.x[0]+w);										// X
		o.setAttribute("cy",s.y[0]+h);										// Y
		o.style.fill="none";												// No fill	
		o.style.stroke=col;  												// No color 
		o.setAttribute("stroke-width","1px");								// Stroke width
		AddDot(s.x[0],s.y[0],o,1);											// Add dot
		AddDot(s.x[1],s.y[1],o,2);											// Add dot
		AddDot(s.x[2],s.y[2],o,3);											// Add dot
		AddDot(s.x[3],s.y[3],o,4);											// Add dot
		}
	else if (s.type == "5") {												// text
		var o=document.createElementNS(this.NS,"rect");						// Create element
		group.appendChild(o);												// Add element to DOM
		var w=s.svg.getBBox().width;										// Text width
		var h=s.svg.getBBox().height*.66;									// Account for accents
		o.setAttribute("height",h);											// Height
		o.setAttribute("width",w);											// Width
		o.setAttribute("x",s.x[0]);											// X
		o.setAttribute("y", s.y[0]-h);										// Y
		o.style.fill="none";												// No fill	
		o.style.stroke=col;  												// No color 
	}
	
	function AddDot(x, y, par, num) {
		var d=document.createElementNS(_this.NS,"rect");					// Create element
		group.appendChild(d);												// Add dot to group
		d.setAttribute("height",6);		d.setAttribute("width",6);			// Size
		d.setAttribute("x",x-3);		d.setAttribute("y",y-3);			// Pos		
		d.style.fill=col;													// Fill	
		d.setAttribute("id","QWireDot-"+segNum+"-"+num);					// Id
		d.setAttribute("cursor","alias");									// Set cursor
	
		d.addEventListener("mousedown", function(e) {						// ON MOUSE DOWN
			var vv=e.target.id.split("-");
			_this.tempSeg=JSON.parse(JSON.stringify(_this.segs));		// Unlink and copy segs
			if (e.ctrlKey && (_this.segs[vv[1]].type < 3) && (_this.segs[vv[1]].x.length > 2)) {	// If deleting point in line or polygon
				_this.Do();													// Set up for undo
				_this.segs[vv[1]].x.splice(vv[2]-1,1);						// Remove x coord
				_this.segs[vv[1]].y.splice(vv[2]-1,1);						// y 
				_this.RefreshSVG();											// Remake SVG
				Sound("delete");											// Delete
				return;														// Quit
				}			
			_this.drawMode="ds-"+vv[1]+"-"+num;								// Set mode
			_this.mouseX=e.clientX; _this.mouseX=e.clientY;					// Save clicked spot
			});
		}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DRAWING
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

QDraw.prototype.DrawShape=function(shape)								// BEGIN DRAWING
{
	if (!shape)																// If not a shape
		return;																// Quit
	this.drawMode="newxy-0-"+shape;											// Set mode
	this.pie.ShowPieMenu(false);											// Hide it
	this.curShape=shape;													// Set shape
	this.DrawMenu();														// Redraw dot
	Sound("click");															// Click
	$("#Q-SVG").attr("cursor","crosshair");									// Crosshair cursor
}


QDraw.prototype.Rubberband=function(shape, x1, y1, x2, y2, shift )		// DRAW RUBBER LINE/BOX/CIRCLE
{
	var o,dx,dy;
	$("#QRubber").remove();													// Remove old one
	if ((shape < 1) || (shape > 4)) 										// No rubber box needed
		return;																// Quit
	var h=Math.abs(y2-y1)/2;												// Calc height
	var w=Math.abs(x2-x1)/2;												// Width
	if (this.gridSnap) {													// If snapping
		x1-=x1%this.gridSnap;												// Snap x1								
		y1-=y1%this.gridSnap;												// Y1								
		x2-=x2%this.gridSnap;												// X2								
		y2-=y2%this.gridSnap;												// Y2							
		}			
	if (shape < 3) {														// Line
		if (shift) {														// If snapping to 90 degrees
			dx=x2-x1;		dy=y2-y1;										// Make vector
			a=180-Math.atan2(dx,dy)*(180/Math.PI);							// Get angle from last
			if (a < 45)			x2=x1+1;									// Force vert
			else if (a < 135)	y2=y1+1;									// Force horz
			else if (a < 225)	x2=x1+1;									// Force vert
			else if (a < 315)	y2=y1+1;									// Force horz
			else				x2=x1+1;									// Force vert
			}
		o=document.createElementNS(this.NS,"line");							// Create element
		o.setAttribute("x1",x1);											// X1
		o.setAttribute("y1",y1);											// Y1
		o.setAttribute("x2",x2);											// X2
		o.setAttribute("y2",y2);											// Y2
		}
	if (shape == 3) {														// Box
		if (shift)	h=w;													// Make it a square		
		o=document.createElementNS(this.NS,"rect");							// Create element
		o.setAttribute("height",h+h);										// Height
		o.setAttribute("width",w+w);										// Width
		o.setAttribute("x",x1);												// X
		o.setAttribute("y",y1);												// Y
		}
	else if (shape == 4) {													// Circle
		if (shift)	h=w;													// Make it a perfect circle		
		o=document.createElementNS(this.NS,"ellipse");						// Create element
		o.setAttribute("ry",h);												// Height
		o.setAttribute("rx",w);												// Width
		o.setAttribute("cx",x1+w);											// X
		o.setAttribute("cy",y1+h);											// Y
		}
	else if (shape == 5) {													// Text
		o=document.createElementNS(this.NS,"text");							// Create element
		o.setAttribute("height",h+h);										// Height
		o.setAttribute("width",w+w);										// Width
		o.setAttribute("x",x1);												// X
		o.setAttribute("y",y1);												// Y
		}
	this.svg.appendChild(o);												// Add element to DOM
	o.setAttribute("id","QRubber");											// Id
	o.style.fill="none";													// No fill	
	o.style.stroke="#3399ff";  												// Blue 
	o.setAttribute("stroke-width","2px");									// Stroke width
	o.setAttribute("filter","url(#QdropFilterR)");							// Set white filter
}

QDraw.prototype.AddDropFilter=function(id, col, spread)					// ADD DROPSHADOW SVG FILTER
{
   	var filter=document.createElementNS(this.NS,"filter");					// Create filter
   	filter.setAttribute("id",id);								
   	filter.setAttribute("width","200%");									
   	filter.setAttribute("height","200%");									
    var off=document.createElementNS(this.NS,"feOffset");					// Create feOffset
   	off.setAttribute("result","offOut");									
 	off.setAttribute("in","SourceGraphic");									
 	off.setAttribute("dx","1");			
 	off.setAttribute("dy","1");						
   	var blur=document.createElementNS(this.NS,"feGaussianBlur");			// Create feGaussianBlur
   	blur.setAttribute("result","blurOut");									
 	blur.setAttribute("in","matrixOut");									
 	blur.setAttribute("stdDeviation",spread);									
   	var blend=document.createElementNS(this.NS,"feBlend");					// Create feBlend
   	blend.setAttribute("in","SourceGraphic");									
 	blend.setAttribute("in2","blurOut");									
	blend.setAttribute("mode","normal");									
 	var mat=document.createElementNS(this.NS,"feColorMatrix");				// Create feColorMatrix
 	mat.setAttribute("in","offOut");									
 	mat.setAttribute("result","matrixOut");									
 	mat.setAttribute("type","matrix");									
 	if (col ==  "#ffffff")
 		mat.setAttribute("values","-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0");
 	else									
  		mat.setAttribute("values","0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0");
   
	var defs=document.getElementById("SVG-defs");							// Get defs container
   	if (!defs) {															// Not defined yet
   		defs=document.createElementNS(this.NS,"defs");						// Create defs container
		defs.setAttribute("id","SVG-defs");									// Set id
		defs=this.svg.appendChild(defs)										// Add defs to DOM
 		}
  	filter=defs.appendChild(filter)											// Add filter to defs
 	filter.appendChild(off);												// Add feoffset to filter
 	filter.appendChild(mat);												// Add feColorMatrix to filter
	filter.appendChild(blur);												// Add feGaussianBlur to filter
	filter.appendChild(blend);												// Add feBlend to filter
}

QDraw.prototype.AddSeg=function(segNum)									// ADD NEW SEGMENT TO DRAWING
{
	var i,o;
	var _this=this;															// Context
	var s=this.segs[segNum];												// Point at seg data
	if (!s.svg) {															// A new SVG object
		if (s.type == 1) {													// Line
			type="path";													// A path
			s.svg=document.createElementNS(this.NS,"g");					// Create group to hold line and tip(s)
			this.svg.appendChild(s.svg);									// Add element to DOM
			}
		else if (s.type == 2) 	type="path";								// An path
		else if (s.type == 3) 	type="rect";								// An rect
		else if (s.type == 4) 	type="ellipse";								// An ellipse
		else if (s.type == 5) 	type="text";								// An text
		if (s.type  == 1) {													// Line
			o=document.createElementNS(this.NS,type);						// Create element
			s.svg.appendChild(o);											// Add element to group
			o.setAttribute("id","QPth-"+segNum);							// Id
			o=document.createElementNS(this.NS,type);						// Create element for starting tip
			o.setAttribute("id","QTps-"+segNum);							// Id
			s.svg.appendChild(o);											// Add element to group
			o=document.createElementNS(this.NS,type);						// Create element for ending tip
			o.setAttribute("id","QTpe-"+segNum);							// Id
			s.svg.appendChild(o);											// Add element to group
			}
		else{
			s.svg=document.createElementNS(this.NS,type);					// Create element
			this.svg.appendChild(s.svg);									// Add element to DOM
			}
		s.svg.setAttribute("id","QSeg-"+segNum);							// Id
		s.svg.setAttribute("cursor","pointer");								// Hand cursor

		s.svg.addEventListener("mouseout", function(e)  { 					// Mouse out
				var s=e.target.id.substr(5);								// Get seg
				_this.AddWireframe(s); 
				});			

		s.svg.addEventListener("mouseover", function(e) { 					// ON MOUSE OVER
				var s=e.target.id.substr(5);								// Get seg
				if (_this.drawMode.substr(0,2) != "ds") 					// Not while dragging
					_this.AddWireframe(s,"#ff0000");						// Highlight it
				});	

		s.svg.addEventListener("contextmenu", function(e) { 				// ON RIGHT CLICK
				var i,w=_this.pie.ops.wid/2;								// Get width/2
				for (i=0;i<_this.segs.length;++i)							// For each seg
					if (_this.segs[i].select) {								// If selected
						_this.curShape=_this.segs[i].type;					// Set type
						break;												// Quit looking
						}
				var o=_this.CalMiniMax(i);									// Get minimax
				_this.pie.ops.segMode=true;									// Show seg menu
				_this.pie.ops.x=o.cx-w;										// Position x
				_this.pie.ops.y=o.cy-w;										// Y
				_this.pie.ShowPieMenu(!_this.pie.active);					// Toggle
				_this.DrawMenu();											// Draw dot
				});	
		
		s.svg.addEventListener("mousedown", function(e) { 					// ON MOUSE DOWN
				var segNum=e.target.id.substr(5);							// Get seg
				var s=_this.segs[segNum];									// Point at seg data
				if (e.shiftKey)												// If shift key is down
					_this.SelectSeg(segNum,true);							// Toggle selection state
				else{														// Multiple selection
					_this.DeselectSegs();									// Deselect segs
					_this.SelectSeg(segNum,true);							// Toggle selection state
					}
				_this.tempSeg=JSON.parse(JSON.stringify(_this.segs));		// Unlink and copy segs
				Sound("click");												// Click
				_this.AddWireframe(segNum);									// Draw selected wireframe	
				_this.drawMode="ds-"+segNum+"-0";							// Set mode to drag all
				_this.mouseX=e.clientX; _this.mouseY=e.clientY;				// Save clicked spot
				_this.mouseDX=e.clientX-s.x[0];								// Delta X from first point
				_this.mouseDY=e.clientY-s.y[0];								// DY
			});
		}
}

QDraw.prototype.EndDrawing=function()									// STOP DRAWING
{
	if (this.drawMode && this.drawMode.match(/newxy/)) {					// If needing to stop drawing
		this.drawMode="";													// Reset draw mode
		this.Rubberband(0);													// Kill rubber box
		Sound("click");														// Done
		$("#Q-SVG").attr("cursor","default");								// Normal cursor
		if (this.segs[this.segs.length-1].x.length < 2) {					// Invalid seg
			this.segs.pop();												// Remove it
			this.RefreshSVG();												// Remake svg
			}
		}
}

QDraw.prototype.RemoveLastPoint=function()								// REMOVE LAST POINT DRAWN
{
	if (this.drawMode && this.drawMode.match(/newxy/)) {					// If needing to stop drawing
		if (this.segs[this.segs.length-1].x.length > 1) {					// If something to delete
			Sound("delete");												// Delete soubd
			var i=this.segs.length-1;										// Last seg
			this.segs[i].x.pop();											// Remove x
			this.segs[i].y.pop();											// Y
			var j=this.segs[i].x.length-1;									// Last coord
			this.drawX=this.segs[i].x[j];									// Penultimate x
			this.drawY=this.segs[i].y[j];									// Y
			this.RefreshSVG();												// Remake svg
			}
		}
}

