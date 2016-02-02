(function() {
  'use strict';

  angular.module('foltmeter.module', []).directive('foltmeter', createDirective);

  createDirective.$inject = [];

  function createDirective() {
    return {
      restrict: 'A',
      scope: {
        foltmeter: '=',
        foltmeterValue: '=',
        foltmeterDuration: '='
      },
      link: link
    }
  }

  function link(scope, element, attrs) {
    scope.foltmeter.selector = element[0];

    var meter = new Foltmeter(scope.foltmeter);

    scope.$watch('foltmeter', function() {
      meter = new Foltmeter(scope.foltmeter);
      meter.set(scope.foltmeterValue, scope.foltmeterDuration);
    });

    scope.$watch('foltmeterValue', function(value) {
      if(value) {
        meter.set(value, scope.foltmeterDuration);
      }
    });
  }
})();