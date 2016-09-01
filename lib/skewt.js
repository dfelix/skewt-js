/**
 * SkewT v1.0.0
 * 2016 David Félix - dfelix@live.com.pt
 * 
 * Dependency:
 * d3.v3.min.js from https://d3js.org/
 * 
 */
var SkewT = function (div) {
	//build inner divs
	var skewtBox = document.createElement( 'div' );
	skewtBox.id = "skewtbox";
	div.appendChild(skewtBox);		
	//properties used in calculations
	var m = [30, 40, 20, 35];
	var w = 700 - m[1] - m[3];
	var h = 700 - m[0] - m[2];
	var deg2rad = (Math.PI/180);
	var tan = Math.tan(55*deg2rad);
	var basep = 1050;
	var topp = 100;
	var plines = [1000,850,700,500,300,200,100];
	var pticks = [950,900,800,750,650,600,550,450,400,350,250,150];
	var barbsize = 25;
	// functions for Scales and axes. Note the inverted domain for the y-scale: bigger is up!
	var x = d3.scale.linear().range([0, w]).domain([-45,50]);
	var y = d3.scale.log().range([0, h]).domain([topp, basep]);
	var r = d3.scale.linear().range([0,300]).domain([0,150]);
	var y2 = d3.scale.linear();
	var xAxis = d3.svg.axis().scale(x).tickSize(0,0).ticks(10).orient("bottom");
	var yAxis = d3.svg.axis().scale(y).tickSize(0,0).tickValues(plines).tickFormat(d3.format(".0d")).orient("left");
	var yAxis2 = d3.svg.axis().scale(y).tickSize(5,0).tickValues(pticks).orient("right");
	// various path generators
	var templine = d3.svg.line().interpolate("linear").x(function(d,i) { return x(d.temp) + (y(basep)-y(d.press))/tan; }).y(function(d,i) { return y(d.press); });
	var tempdewline = d3.svg.line().interpolate("linear").x(function(d,i) { return x(d.dwpt) + (y(basep)-y(d.press))/tan; }).y(function(d,i) { return y(d.press); });
	// bisector function for tooltips    
	var bisectTemp = d3.bisector(function(d) { return d.press; }).left;
	// create svg container for sounding
	var svgContainer = d3.select("div#skewtbox").append("svg")
		.attr("width", w + m[1] + m[3])
		.attr("height", h + m[0] + m[2])      
		.append("g")
		.attr("transform", "translate(" + m[3] + "," + m[0] + ")");

	var skewtgroup = svgContainer.append("g").attr("class", "skewt"); // put skewt lines in this group
	var barbgroup  = svgContainer.append("g").attr("class", "windbarb"); // put barbs in this group	

	//local functions		
	var drawBackground = function() {
		var svg = d3.select("div#skewtbox svg g").append("g").attr("class", "skewtbg");
		var dryline = d3.svg.line()
			.interpolate("linear")
			.x(function(d,i) { return x( ( 273.15 + d ) / Math.pow( (1000/pp[i]), 0.286) -273.15) + (y(basep)-y(pp[i]))/tan;})
			.y(function(d,i) { return y(pp[i])} );
		
		// Add clipping path
		svg.append("clipPath")
		.attr("id", "clipper")
		.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", w)
		.attr("height", h);

		// Skewed temperature lines
		svg.selectAll("templine")
		.data(d3.range(-100,45,10))
		.enter().append("line")
		.attr("x1", function(d) { return x(d)-0.5 + (y(basep)-y(100))/tan; })
		.attr("x2", function(d) { return x(d)-0.5; })
		.attr("y1", 0)
		.attr("y2", h)
		.attr("class", function(d) { if (d == 0) { return "tempzero"; } else { return "gridline"}})
		.attr("clip-path", "url(#clipper)");
		//.attr("transform", "translate(0," + h + ") skewX(-30)");
		
		// Logarithmic pressure lines
		svg.selectAll("pressureline")
		.data(plines)
		.enter().append("line")
		.attr("x1", 0)
		.attr("x2", w)
		.attr("y1", function(d) { return y(d); })
		.attr("y2", function(d) { return y(d); })
		.attr("class", "gridline");

		// create array to plot dry adiabats
		var pp = d3.range(topp,basep+1,10);
		var dryad = d3.range(-30,240,20);
		var all = [];
		for (var i=0; i<dryad.length; i++) { 
			var z = [];
			for (var j=0; j<pp.length; j++) { z.push(dryad[i]); }
				all.push(z);
		}

		// Draw dry adiabats
		svg.selectAll("dryadiabatline")
		.data(all)
		.enter().append("path")
		.attr("class", "gridline")
		.attr("clip-path", "url(#clipper)")
		.attr("d", dryline);

		// Line along right edge of plot
		svg.append("line")
		.attr("x1", w-0.5)
		.attr("x2", w-0.5)
		.attr("y1", 0)
		.attr("y2", h)
		.attr("class", "gridline");

		// Add axes
		svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + (h-0.5) + ")").call(xAxis);
		svg.append("g").attr("class", "y axis").attr("transform", "translate(-0.5,0)").call(yAxis);
		svg.append("g").attr("class", "y axis ticks").attr("transform", "translate(-0.5,0)").call(yAxis2);		
	}
	
	var makeBarbTemplates = function(){
		var speeds = d3.range(5,105,5);
		var barbdef = svgContainer.append('defs')
		speeds.forEach(function(d) {
			var thisbarb = barbdef.append('g').attr('id', 'barb'+d);
			var flags = Math.floor(d/50);
			var pennants = Math.floor((d - flags*50)/10);
			var halfpennants = Math.floor((d - flags*50 - pennants*10)/5);
			var px = barbsize;
			// Draw wind barb stems
			thisbarb.append("line").attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", barbsize);
			// Draw wind barb flags and pennants for each stem
			for (var i=0; i<flags; i++) {
				thisbarb.append("polyline")
					.attr("points", "0,"+px+" -10,"+(px)+" 0,"+(px-4))
					.attr("class", "flag");
				px -= 7;
			}
			// Draw pennants on each barb
			for (i=0; i<pennants; i++) {
				thisbarb.append("line")
					.attr("x1", 0)
					.attr("x2", -10)
					.attr("y1", px)
					.attr("y2", px+4)
				px -= 3;
			}
			// Draw half-pennants on each barb
			for (i=0; i<halfpennants; i++) {
				thisbarb.append("line")
					.attr("x1", 0)
					.attr("x2", -5)
					.attr("y1", px)
					.attr("y2", px+2)
				px -= 3;
			}
		});		
	}
	
	var drawToolTips = function(skewtlines) {
		var lines = skewtlines.reverse();
		// Draw tooltips
		var tmpcfocus = skewtgroup.append("g").attr("class", "focus tmpc").style("display", "none");
		tmpcfocus.append("circle").attr("r", 4);
		tmpcfocus.append("text").attr("x", 9).attr("dy", ".35em");
		  
		var dwpcfocus = skewtgroup.append("g").attr("class", "focus dwpc").style("display", "none");
		dwpcfocus.append("circle").attr("r", 4);
		dwpcfocus.append("text").attr("x", -9).attr("text-anchor", "end").attr("dy", ".35em");

		var hghtfocus = skewtgroup.append("g").attr("class", "focus").style("display", "none");
		hghtfocus.append("text").attr("x", 0).attr("text-anchor", "start").attr("dy", ".35em");

		var wspdfocus = skewtgroup.append("g").attr("class", "focus windspeed").style("display", "none");
		wspdfocus.append("text").attr("x", 0).attr("text-anchor", "start").attr("dy", ".35em");	  

		svgContainer.append("rect")
			.attr("class", "overlay")
			.attr("width", w)
			.attr("height", h)
			.on("mouseover", function() { tmpcfocus.style("display", null); dwpcfocus.style("display", null); hghtfocus.style("display", null); wspdfocus.style("display", null);})
			.on("mouseout", function() { tmpcfocus.style("display", "none"); dwpcfocus.style("display", "none"); hghtfocus.style("display", "none"); wspdfocus.style("display", "none");})
			.on("mousemove", function () {		  
				var y0 = y.invert(d3.mouse(this)[1]); // get y value of mouse pointer in pressure space
				var i = bisectTemp(lines, y0, 1, lines.length-1);
				var d0 = lines[i - 1];
				var d1 = lines[i];
				var d = y0 - d0.press > d1.press - y0 ? d1 : d0;
				tmpcfocus.attr("transform", "translate(" + (x(d.temp) + (y(basep)-y(d.press))/tan)+ "," + y(d.press) + ")");
				dwpcfocus.attr("transform", "translate(" + (x(d.dwpt) + (y(basep)-y(d.press))/tan)+ "," + y(d.press) + ")");
				hghtfocus.attr("transform", "translate(0," + y(d.press) + ")");
				tmpcfocus.select("text").text(Math.round(d.temp)+"°C");
				dwpcfocus.select("text").text(Math.round(d.dwpt)+"°C");
				//hghtfocus.select("text").text("--"+(Math.round(d.hghtagl/100)/10)+"km");
				hghtfocus.select("text").text("-- "+Math.round(d.hght)+" m"); 	//hgt or hghtagl ???
				wspdfocus.attr("transform", "translate(555," + y(d.press) + ")"); //628
				wspdfocus.select("text").text(Math.round(mstokt(d.wspd)*10)/10 + " kts");
			});
	}
	
	var plot = function(s){
		//skew-t stuff
		skewtgroup.selectAll("path").remove(); //clear previous paths from skew
		var skewtline = s.filter(function(d) { return (d.temp > -1000 && d.dwpt > -1000); });
		var skewtlines = [];
		skewtlines.push(skewtline);
		
		var tempLines = skewtgroup.selectAll("templines")
			.data(skewtlines).enter().append("path")
			.attr("class", function(d,i) { return (i<10) ? "temp member" : "temp mean" })
			.attr("clip-path", "url(#clipper)")
			.attr("d", templine);

		var tempDewlines = skewtgroup.selectAll("tempdewlines")
			.data(skewtlines).enter().append("path")
			.attr("class", function(d,i) { return (i<10) ? "dwpt member" : "dwpt mean" })
			.attr("clip-path", "url(#clipper)")
			.attr("d", tempdewline);

		//barbs stuff
		barbgroup.selectAll("use").remove(); //clear previous paths  from barbs
		var barbs = skewtline.filter(function(d) { return (d.wdir >= 0 && d.wspd >= 0 && d.press >= topp); });
		var allbarbs = barbgroup.selectAll("barbs")
			.data(barbs).enter().append("use")
			.attr("xlink:href", function (d) { return "#barb"+Math.round(mstokt(d.wspd)/5)*5; }) // 0,5,10,15,...
			.attr("transform", function(d,i) { return "translate("+w+","+y(d.press)+") rotate("+(d.wdir+180)+")"; });			

		//mouse over
		drawToolTips(skewtlines[0]);
	}

	var clear = function(s){
		skewtgroup.selectAll("path").remove(); //clear previous paths from skew
		barbgroup.selectAll("use").remove(); //clear previous paths  from barbs
		//must clear tooltips!
		svgContainer.append("rect")
			.attr("class", "overlay")
			.attr("width", w)
			.attr("height", h)
			.on("mouseover", function(){ return false;})
			.on("mouseout", function() { return false;})
			.on("mousemove",function() { return false;});
	}
	
	var mstokt= function(ms) { return ms*1.943844492;}
	var mstokmh= function(ms) { return ms*3.6;}
	
	//assings functions as public methods
	this.drawBackground = drawBackground;
	this.plot = plot;
	this.clear = clear;
	
	//executes local 
    drawBackground();
	makeBarbTemplates();
};

