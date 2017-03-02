# skewt-js
Plot a skew-T log-P diagram based on sounding data.

## Example
See live at [Clube Icaro meteo](http://meteo.clubeicaro.pt/skewt.html)

## Dependencies
skewt-js requires [D3 JavaScript library](https://github.com/d3/d3).

```html
<script src="https://d3js.org/d3.v4.js"></script>
```

## How to use
Ensure a reference to both skewt.js and skewt.css files.

```html
<script src="https://d3js.org/d3.v4.js"></script>
```


## How it works

Ensure you create a div using a specified id (ex: id="skewt") or a specific css class.
It will act as the diagram placeholder.

```html
<div id="mySkewt"></div>
```

Declare a new SkewT var passing the css selector for the placeholder.

```html
<script>
	var skewt = new SkewT('#mySkewt');
</script>
```

SkewT only contains two methods:

#### Plot

.plot(array) will plot dew point and air temperature lines and wind barbs.

```javascript
  var skewt = new SkewT('#mySkewt');
  var sounding = [];
  skewt.plot(sounding);
```

Expected array format should follow the GSD Sounding Format.

```javascript
[{
		"press": 1000.0,  // pressure in whole millibars
		"hght": 173.0,    // height in meters (m)
		"temp": 14.1,     // temperature in degrees Celsius
		"dwpt": 6.5,      // dew point temperature in degree Celsius
		"wdir": 8.0,      // wind direction in degrees
		"wspd": 6.173     // wind speed in meters per second (m/s)
	}, {
		"press": 975.0,
		"hght": 386.0,
		"temp": 12.1,
		"dwpt": 5.6,
		"wdir": 10.0,
		"wspd": 7.716
	}, 
	...
]
```

#### Clear

.clear() will clear the previous plot lines and wind barbs.
