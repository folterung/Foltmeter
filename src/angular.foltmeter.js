(function() {
  'use strict';

  angular.module('foltmeter.module', []).directive('foltmeter', createDirective);

  function createDirective() {
    return {
      restrict: 'A',
      scope: {
        foltmeter: '='
      },
      link: link
    }
  }

  function link(scope, element, attrs) {
    scope.$watch('foltmeter', function(value) {
      console.log('', value);
    });
  }
})();