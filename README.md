# Foltmeter
Meter using d3

##### Demo : [Check it out here!](http://folterung.github.io/Foltmeter/)

## Install
    bower install foltmeter
    
## Use in regular javascript application
```javascript
var foltmeter = new Foltmeter({
  selector: '#testTarget', //Selector for element to create the meter in
  colors: ['#CFD8DC', '#455A64'], //Background color and foreground color for the meter
  radii: [50, 60], //Inner radius and outer radius for the meter
  data: [100, 500, 1000], //Breakpoints for the meter e.g. 0-100 is first bar, 101-500 is second bar, 501-1000 is last bar
  ranges: [ //Start and end angles for each bar
    [-135, -130],
    [-128, -70],
    [-68, 135]
  ],
  height: 150, //(Optional) Height of svg element. Defauls to 200
  width: 150, //(Optional) Width of svg element. Defauls to 200
  showPercentage: false //(Optional) Show a percentage of meter total in the center of the meter
});

//To set a value simply call the set method and pass in a value and duration
foltmeter.set(600, 250); //Set the meter value to 600 over 250 milliseconds
```

## Use in AngularJS application
Load the angular.foltmeter.js file
```javascript
//Load the foltmeter.js file
//Then load the angular.foltmeter.js file
//Then include the foltmeter.module in your App's module
angular.module('App', ['foltmeter.module'])
  .controller('ExampleController', function($scope) {
    $scope.meterValue = 0;
    $scope.meterDuration= 250;
  
    $scope.meterConfig = {
    selector: '#testTarget', //Selector must still be provided as of now
      colors: ['#CFD8DC', '#455A64'], //Background color and foreground color for the meter
      radii: [50, 60], //Inner radius and outer radius for the meter
      data: [100, 500, 1000], //Breakpoints for the meter e.g. 0-100 is first bar, 101-500 is second bar, 501-1000 is last bar
      ranges: [ //Start and end angles for each bar
        [-135, -130],
        [-128, -70],
        [-68, 135]
      ],
      height: 150, //(Optional) Height of svg element. Defauls to 200
      width: 150, //(Optional) Width of svg element. Defauls to 200
      showPercentage: false //(Optional) Show a percentage of meter total in the center of the meter
    };
  });
```
```html
<!-- Creates the meter via an AngularJS directive -->
<div id="testTarget" ng-controller="ExampleController" foltmeter="meterConfig" foltmeter-value="meterValue" foltmeter-duration="meterDuration"></div>
```
