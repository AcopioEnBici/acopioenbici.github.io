'use strict';

angular.module('app')
    .directive('frontMenu', [
        function(){
            return {
                restrict: 'A',
                scope: true,
                transclude: true,
                templateUrl: 'partials/front-menu.html',
                link: function(scope, ele, attrs){
                    scope.active = attrs.active;
                    attrs.$observe('active', function() {
                        // @todo falta hacer esto funcionar
                        scope.active = attrs.active;
                    });
                }
            }
        }
    ]);