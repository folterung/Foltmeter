function Foltmeter(config) {
  var animationIndex;
  var arc;
  var currentMeterValue = 0;
  var direction;
  var duration;
  var el;
  var fillValue = 0;
  var group1;
  var group2;
  var height = config.height || 200;
  var maxValue = 0;
  var paths = [];
  var sortedPaths = [];
  var startIndex = 0;
  var svgDataMin = [];
  var svgDataMax = [];
  var svg;
  var targetMeterValue;
  var textNode;
  var textValue;
  var width = config.width || 200;

  function Foltmeter() {
    _checkD3();
    _checkValidConfig(config);

    var minPathValue = 0;
    var maxPathValue = 0;
    var newData = [];
    var foltmeter;

    config.data.map(function(data) {
      maxValue += data;
      newData.push([0, data]);
    });

    el = d3.select(config.selector);
    el.selectAll('svg').remove();
    arc = d3.svg.arc().innerRadius(config.radii[0]).outerRadius(config.radii[1]);
    svg = el.append('svg').attr('height', height).attr('width', width);

    group1 = svg.append('g').attr('transform', 'translate(' + width/2 + ',' + (height/2) + ')');
    group2 = svg.append('g').attr('transform', 'translate(' + width/2 + ',' + (height/2) + ')');

    if(config.showPercentage) {
      textNode = svg.append('text')
        .attr('style', 'font-size: 20px; color: #455A64;')
        .attr('dy', '20px')
        .text('0')
        .attr('text-anchor', 'middle')
        .attr('x', function() {
          return width/2 - this.getBBox().width+3;
        })
        .attr('y', function() {
          return height/2 - this.getBBox().height/2;
        });

      svg.append('text')
        .attr('style', 'font-size: 20px; color: #455A64;')
        .attr('dy', '20px')
        .text('%')
        .attr('text-anchor', 'middle')
        .attr('x', function() {
          return width/2 + this.getBBox().width;
        })
        .attr('y', function() {
          return height/2 - this.getBBox().height/2;
        });
    }

    group1.selectAll('path')
      .data(_createMaxDataset(config.ranges, newData))
      .enter()
      .append('path')
      .attr('fill', config.colors[0])
      .attr('d', arc)
      .each(function() {
        svgDataMax.push(this.getTotalLength());
      });

    group2.selectAll('path')
      .data(_createDataset(config.ranges, newData))
      .enter()
      .append('path')
      .attr('fill', config.colors[1])
      .attr('d', arc)
      .each(function(d, i) {
        this.__foltmeter__ = {
          data: newData[i],
          range: config.ranges[i]
        };

        this._current = d;
        svgDataMin.push(this.getTotalLength());

        paths.push(this);
      });

    paths.map(function(path, i) {
      foltmeter = path.__foltmeter__;

      minPathValue = (i === 0) ? 0 : svgDataMax[i-1];
      maxPathValue += svgDataMax[i] - svgDataMin[i];

      foltmeter.svgData = [svgDataMin[i], svgDataMax[i]];
      foltmeter.evalData = [minPathValue, maxPathValue];

      foltmeter.pointValue = (maxValue * ((svgDataMax[i] - svgDataMin[i]) / maxValue)) / foltmeter.data[1];
      foltmeter.minPointsAvailable = minPathValue * foltmeter.pointValue;
      foltmeter.maxPointsAvailable = foltmeter.pointValue * foltmeter.data[1];
    });

    this.element = el[0][0];
  }

  Foltmeter.prototype = {
    set: set
  };

  return new Foltmeter();

  function set(newValue, newDuration) {
    textValue = newValue;
    fillValue = newValue;
    duration = newDuration;
    targetMeterValue = 0;

    _setValues();
    _draw(newValue, duration);
  }

  function _arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);

    return function (t) {
      return arc(i(t));
    };
  }

  function _checkD3() {
    if(!window.d3)
      throw new Error('Foltmeter requires d3');
  }

  function _checkValidConfig(cfg) {
    if(
      Object.prototype.toString.call(cfg).indexOf('Object') === 1 ||
      typeof cfg.selector === 'undefined' ||
      typeof cfg.colors === 'undefined' ||
      typeof cfg.radii === 'undefined' ||
      typeof cfg.data === 'undefined'
    ) {
      throw new Error('Foltmeter requires a valid config object');
    }
  }

  function _createDataset(rangeSet, data) {
    var temp = [];
    var d;

    rangeSet.map(function(r, i) {
      d = data[i];
      temp.push(_singleValue(d[0], _rad(r[0]), _getPercentVal(d[0], d[1], r[0], r[1])));
    });

    return temp;
  }

  function _createMaxDataset(rangeSet, data) {
    var maxData = [];

    data.map(function(d) {
      maxData.push([d[1], d[1]]);
    });

    return _createDataset(rangeSet, maxData);
  }

  function _createSingleDataset(i) {
    var data = paths[i].__foltmeter__.data;
    var range = paths[i].__foltmeter__.range;

    return [_singleValue(data[0], _rad(range[0]), _getPercentVal(data[0], data[1], range[0], range[1]))];
  }

  function _draw() {
    var chunk = duration / config.ranges.length;
    var max = 0;
    var currentMax = 0;
    var textAnimationIndex = (animationIndex === 0) || (animationIndex === paths.length-1) ? paths.length - animationIndex : (paths.length - animationIndex) - 1;

    _updatePath(startIndex, false);

    if(config.showPercentage) {
      textNode
        .data([(textValue / maxValue * 100)])
        .transition()
        .duration(chunk * textAnimationIndex)
        .ease('linear')
        .tween('text', function(d) {
          var i = d3.interpolate(this.textContent, d);

          return function(t) {
            this.textContent = Math.round(i(t));
          };
        });
    }

    function _updatePath(i) {
      var pathNode;
      var pathData;

      if(!sortedPaths[i]) return;

      pathNode = sortedPaths[i][0][0];
      pathData = pathNode.__foltmeter__;
      currentMax += pathNode.getTotalLength() - pathData.svgData[0];
      max += pathData.svgData[1] - pathData.svgData[0];

      if(direction === 0 && (currentMax === max)) {
        _updatePath(_iterate(i));
        return;
      } else if(direction < 0 && (pathNode.getTotalLength() - pathData.svgData[0]) === 0) {
        _updatePath(_iterate(i));
        return;
      }

      sortedPaths[i]
        .data(_createSingleDataset(i))
        .transition()
        .duration(chunk)
        .ease('linear')
        .each('end', function() {
          _updatePath(_iterate(i));
        })
        .attrTween('d', _arcTween);
    }
  }

  function _getPercentVal(num1, num2, minDeg, maxDeg) {
    var percentage = num1/num2;
    var delta = Math.abs(minDeg - maxDeg);
    var degDiff = delta * percentage;
    var newDeg = minDeg + degDiff;

    if(percentage === 1 && (newDeg) !== maxDeg) {
      newDeg *= -1;
    }

    return _rad(newDeg);
  }

  function _iterate(i) {
    return (direction < 0) ? i-1 : i+1;
  }

  function _rad(deg) {
    return deg  * (Math.PI / 180);
  }

  function _setValues() {
    var max;

    paths.map(function(path) {
      var foltmeter = path.__foltmeter__;

      max = foltmeter.data[1];

    if(fillValue > max) {
        fillValue -= max;

        foltmeter.points = foltmeter.pointValue * max;
        foltmeter.data[0] = max;

        targetMeterValue += foltmeter.pointValue * foltmeter.data[0];
      } else {
        foltmeter.points = foltmeter.pointValue * fillValue;
        foltmeter.data[0] = fillValue;

        fillValue = 0;
        targetMeterValue += foltmeter.pointValue * foltmeter.data[0];
      }

    });

    _setCurrentMeterValue();
    _setDirection();
    _setStartIndex();
    _setOrder();
  }

  function _setCurrentMeterValue() {
    var meterValue = 0;
    var maxValue = 0;

    paths.map(function(path, i) {
      meterValue += path.getTotalLength() - path.__foltmeter__.svgData[0];
      maxValue += path.__foltmeter__.svgData[1] - path.__foltmeter__.svgData[0];
    });

    currentMeterValue = meterValue;
  }

  function _setDirection() {
    direction = (targetMeterValue < currentMeterValue) ? -1 : 0;
  }

  function _setOrder() {
    sortedPaths = [];

    config.ranges.map(function(r, i) {
      sortedPaths.push(group2.select('path:nth-child('+ (i+1) +')'));
    });

    startIndex = (this.direction < 0) ? ((sortedPaths.length) - animationIndex) : (0 + animationIndex);
  }

  function _setStartIndex() {
    var meterValue = currentMeterValue;
    var pathData;

    animationIndex = 0;

    for(var i = 0; i < paths.length; i++) {

      pathData = paths[i].__foltmeter__.evalData;

      if(((meterValue > pathData[0] && meterValue <= pathData[1]) || meterValue === 0)) {
        animationIndex = i;
        return;
      }
    }
  }

  function _singleValue(val, minRad, maxRad) {
    return {
      data: val,
      startAngle: minRad,
      endAngle: maxRad,
      value: val
    }
  }
}