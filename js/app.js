/**
 * Proyecto: Acopio en Bici
 * Fecha:    19/sept/2017
 * Autores:   edgardo@tu-desarrollo.com // pongan aca sus nombres, nicks o correos porfa :D
 */

'use strict';

angular.module('app', [
    'ngAnimate',
    'ngSanitize',
    'ngMessages',
    'ngMap',
    'firebase',
    'ui.router',
    'ngMaterial',
    'ngStorage',
    'ngAria',
    'lfNgMdFileInput',
    'textAngular',
    'md.data.table',
    'slugifier',
    'angularMoment'
]);

'use strict';

angular.module("app")
    .config([
        "$mdThemingProvider",
        "$logProvider",
        "$locationProvider",
        function($mdThemingProvider, $logProvider, $locationProvider){
            $logProvider.debugEnabled(true);
            $locationProvider.html5Mode(false);
            
            $mdThemingProvider.theme('red')
                .primaryPalette('red')
                .accentPalette('orange');

            $mdThemingProvider.theme('default')
                .primaryPalette('blue')
                .accentPalette('indigo'); 
    }])
'use strict';

angular.module("app")
    .constant('loginRedirectPath', 'admin.login')
    .constant('allowedOfflineStates', ['404','admin.login','admin.register','home','donate','deliver','admin.logout','chooseDonation','chooseCenter'])
    .constant('adminStates', ['admin.volunteers','admin.donations'])
    .constant('volunteerStates', ['donate','deliver','chooseDonation','chooseCenter'])
    .constant('FB_CONFIG', {
        apiKey: "AIzaSyDR-aACSORClSwkE0CcZs8aAmKawIKDYH8",
        authDomain: "acopio-en-bici.firebaseapp.com",
        databaseURL: "https://acopio-en-bici.firebaseio.com",
        projectId: "acopio-en-bici",
        storageBucket: "acopio-en-bici.appspot.com",
        messagingSenderId: "669726958713"
    });
'use strict';

angular.module("app")
    .config([
        "$stateProvider",
        "$urlRouterProvider",
        function($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('home', {
                    url: '/inicio',
                    templateUrl: 'partials/home/index.html',
                    controller: 'HomeCtrl'
                })
                .state('donate', {
                    url: '/donar',
                    templateUrl: 'partials/home/donate.html',
                    controller: 'DonateCtrl'
                })
                .state('deliver', {
                    url: '/entregar',
                    templateUrl: 'partials/home/volunteer.html',
                    controller: 'VolunteerCtrl'
                })
                .state('chooseDonation', {
                    url: '/selecciona-donacion',
                    templateUrl: 'partials/home/1-choose-donation.html',
                    controller: 'ChooseDonationCtrl'
                })
                .state('chooseCenter', {
                    url: '/selecciona-centro-de-acopio',
                    templateUrl: 'partials/home/2-choose-center.html',
                    controller: 'ChooseCenterCtrl'
                })
                .state('admin', {
                    url: '/admin',
                    templateUrl: 'partials/admin/index.html',
                    controller: 'AdminCtrl'
                })
                .state('admin.login', {
                    url: '/login',
                    templateUrl: 'partials/admin/login.html',
                    controller: 'AdminLoginCtrl'
                })
                .state('admin.donations', {
                    url: '/donaciones',
                    templateUrl: 'partials/admin/donations.html',
                    controller: 'AdminDonationsCtrl'
                })
                .state('admin.volunteers', {
                    url: '/voluntarios',
                    templateUrl: 'partials/admin/volunteers.html',
                    controller: 'AdminVolunteersCtrl'
                })
                .state('admin.centers', {
                    url: '/centros-de-acopio',
                    templateUrl: 'partials/admin/centers.html',
                    controller: 'AdminCentersCtrl'
                })
                .state('admin.main', {
                    url: '/main',
                    templateUrl: 'partials/admin/main.html',
                    controller: 'AdminMainCtrl'
                })
                .state('admin.logout', {
                    url: '/logout',
                    templateUrl: 'partials/admin/logout.html',
                    controller: 'AdminLogoutCtrl'
                })
                .state('admin.register', {
                    url: '/registro',
                    templateUrl: 'partials/admin/register.html',
                    controller: 'AdminRegisterCtrl'
                })
                .state('404', {
                    url: '/404',
                    templateUrl: '404.html'
                })
              
                // cruds
                // .state('admin.cruds', {
                //     url: '/cruds',
                //     templateUrl: 'partials/admin/cruds.html',
                //     controller: 'CrudsCtrl'
                // })

            $urlRouterProvider.otherwise('/404');
        }
    ]);

'use strict';

angular.module("app")
    .run([
        "$rootScope",
        "$state",
        "$log",
        "$location",
        "$localStorage",
        "$timeout",
        "FB_CONFIG",
        "allowedOfflineStates",
        "adminStates",
        "loginRedirectPath",
        "AppF",
        "$firebaseObject",
        function($rootScope, $state, $log, $location, $localStorage, $timeout, config, states, adminStates, loginRedirectPath, F, $firebaseObject) {
            firebase.initializeApp(config);

            F.auth = firebase.auth();
            // watch for login status changes and redirect if appropriate
            F.auth.onAuthStateChanged(check);

            $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
                if (!F.user) {
                    if (!isPermitted(toState.name)) {
                        $log.debug(F.user, loginRedirectPath, $state.current.name, "YES");
                        $localStorage.lastPage = toState.name;
                        $state.go(loginRedirectPath);
                        e.preventDefault();
                    } 
                } else {
                    checkAdmin(toState.name, e);
                }
            });

            var checkAdmin = function(route, e){
                if(isAdmin(route)){
                    console.log(F.auth, "AUTH")
                    if(F.user.providerData[0].providerId == 'twitter.com'){
                        $state.go('home');
                        $log.error('No tienes permiso para entrar a esta ruta')
                        e.preventDefault();
                    }
                }
            }

            $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
                // We can catch the error thrown when the $requireSignIn promise is rejected
            
                // and redirect the user back to the home page
                if (error === "AUTH_REQUIRED") {
                  $state.go("home");
                }
            });
            var c = 1;
            function check(user) {
                c++
                $log.debug(user, c);
                F.user = user;
                if (angular.isObject(user)) {
                    // $rootScope.F = F;
                    if(F.user.providerData){
                        if(F.user.providerData[0].providerId == 'twitter.com'){
                            firebase.database().ref('/volunteers').child(user.uid).once('value', function(snap){
                                var profile = snap.val();
                                if(profile) F.userProfile = profile;
                            });
                        }
                    }
                    // User signed in!
                    $rootScope.$broadcast('loggedIn', true);
                } else {
                    if (!isPermitted($state.current.name)) {
                        $state.go(loginRedirectPath);
                    }
                    $log.debug(user, loginRedirectPath, $state.current, "User Not Logged");
                }
            }

            function isPermitted(route) {
                var isPermitted = (states.indexOf(route) !== -1);
                if (!route) {
                    isPermitted = true;
                }
                return isPermitted;
            }

            function isAdmin(route){
                var isAdmin = (adminStates.indexOf(route) !== -1);
                if(!route){
                    isPermitted = true;
                }
                return isAdmin;
            }
        }
    ]);
'use strict';

angular.module('app')
    .controller('AdminCentersCtrl', [
        "$rootScope",
        "$scope",
        "errAlertS",
        "successAlertS",
        "$firebaseArray",
        "AppF",
        "$log",
        function($rootScope, $scope, errAlertS, successAlertS, $firebaseArray, F, $log) {
            var initiated = false;
            var root = firebase.database().ref("/");
            $scope.centers = [];
            $scope.currentPage = 1;
            $scope.selected = [];

            var init = function() {
                initiated = true;
                $scope.centers = $firebaseArray(root.child('centers'));
                $log.debug('Donation Ctrl initiated');
            }

            $scope.save = function(center){
                $log.debug('saving', center);
                center.updatedAt = moment().valueOf();
                center.updatedBy = F.user.uid;
                $scope.centers.$save(center).then(function(){
                    successAlertS('Se guardó registro');
                }, errAlertS);
            }

            $scope.activate = function(center){
                $log.debug('activate', center);
                center.active = true;
                $scope.save(center);
            }

            $scope.deactivate = function(center){
                $log.debug('deactivate', center);
                center.active = false;
                $scope.save(center);
            }

            $scope.remove = function(center){
                $log.debug("removing: ", center);
                return $scope.centers.$remove(center);
            }

            $scope.showRemoveDialog = function(ev){
                $mdDialog.show(
                    $mdDialog.confirm({
                        onComplete: function afterShowAnimation() {
                            var $dialog = angular.element(document.querySelector('md-dialog'));
                            var $actionsSection = $dialog.find('md-dialog-actions');
                            var $cancelButton = $actionsSection.children()[0];
                            var $confirmButton = $actionsSection.children()[1];
                            angular.element($confirmButton).addClass('md-raised md-warn');
                            angular.element($cancelButton).addClass('md-raised');
                        }
                    })
                    .title('Remover ' + $scope.selected.length + ' centros de acopio?')
                    .textContent('No podrá recuperar los datos')
                    .ariaLabel('Lucky day')
                    .targetEvent(event)
                    .ok('Eliminar')
                    .cancel('Cancelar')
                ).then(function() {
                    var count = 0;
                    $log.debug("Deleting: ", $scope.selected);
                    angular.forEach($scope.selected, function(record) {
                        $scope.remove(record).then(function() {
                            if (count == $scope.selected.length) {
                                successAlert("Se borraron " + count + " centros de acopio");
                                $scope.selected = [];
                            }
                        });
                    });
                });
            }

            $rootScope.$on('loggedIn', function(event, logged) {
                $log.debug(logged, "loggedIn?")
                if (logged && !initiated) init();
            });

            if (F.user && !initiated) {
                init();
            }
        }
    ]);
'use strict';

angular.module('app')
    .controller('AdminCtrl', [
        "$rootScope",
        "$scope",
        "$firebaseObject",
        "$firebaseArray",
        "$state",
        "$log",
        "AppF",
        function($rootScope, $scope, $firebaseObject, $firebaseArray, $state, $log, F) {
            var initiated = false;
            var init = function() {
                var root = firebase.database().ref("/");
                $log.debug("AdminCtrl Loaded");
                F.inModule = 'admin';
            }

            $rootScope.$on('loggedIn', function(event, logged) {
                $log.debug(logged, "loggedIn?")
                if (logged) init();
            });

            if (F.user && !initiated) {
                init();
            }
        }
    ]);
'use strict';

angular.module('app')
    .controller('AdminDonationsCtrl', [
        "$rootScope",
        "$scope",
        "errAlertS",
        "successAlertS",
        "$firebaseArray",
        "AppF",
        "$log",
        "$mdDialog",
        function($rootScope, $scope, errAlertS, successAlertS, $firebaseArray, F, $log, $mdDialog) {
            var initiated = false;
            var root = firebase.database().ref("/");
            $scope.donations = [];
            $scope.currentPage = 1;
            $scope.selected = [];

            var init = function() {
                initiated = true;
                // .orderByChild('pickedUp').equalTo(false) 
                $scope.donations = $firebaseArray(root.child('donations'));
                $log.debug('Donation Ctrl initiated');
            }

            $scope.save = function(donation){
                $log.debug('saving', donation);
                donation.updatedAt = moment().valueOf();
                donation.updatedBy = F.user.uid;
                $scope.donations.$save(donation).then(function(){
                    successAlertS('Se guardó registro');
                }, errAlertS);
            }

            $scope.pickup = function(donation){
                $log.debug('picked up', donation);
                donation.pickedUp = true;
                $scope.save(donation);
            }

            $scope.cancelPickup = function(donation){
                $log.debug('cancel picked up', donation);
                donation.pickedUp = false;
                $scope.save(donation);
            }

            $scope.remove = function(donation){
                $log.debug("removing: ", donation);
                return $scope.donations.$remove(donation);
            }

            $scope.showRemoveDialog = function(ev){
                $mdDialog.show(
                    $mdDialog.confirm({
                        onComplete: function afterShowAnimation() {
                            var $dialog = angular.element(document.querySelector('md-dialog'));
                            var $actionsSection = $dialog.find('md-dialog-actions');
                            var $cancelButton = $actionsSection.children()[0];
                            var $confirmButton = $actionsSection.children()[1];
                            angular.element($confirmButton).addClass('md-raised md-warn');
                            angular.element($cancelButton).addClass('md-raised');
                        }
                    })
                    .title('Remover ' + $scope.selected.length + ' donaciones?')
                    .textContent('No podrá recuperar los datos')
                    .ariaLabel('Lucky day')
                    .targetEvent(event)
                    .ok('Eliminar')
                    .cancel('Cancelar')
                ).then(function() {
                    var count = 0;
                    $log.debug("Deleting: ", $scope.selected);
                    angular.forEach($scope.selected, function(record) {
                        $scope.remove(record).then(function() {
                            if (count == $scope.selected.length) {
                                successAlert("Se borraron " + count + " donaciones");
                                $scope.selected = [];
                            }
                        });
                    });
                });
            }

            $rootScope.$on('loggedIn', function(event, logged) {
                $log.debug(logged, "loggedIn?")
                if (logged && !initiated) init();
            });

            if (F.user && !initiated) {
                init();
            }
        }
    ]);
'use strict';

angular.module('app')
    .controller('AdminLoginCtrl', [
        "$rootScope",
        "$scope",
        "$firebaseAuth",
        "$state",
        "$log",
        "AppF",
        "successAlertS",
        "errAlertS",
        function ($rootScope, $scope, $firebaseAuth, $state, $log, AppF, successAlert, errAlert) {
            $scope.auth = $firebaseAuth();
            $scope.admin = {};
            var root = firebase.database().ref('/');
            
            $scope.login = function() {
                AppF.loading = true;
                $log.debug('login', $scope.admin);
                root.child('users').orderByChild('email').equalTo($scope.admin.email).once('value', function(snap){
                    var usersFromDB = snap.val();
                    console.log(usersFromDB, 'userR');
                    if(usersFromDB){
                        for(var uid in usersFromDB){
                            var userFromDB = usersFromDB[uid];
                            console.log(userFromDB, 'user');
                            if(userFromDB.active){
                                $scope.auth.$signInWithEmailAndPassword($scope.admin.email, $scope.admin.password).then(function(user) {
                                    AppF.user = user;
                                    successAlert("Bienvenid@");
                                    $state.go("admin.main");
                                }).catch(function(err){
                                    errAlert(err);
                                    AppF.loading = false;
                                });
                            } else {
                                errAlert('Usuario no activado');
                                AppF.loading = false;
                            }
                        }
                    } else {
                        errAlert('Usuario no existente');
                        AppF.loading = false;
                    }
                });
            };

            $rootScope.$on('loggedIn', function(event, logged) {
                if (logged) $state.go("admin.donations");
            });

            $rootScope.$watch("F.user", function(user){
                if(user){
                    $state.go("admin.donations");
                }
            })
        }
    ]);
'use strict';

angular.module("app")
    .controller("AdminLogoutCtrl", [
        "$scope",
        "$firebaseAuth",
        "$log",
        "errAlertS",
        "AppF",
        "$localStorage",
        "$state",
        function($scope, $firebaseAuth, $log, errAlert, F, $localStorage, $state){
            var logout = function(){
                $log.debug("Bye");
                firebase.auth().signOut().then(function () {
                    // Sign-out successful.
                    firebase.database().goOffline();
                    F.user = false;
                    $localStorage.lastPage = null;
                    $state.go('home');
                }, errAlert);
            }
            logout();
        }
    ])
'use strict';

angular.module('app')
    .controller('AdminMainCtrl', [
        '$rootScope',
        '$scope',
        '$log',
        'AppF',
        function($rootScope, $scope, $log, F) {
            var initiated = false;

            var init = function() {
                initiated = true;
            }


            $rootScope.$on('loggedIn', function(event, logged) {
                $log.debug(logged, "loggedIn?")
                if (logged && !initiated) init();
            });

            if (F.user && !initiated) {
                init();
            }
        }
    ]);
'use strict';

angular.module('app')
    .controller('AdminRegisterCtrl', [
        "$rootScope",
        "$scope",
        "$firebaseAuth",
        "$state",
        "$log",
        "AppF",
        "successAlertS",
        "errAlertS",
        function ($rootScope, $scope, $firebaseAuth, $state, $log, AppF, successAlert, errAlert) {
            $scope.auth = $firebaseAuth();
            $scope.admin = {};
            var root = firebase.database().ref('/')
            
            $scope.register = function() {
                AppF.loading = true;
                $log.debug('register', $scope.credentials);
                $scope.auth.$createUserWithEmailAndPassword($scope.admin.email, $scope.admin.password).then(function(user) {
                    $scope.saveProfile(user.uid).then(function(){
                        successAlert('Se creo el usuario, en cuanto sea aprobado por administración, podras entrar.')
                        $state.go("admin.logout");
                    }, function(err){
                        errAlert(err);
                        AppF.loading = false;
                    });
                    
                }).catch(function(err){
                    errAlert(err);
                    AppF.loading = false;
                });
            };

            $scope.saveProfile = function(uid){
                console.log('saveProfile', user, $scope.admin);
                var user = $scope.admin;
                user.active = false;
                user.uid = uid;
                return root.child('users').child(uid).set(user);
            }
        }
    ]);
'use strict';

angular.module('app')
    .controller('AdminVolunteersCtrl', [
        "$rootScope",
        "$scope",
        "errAlertS",
        "successAlertS",
        "$firebaseArray",
        "AppF",
        "$log",
        function($rootScope, $scope, errAlertS, successAlertS, $firebaseArray, F, $log) {
            var initiated = false;
            var root = firebase.database().ref("/");
            $scope.volunteers = [];
            $scope.currentPage = 1;
            $scope.selected = [];

            var init = function() {
                initiated = true;
                $scope.volunteers = $firebaseArray(root.child('volunteers'));
                $log.debug('Donation Ctrl initiated');
            }

            $scope.save = function(volunteer){
                $log.debug('saving', volunteer);
                volunteer.updatedAt = moment().valueOf();
                volunteer.updatedBy = F.user.uid;
                $scope.volunteers.$save(volunteer).then(function(){
                    successAlertS('Se guardó registro');
                }, errAlertS);
            }

            $scope.activate = function(volunteer){
                $log.debug('activate', volunteer);
                volunteer.active = true;
                $scope.save(volunteer);
            }

            $scope.deactivate = function(volunteer){
                $log.debug('deactivate', volunteer);
                volunteer.active = false;
                $scope.save(volunteer);
            }

            $scope.remove = function(volunteer){
                $log.debug("removing: ", volunteer);
                return $scope.volunteers.$remove(volunteer);
            }

            $scope.showRemoveDialog = function(ev){
                $mdDialog.show(
                    $mdDialog.confirm({
                        onComplete: function afterShowAnimation() {
                            var $dialog = angular.element(document.querySelector('md-dialog'));
                            var $actionsSection = $dialog.find('md-dialog-actions');
                            var $cancelButton = $actionsSection.children()[0];
                            var $confirmButton = $actionsSection.children()[1];
                            angular.element($confirmButton).addClass('md-raised md-warn');
                            angular.element($cancelButton).addClass('md-raised');
                        }
                    })
                    .title('Remover ' + $scope.selected.length + ' voluntarios?')
                    .textContent('No podrá recuperar los datos')
                    .ariaLabel('Lucky day')
                    .targetEvent(event)
                    .ok('Eliminar')
                    .cancel('Cancelar')
                ).then(function() {
                    var count = 0;
                    $log.debug("Deleting: ", $scope.selected);
                    angular.forEach($scope.selected, function(record) {
                        $scope.remove(record).then(function() {
                            if (count == $scope.selected.length) {
                                successAlert("Se borraron " + count + " voluntarios");
                                $scope.selected = [];
                            }
                        });
                    });
                });
            }

            $rootScope.$on('loggedIn', function(event, logged) {
                $log.debug(logged, "loggedIn?")
                if (logged && !initiated) init();
            });

            if (F.user && !initiated) {
                init();
            }
        }
    ]);
'use strict';

angular.module('app')
    .controller('ChooseCenterCtrl', [
        "$rootScope",
        "$scope",
        "$log",
        "successAlertS",
        "errAlertS",
        "$firebaseAuth",
        "$state",
        "$q",
        "AppF",
        "$firebaseArray",
        "NgMap",
        "$document",
        "geoDistanceFilter",
        function($rootScope, $scope, $log, successAlertS, errAlertS, $firebaseAuth, $state, $q, F, $firebaseArray, NgMap, $document, geoDistanceFilter) {
            var initiated = false;
            $scope.volunteer = {};
            var root = firebase.database().ref('/');
            $scope.auth = $firebaseAuth();
            $scope.distanceFromMe = 10;
            $scope.distanceForCenters = 100;
            $scope.selectedDonation = false;
            $scope.selectedCenter = false;
            $scope.map;
            $scope.loading = true;

            var init = function(user){
                if(user){
                    if(user.providerData){
                        if(user.providerData[0]){
                            if(user.providerData[0].providerId == 'twitter.com'){
                                console.log(user, "loggedIn User")
                                // checar si usuario existe
                                checkIfUserExist(user.uid).then(function(volunteer){
                                    if(volunteer){
                                        console.log(volunteer, 'volunteer existe');
                                        $scope.volunteer = volunteer;
                                        if($scope.volunteer.hasOwnProperty('selectedDonation')){
                                            getSelectedDonation($scope.volunteer.selectedDonation);
                                            getMapInfo();
                                        } else {
                                            $state.go('chooseDonation');
                                        }
                                    } else {
                                        $scope.volunteer = {
                                            registeredTovolunteer: false,
                                            provider: 'twitter',
                                            uid: user.uid,
                                            active: false
                                        };
                                        console.log($scope.volunteer, 'volunteer no existe');
                                    }
                                    initiated = true;
                                });

                            }
                        }
                    }
                }
            }

            /**
             * Guarda los cambios que tenga selectedDonation y crea una alera con un mensaje de exito
             * @param {*} donation
             * @param string successMsg
             */
            var saveDonation = function(donation, successMsg){
                var promise = $q.defer();
                donation.updatedAt = moment().valueOf();
                var id = angular.copy(donation.$id);
                delete donation.$id;
                delete donation.$priority;
                delete donation.distance; // se le agrega distance por el filtro de geoLocation
                console.log(donation,id, 'saving donation');
                root.child('donations').child(id).set(donation).then(function(){
                    donation.$id = id;
                    successAlertS(successMsg);
                    promise.resolve(true);
                }, function(err){
                    errAlertS(err);
                    promise.reject(err);
                });

                return promise.promise;
            }

            /**
             * Guarda una propiedad y valor especificos del voluntario logeado
             * @param {*} value
             * @param string prop
             */
            var saveVolunteer = function(value, prop){
                console.log(value, prop, 'saving volunteer');
                return root.child('volunteers').child(F.user.uid).child(prop).set(value);
            }

            /**
             * Se checa si el user logeado es un voluntario o aun no ha sido creado
             * @param string uid
             */
            var checkIfUserExist = function(uid){
                var promise = $q.defer();
                root.child('volunteers').child(uid).once('value', function(snap){
                    var volunteer = snap.val();
                    if(volunteer){
                        promise.resolve(volunteer);
                    } else {
                        promise.resolve(false);
                    }
                }, function(err){
                    errAlertS(err);
                    promise.reject(err);
                });
                return promise.promise;
            }

            var getSelectedCenter = function(centerId){
                console.log("getSelectedCenter", centerId);
                root.child('centers').child(centerId).once('value', function(snap){
                    $scope.selectedCenter = snap.val();
                    $scope.selectedCenter.$id = snap.key;
                    $scope.$apply();
                });
            }

            /**
             * Trae a $scope.selectedDonation la donacion
             * @param string donationId
             */
            var getSelectedDonation = function(donationId){
                console.log("getSelectedDonation", donationId);
                root.child('donations').child(donationId).once('value', function(snap){
                    $scope.selectedDonation = snap.val();
                    $scope.selectedDonation.$id = snap.key;
                    $scope.$apply();
                    if($scope.selectedDonation.status == 'esperando' || $scope.selectedDonation.status == 'recogiendo'){
                        $state.go('chooseDonation');
                    } else {
                        if($scope.selectedDonation.hasOwnProperty('deliverAt')){
                            getSelectedCenter($scope.selectedDonation.deliverAt);
                        }
                    }
                });
            }

            var addMarker = function(lat, lng, name, place){
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(lat,lng),
                    map: $scope.map,
                    title: name
                });
                google.maps.event.addListener(marker, 'click', function(){
                    $scope.selectCenter(place);
                });
            }

            var initMap = function(){
                F.getLocation().then(function(myPosition){
                    var latlng = new google.maps.LatLng(myPosition.latitude,myPosition.longitude);
                    var myOptions = {
                        zoom: 14,
                        center: latlng,
                        mapTypeId: google.maps.MapTypeId.TERRAIN
                    };
                    $scope.map = new google.maps.Map(document.getElementById('map'),myOptions);
                    // $scope.nearestCenters = geoDistanceFilter($scope.centersAvailable, myPosition, $scope.distanceFromMe);
                    $scope.nearestCenters = $scope.centersAvailable;
                    console.log($scope.nearestCenters, "DAMN");
                    for (var d in $scope.nearestCenters){
                        var center = $scope.nearestCenters[d];
                        if(center.hasOwnProperty('$id')){
                            addMarker(center.geometry.coordinates[1], center.geometry.coordinates[0], center.properties.Name, center);
                        }
                    }
                    $scope.loading = false;

                    google.maps.event.addListenerOnce($scope.map, 'idle', function() {
                        google.maps.event.trigger($scope.map, 'resize');
                        $scope.map.setCenter(latlng);
                    });
                });
            }

            /**
             * Se inicializa el mapa
             */
            var getMapInfo = function(){
                $scope.centersAvailable = $firebaseArray(root.child('centers'));
                $scope.centersAvailable.$loaded().then(function(){
                    initMap();
                });
            }

            /**
             * Cuando se entrega la donación al centro
             */
            $scope.deliverDonation = function(){
                $scope.selectedDonation.status = 'entregado';
                $scope.selectedDonation.deliveredBy = F.user.uid;
                saveVolunteer(null, 'selectedDonation').then(function(){
                    saveDonation($scope.selectedDonation, 'Gracias!! Se entrego la donación correctamente!').then(function(){
                        $state.go('chooseDonation');
                    });
                });
            }

            /**
             * Cuando se cancela recoger la donación
             */
            $scope.cancelPickup = function(){
                $scope.selectedDonation.status = 'esperando';
                $scope.selectedDonation.deliverAt = null;
                saveVolunteer(null, 'selectedDonation').then(function(){
                    saveDonation($scope.selectedDonation, 'Se canceló que recogieras esa donación').then(function(){
                        $scope.selectedDonation = false;
                        $state.go('chooseDonation'); // se regresa al paso anterior
                    });
                });
            }

            /**
             * Cuando se seleccióna un centro a la cual entregar
             */
            $scope.selectCenter = function(point){
                console.log(point, "select point");
                $scope.loading = true;
                $scope.selectedCenter = point;
                $scope.selectedDonation.status = 'entregando';
                $scope.selectedDonation.deliverAt = $scope.selectedCenter.$id;
                saveVolunteer($scope.selectedDonation.$id, 'selectedDonation').then(function(){
                    saveDonation($scope.selectedDonation, 'Escogiste un centro').then(function(){
                        $scope.loading = false;
                    });
                });
            }

            /**
             * Se inicializa el mapa para ponerlo en scope
             * Probablemente necesitemos hacer lo mismo con los otros mapas
             */
            NgMap.getMap("map").then(function(evtMap){
                $scope.map = evtMap;
            });

            /**
             * En esta parte detectamos cuando se logea para iniciar el ctrl
             */
            $rootScope.$on('loggedIn', function(event, logged) {
                $log.debug(logged, "loggedIn?")
                if (logged && !initiated) {
                    if(F.user.providerData[0].providerId !== 'twitter.com'){
                        $state.go('home');
                    } else {
                        init(F.user);
                    }
                }
            });
            if (F.user && !initiated) {
                if(F.user.providerData[0].providerId !== 'twitter.com'){
                    $state.go('home');
                } else {
                    init(F.user);
                }
            }
            var initWatcher = $scope.$watch('F.user.providerData[0].providerId', function(providerId){
                if(providerId){
                    if(providerId !== 'twitter.com'){
                        $state.go('home');
                    } else if(!initiated) {
                        init(F.user);
                        initWatcher();
                    }
                }
            });
        }
    ]);

'use strict';

angular.module('app')
    .controller('ChooseDonationCtrl', [
        "$rootScope",
        "$scope",
        "$log",
        "successAlertS",
        "errAlertS",
        "$firebaseAuth",
        "$state",
        "$q",
        "AppF",
        "$firebaseArray",
        "NgMap",
        "$document",
        "geoDistanceFilter",
        function($rootScope, $scope, $log, successAlertS, errAlertS, $firebaseAuth, $state, $q, F, $firebaseArray, NgMap, $document, geoDistanceFilter) {
            var initiated = false;
            $scope.volunteer = {};
            var root = firebase.database().ref('/');
            $scope.auth = $firebaseAuth();
            $scope.distanceFromMe = 10;
            $scope.selectedDonation = false;
            $scope.map;

            var init = function(user){
                if(user){
                    if(user.providerData){
                        if(user.providerData[0]){
                            if(user.providerData[0].providerId == 'twitter.com'){
                                console.log(user, "loggedIn User")
                                // checar si usuario existe
                                checkIfUserExist(user.uid).then(function(volunteer){
                                    if(volunteer){
                                        console.log(volunteer, 'volunteer existe');
                                        $scope.volunteer = volunteer;
                                        if(volunteer.active) $scope.loading = true;
                                        if($scope.volunteer.hasOwnProperty('selectedDonation')){
                                            getSelectedDonation($scope.volunteer.selectedDonation);
                                        }
                                        getMapInfo();
                                    } else {
                                        $scope.volunteer = {
                                            registeredTovolunteer: false,
                                            provider: 'twitter',
                                            uid: user.uid,
                                            active: false
                                        };
                                        console.log($scope.volunteer, 'volunteer no existe');
                                    }
                                    initiated = true;
                                });

                            }
                        }
                    }
                }
            }

            /**
             * Guarda los cambios que tenga selectedDonation y crea una alera con un mensaje de exito
             * @param {*} donation
             * @param string successMsg
             */
            var saveDonation = function(donation, successMsg){
                var promise = $q.defer();
                donation.updatedAt = moment().valueOf();
                var id = angular.copy(donation.$id);
                delete donation.$id;
                delete donation.$priority;
                delete donation.distance; // se le agrega distance por el filtro de geoLocation
                console.log(donation,id, 'saving donation');
                root.child('donations').child(id).set(donation).then(function(){
                    donation.$id = id;
                    successAlertS(successMsg);
                    promise.resolve(true);
                }, function(err){
                    errAlertS(err);
                    promsise.reject(err);
                });

                return promise.promise;
            }

            /**
             * Guarda una propiedad y valor especificos del voluntario logeado
             * @param {*} value
             * @param string prop
             */
            var saveVolunteer = function(value, prop){
                console.log(value, prop, 'saving volunteer');
                return root.child('volunteers').child(F.user.uid).child(prop).set(value);
            }

            /**
             * Se checa si el user logeado es un voluntario o aun no ha sido creado
             * @param string uid
             */
            var checkIfUserExist = function(uid){
                var promise = $q.defer();
                root.child('volunteers').child(uid).once('value', function(snap){
                    var volunteer = snap.val();
                    if(volunteer){
                        promise.resolve(volunteer);
                    } else {
                        promise.resolve(false);
                    }
                }, function(err){
                    errAlertS(err);
                    promise.reject(err);
                });
                return promise.promise;
            }

            /**
             * Trae a $scope.selectedDonation la donacion
             * @param string donationId
             */
            var getSelectedDonation = function(donationId){
                console.log("SIP", donationId);
                root.child('donations').child(donationId).once('value', function(snap){
                    $scope.selectedDonation = snap.val();
                    $scope.selectedDonation.$id = snap.key;
                    $scope.$apply();
                    if($scope.selectedDonation.status == 'recogido' || $scope.selectedDonation.status == 'entregando'){
                        $state.go('chooseCenter');
                    }
                });
            }

            //FACTORIZAR
            var addMarker = function(lat, lng, name, place){
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(lat,lng),
                    map: $scope.map,
                    title: name
                });
                google.maps.event.addListener(marker, 'click', function(){
                    $scope.selectDonation(place);
                });
            }

            var initMap = function(){
                F.getLocation().then(function(myPosition){
                    var latlng = new google.maps.LatLng(myPosition.latitude,myPosition.longitude);
                    var myOptions = {
                        zoom: 14,
                        center: latlng,
                        mapTypeId: google.maps.MapTypeId.TERRAIN
                    };
                    $scope.map = new google.maps.Map(document.getElementById('map'),myOptions);
                    $scope.nearestDonations = geoDistanceFilter($scope.donationsAvailable, myPosition, $scope.distanceFromMe);
                    for (var d in $scope.nearestDonations){
                        var donation = $scope.nearestDonations[d];
                        addMarker(donation.latitude, donation.longitude, donation.name + ' - ' + donation.categoryOfDonations, donation);
                    }

                    $scope.loading = false;
                    google.maps.event.addListenerOnce($scope.map, 'idle', function() {
                        google.maps.event.trigger($scope.map, 'resize');
                        $scope.map.setCenter(latlng);
                    });
                });
            }

            /**
             * Se inicializa el mapa
             */
            var getMapInfo = function(){
                $scope.donationsAvailable = $firebaseArray(root.child('donations').orderByChild('status').equalTo('esperando'));
                $scope.donationsAvailable.$loaded().then(function(){
                    initMap();
                });
            }

            /**
             * Salva al voluntario cuando se registra como voluntario
             */
            $scope.save = function(){
                $log.debug('saving', $scope.volunteer);
                $scope.volunteer.registeredTovolunteer = true;
                $scope.volunteer.updatedAt = moment().valueOf();
                root.child('volunteers').child($scope.volunteer.uid).set($scope.volunteer).then(function(){
                    successAlertS('Gracias por registrarte como voluntario, en cuanto nos sea posible nos pondremos en contacto contigo');
                }, errAlertS);
            }

            /**
             * Cuando se recoge la donacion
             */
            $scope.pickupDonation = function(){
                $scope.selectedDonation.status = 'recogido';
                $scope.selectedDonation.pickedBy = F.user.uid;
                saveDonation($scope.selectedDonation, 'Gracias!! Se recogiste la donación, ahora solo debes llevarla a un centro de acopio').then(function(){
                    $state.go('chooseCenter');
                });
            }

            /**
             * Cuando se cancela recoger la donación
             */
            $scope.cancelPickup = function(){
                $scope.selectedDonation.status = 'esperando';
                $scope.selectedDonation.deliverAt = null;
                saveVolunteer(null, 'selectedDonation').then(function(){
                    saveDonation($scope.selectedDonation, 'Se canceló que recogieras esa donación').then(function(){
                        $scope.selectedDonation = false;
                    });

                });
            }

            /**
             * Cuando se seleccióna una donación a la cual recoger
             */
            $scope.selectDonation = function(point){
                $scope.loading = true;
                console.log(point, "select point");
                $scope.selectedDonation = point;
                $scope.selectedDonation.status = 'recogiendo';
                saveVolunteer($scope.selectedDonation.$id, 'selectedDonation').then(function(){
                    saveDonation($scope.selectedDonation, 'Escogiste una donación').then(function(){
                        $scope.loading = false;
                    });
                });
            }

            /**
             * En esta parte detectamos cuando se logea para iniciar el ctrl
             */
            $rootScope.$on('loggedIn', function(event, logged) {
                $log.debug(logged, "loggedIn?")
                if (logged && !initiated) {
                    if(F.user.providerData[0].providerId !== 'twitter.com'){
                        $state.go('home');
                    } else {
                        init(F.user);
                    }
                }
            });
            if (F.user && !initiated) {
                if(F.user.providerData[0].providerId !== 'twitter.com'){
                    $state.go('home');
                } else {
                    init(F.user);
                }
            }
            var initWatcher = $scope.$watch('F.user.providerData[0].providerId', function(providerId){
                if(providerId){
                    if(providerId !== 'twitter.com'){
                        $state.go('home');
                    } else {
                        init(F.user);
                        initWatcher();
                    }
                }
            });
        }
    ]);

'use strict';

angular.module('app')
    .controller('CrudsCtrl', [
        "$rootScope",
        "$scope",
        "$firebaseArray",
        "$log",
        "$mdDialog",
        "$localStorage",
        "AppF",
        "errAlertS",
        "successAlertS",
        "slugifyFilter",
        function($rootScope, $scope, $firebaseArray, $log, $mdDialog, $localStorage, F, errAlert, successAlert, slugify) {
            var root = firebase.database().ref("/");
            var storageRef = firebase.storage().ref();
            var initiated = false;

            $scope.cruds = [];
            var init = function() {
                $scope.loadAll();

                $scope.newItem = false;
                $scope.uploadImage = false;
                initiated = true;
            }

            $scope.loadAll = function() {
                var crudsQ = root.child('cruds');
                $scope.cruds = $firebaseArray(crudsQ);
                $scope.cruds.$loaded(function(cruds) {
                    $scope.cruds = cruds;
                    $log.debug('Loaded', $scope.cruds);
                });
            }


            $scope.add = function(crud) {
                $log.debug("creating: ", crud);
                crud.created_on = firebase.database.ServerValue.TIMESTAMP;
                crud.images = {
                    portada: false,
                    logo: false
                };
                $scope.cruds.$add(crud).then(function() {
                    F.counter.cruds = F.counter.cruds + 1;
                    F.counter.$save();
                    successAlert("Crud Creada");
                    $scope.newItem = false;
                    $mdDialog.cancel();
                }, errAlert);
            }

            $scope.save = function(crud) {
                $log.debug("saving: ", crud);
                crud.updated_on = firebase.database.ServerValue.TIMESTAMP;
                $scope.cruds.$save(crud).then(function() {
                    successAlert("Crud Guardado");
                }, errAlert);
            }

            $scope.remove = function(crud) {
                $log.debug("removing: ", crud);
                return $scope.cruds.$remove(crud);
            }

            $scope.upload = function(files, whatImage, crud) {
                var file = files[0].lfFile;
                var imagesRef = storageRef.child('cruds/');
                // whatImage = [logo,portada]
                var fileName = slugify(crud.name) + '_' + whatImage + '_' + '.jpg';
                var spaceRef = imagesRef.child(fileName);
                var path = spaceRef.fullPath;

                var uploadTask = spaceRef.put(file);
                $scope.progress = 0;
                uploadTask.on('state_changed', function(snapshot) {
                    $scope.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    $log.info('Upload is ' + $scope.progress + '% done');
                    switch (snapshot.state) {
                        case firebase.storage.TaskState.PAUSED: // or 'paused'
                            $log.debug('Upload is paused');
                            break;
                        case firebase.storage.TaskState.RUNNING: // or 'running'
                            $log.debug('Upload is running');
                            break;
                    }
                }, errAlert, function() {
                    crud.images[whatImage] = uploadTask.snapshot.downloadURL;
                    $scope.cruds
                        .$save(crud)
                        .then(function() {
                            successAlert("Se subió el archivo correctamente");
                        }, errAlert);
                });

                $log.debug("uploading: ", crud, whatImage, file);
            }

            $scope.removeUpload = function(crud, whatImage) {
                var fileName = slugify(crud.name) + '_' + whatImage + '_' + '.jpg';
                // Create a reference to the file to delete
                var desertRef = storageRef.child('cruds/' + fileName);
                // Delete the file
                desertRef.delete().then(function() {
                    crud.images[whatImage] = false;
                    $scope.cruds
                        .$save(crud)
                        .then(function() {
                            successAlert("Se borró el archivo correctamente");
                        }, errAlert);
                }).catch(function(err){
                    // if here delete ref anyway
                    crud.images[whatImage] = false;
                    $scope.cruds
                        .$save(crud)
                        .then(function() {
                            successAlert("Se borró el archivo correctamente");
                        }, errAlert);
                });
            }

            $scope.cancelUpload = function(uploadTask) {
                uploadTask.cancel();
            }

            $scope.showAddDialog = function(event) {
                $scope.newItem = true;
                $scope.crud = {};
                $mdDialog.show({
                    scope: $scope,
                    preserveScope: true,
                    controller: "DialogCtrl",
                    templateUrl: 'partials/admin/dialogs/cruds.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: true
                });
            };

            $scope.showSaveDialog = function(event, crud) {
                $scope.crud = crud;
                $mdDialog.show({
                    scope: $scope,
                    preserveScope: true,
                    controller: "DialogCtrl",
                    templateUrl: 'partials/admin/dialogs/cruds.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: true
                });
            };

            $scope.showRemoveDialog = function(event) {
                $scope.crudsToBeRemoved = F.getSelected($scope.cruds);
                var msg = (F.safeRemove) ? 'Podrá recuperar sus datos en la papelera hasta por ' + F.recycleDays + ' días.' : 'No podrá recuperar sus datos.';

                $mdDialog.show(
                    $mdDialog.confirm({
                        onComplete: function afterShowAnimation() {
                            var $dialog = angular.element(document.querySelector('md-dialog'));
                            var $actionsSection = $dialog.find('md-dialog-actions');
                            var $cancelButton = $actionsSection.children()[0];
                            var $confirmButton = $actionsSection.children()[1];
                            angular.element($confirmButton).addClass('md-raised md-warn');
                            angular.element($cancelButton).addClass('md-raised');
                        }
                    })
                    .title('Remover ' + $scope.crudsToBeRemoved.length + ' cruds?')
                    .textContent(msg)
                    .ariaLabel('Lucky day')
                    .targetEvent(event)
                    .ok('Eliminar')
                    .cancel('Cancelar')
                ).then(function() {
                    var count = 0;
                    $log.debug("Deleting: ", $scope.crudsToBeRemoved);
                    angular.forEach($scope.crudsToBeRemoved, function(crud) {
                        if (F.safeRemove) {
                            // todo
                            // $scope.removeSafely(drustore).then(function(){
                            //     $scope.count++
                            //     if($scope.count == $scope.crudsToBeRemoved.length){
                            //         // todo with undo
                            //         // actionAlert("Se mandaron " + $scope.count + " cruds a la papelera", );
                            //     }
                            // });
                        } else {
                            $scope.remove(crud).then(function() {
                                F.counter.cruds = F.counter.cruds - 1;
                                F.counter.$save();
                                count++
                                if (count == $scope.crudsToBeRemoved.length) {
                                    successAlert("Se borraron " + count + " cruds");
                                }
                            });
                        }
                    });
                });
            };

            $rootScope.$on('loggedIn', function(event, logged) {
                $log.debug(logged, "loggedIn?")
                if (logged) {
                    init();
                }
            });

            if (F.user && !initiated) {
                init();
            }
        }
    ]);
'use strict';

angular.module("app")
    .controller("DialogCtrl", [
        "$scope", 
        "$mdDialog",
        function ($scope, $mdDialog) {
            $scope.hide = function() {
                $mdDialog.hide();
            };
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
        }
    ])
/*
Victor Espinosa:im.vicoy@gmail.com
twitter:@vicoysito
*/


'use strict';

angular.module('app')
    .controller('DonateCtrl', [
        "$rootScope",
        "$scope",
        "errAlertS",
        "successAlertS",
        "NgMap",
        "AppF",
        function($rootScope, $scope, errAlertS, successAlertS, NgMap,F) {
            var initiated = false;
            $scope.map;
            var root = firebase.database().ref("/");
            $scope.donator = {};
            $scope.donationSent = false;
            $scope.marker;

            var init = function() {
                initiated = true;
                // revisar el timeout
                setTimeout(initMap,1000);
            }

            var thanks = function(){
                $scope.donationSent = true;
                $scope.$apply();
            }


            $scope.save = function(){
                $scope.donator.createdAt = moment().valueOf();
                $scope.donator.status = 'esperando';
                console.log('saving', $scope.donator);
                root.child('donations').push($scope.donator).then(function(){
                    thanks();
                }, errAlertS);
            }

            $scope.ubicateMe = function(){
                console.log('ubicating me');
            }





            var initMap = function(){
              var marker;
              var infowindow = new google.maps.InfoWindow();
              var geocoder = new google.maps.Geocoder;

                F.getLocation().then(function(myPosition){
                    var latlng = new google.maps.LatLng(myPosition.latitude,myPosition.longitude);
                    var myOptions = {
                        zoom: 14,
                        center: latlng,
                        mapTypeId: google.maps.MapTypeId.TERRAIN
                    };
                    $scope.map = new google.maps.Map(document.getElementById('map'),myOptions);
                    marker = new google.maps.Marker({
                      draggable:true,
                      map: $scope.map,
                      position: latlng
                    });

                    geocodeLatLng(geocoder, $scope.map,latlng,marker,infowindow);
                    setAutocomplete($scope.map,marker,infowindow);


                    $scope.loading = false;
                    google.maps.event.addListenerOnce($scope.map, 'idle', function() {
                        google.maps.event.trigger($scope.map, 'resize');
                        $scope.map.setCenter(latlng);
                    });

                    // Funcion para que actualize el marker y el infoView del marcador cuando se mueve, de igual forma actualiza el modelo AdressInput
                    marker.addListener('dragend', function(event){
                      geocodeLatLng(geocoder, $scope.map,event.latLng,marker,infowindow);
                    });


                });


            }

            //todo: pasar a un archivo mapa utils
            // agrego el autocomplete y funcionalidad
            var setAutocomplete= function(map,marker,infowindow){
              var input = /** @type {!HTMLInputElement} */(
                  document.getElementById('addressIn'));
                  var optionsInput = {
                    componentRestrictions: {country: 'mx'}
                  };
              var autocomplete = new google.maps.places.Autocomplete(input,optionsInput);

                  autocomplete.addListener('place_changed', function() {
                    infowindow.close();
                    marker.setVisible(false);
                    var place = autocomplete.getPlace();
                    if (!place.geometry) {
                      // LA BUSQUEDA FALLO
                      window.alert("No details available for input: '" + place.name + "'");
                      return;
                    }

                    if (place.geometry.viewport) {
                      map.fitBounds(place.geometry.viewport);
                    } else {
                      map.setCenter(place.geometry.location);
                    }

                    marker.setPosition(place.geometry.location);
                    marker.setVisible(true);
                    var address = '';
                    if (place.address_components) {
                      address = [
                        (place.address_components[0] && place.address_components[0].short_name || ''),
                        (place.address_components[1] && place.address_components[1].short_name || ''),
                        (place.address_components[2] && place.address_components[2].short_name || '')
                      ].join(' ');
                    }

                    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
                    infowindow.open(map, marker);
                  });
            }


            // todo:pasar a un mapa utils
            // devuelve el detalle de la ubicacion por latitud y longitud
            function geocodeLatLng(geocoder, map,latlng,marker,infowindow) {
                  geocoder.geocode({'location': latlng}, function(results, status) {
                    if (status === 'OK') {
                      if (results[1]) {
                        var detailUbicacion = results[0].formatted_address;
                        $scope.addressInput=detailUbicacion;
                        infowindow.setContent(detailUbicacion);
                        infowindow.open(map, marker);

                        // seteo la direccion a donator\
                        $scope.donator.latitude = latlng.lat();
                        $scope.donator.longitude = latlng.lng();
                        $scope.$apply();
                        return detailUbicacion;
                      } else {
                        window.alert('No results found');
                      }
                    } else {
                      window.alert('Geocoder failed due to: ' + status);
                    }
                  });
                }

            init();
        }
    ]);

'use strict';

angular.module('app')
    .controller('GeneralCtrl', [
        "$rootScope",
        "$scope",
        "$http",
        "$sessionStorage",
        "AppF",
        "$state",
        "volunteerStates",
        function($rootScope, $scope, $http, $sessionStorage, AppF, $state, volunteerStates) {
            $rootScope.F = AppF;
            $rootScope.state = $state;
            $rootScope.volunteerStates = volunteerStates;
        }
    ]);
'use strict';

angular.module('app')
    .controller('HomeCtrl', [
        "$rootScope",
        "$scope",
        function($rootScope, $scope) {
            var initiated = false;

            var init = function() {
                initiated = true;
                console.log('Home Ctrl initiated')
            }

            init();
        }
    ]);
'use strict';

angular.module('app')
    .controller('MenuCtrl', [
        '$scope',
        '$log',
        '$mdSidenav',
        '$timeout',
        '$rootScope',
        'AppF',
        '$window',
        function ($scope, $log, $mdSidenav, $timeout, $rootScope, AppF, $window) {
            $log.debug('inside MenuCtrl');
            // $scope.toggleLeft = buildDelayedToggler('left');
            $scope.toggleLeft = function () {
                $mdSidenav('left')
                    .toggle()
                    .then(function () {
                        $log.debug("toggle is done");
                    });
            }
            $rootScope.F = AppF;

            $scope.close = function () {
                $mdSidenav('left')
                .close()
                .then(function () {
                    $log.debug("close LEFT is done");
                });
            }

            $scope.triggerMenu = function(ev){
                angular.element('.nav-trigger').toggleClass('active');
                angular.element('.nav').toggleClass('mobile-nav-active');
            }

            $window.onload = function(event){
                toogleMenu()
            }

            $window.onresize = function(event){
                toogleMenu()
            }

            var toogleMenu = function(){
                var width = $window.innerWidth;
                if (width >= 769) {
                    console.log("big device");
                    angular.element('.nav').removeClass('mobile-nav-active');
                } else {
                    console.log("small device")
                }
            }

            /**
             * Supplies a function that will continue to operate until the
             * time is up.
             */
            function debounce(func, wait, context) {
                var timer;
                return function debounced() {
                    var context = $scope,
                        args = Array.prototype.slice.call(arguments);
                    $timeout.cancel(timer);
                    timer = $timeout(function () {
                        timer = undefined;
                        func.apply(context, args);
                    }, wait || 10);
                };
            }
            /**
             * Build handler to open/close a SideNav; when animation finishes
             * report completion in console
             */
            function buildDelayedToggler(navID) {
                return debounce(function () {
                    // Component lookup should always be available since we are not using `ng-if`
                    $mdSidenav(navID)
                        .toggle()
                        .then(function () {
                            $log.debug("toggle " + navID + " is done");
                        });
                }, 200);
            }
        }
    ]);
'use strict';

angular.module("app")
    .controller("ToastCtrl", [
        "$scope",
        "$mdToast",
        function($scope, $mdToast){
            $scope.closeToast = function() {
                $mdToast.hide();
            };
        }
    ])
'use strict';

angular.module('app')
    .controller('VolunteerCtrl', [
        "$rootScope",
        "$scope",
        "$log",
        "successAlertS",
        "errAlertS",
        "$firebaseAuth",
        "$state",
        "$q",
        "AppF",
        "$firebaseArray",
        "$document",
        "geoDistanceFilter",
        function($rootScope, $scope, $log, successAlertS, errAlertS, $firebaseAuth, $state, $q, F, $firebaseArray, $document, geoDistanceFilter) {
            var initiated = false;
            $scope.volunteer = {};
            var root = firebase.database().ref('/');
            $scope.auth = $firebaseAuth();

            var init = function(user){
                if(user){
                    if(user.providerData){
                        if(user.providerData[0]){
                            if(user.providerData[0].providerId == 'twitter.com'){
                                console.log(user, "loggedIn User")
                                // checar si usuario existe
                                checkIfUserExist(user.uid).then(function(volunteer){
                                    if(volunteer){
                                        console.log(volunteer, 'volunteer existe');
                                        $scope.volunteer = volunteer;
                                        if($scope.volunteer.hasOwnProperty('selectedDonation')){
                                            // esto va a redirigir al usuario al paso correcto
                                            getSelectedDonation($scope.volunteer.selectedDonation);
                                        } else {
                                            $state.go('chooseDonation');
                                        }
                                    } else {
                                        $scope.volunteer = {
                                            registeredTovolunteer: false,
                                            provider: 'twitter',
                                            uid: user.uid,
                                            active: false
                                        };
                                        console.log($scope.volunteer, 'volunteer no existe');
                                        console.log('se está en el paso correcto');
                                    }
                                    initiated = true;
                                });
                                
                            }
                        }
                    }
                }
            }

            /**
             * Guarda los cambios que tenga selectedDonation y crea una alera con un mensaje de exito
             * @param {*} donation 
             * @param string successMsg 
             */
            var saveDonation = function(donation, successMsg){
                donation.updatedAt = moment().valueOf();
                var id = angular.copy(donation.$id);
                delete donation.$id;
                delete donation.$priority;
                delete donation.distance; // se le agrega distance por el filtro de geoLocation
                console.log(donation,id, 'saving donation');
                root.child('donations').child(id).set(donation).then(function(){
                    donation.$id = id;
                    successAlertS(successMsg);
                }, errAlertS);
            }

            /**
             * Guarda una propiedad y valor especificos del voluntario logeado
             * @param {*} value 
             * @param string prop 
             */
            var saveVolunteer = function(value, prop){
                console.log(value, prop, 'saving volunteer');
                return root.child('volunteers').child(F.user.uid).child(prop).set(value);
            }

            /**
             * Se checa si el user logeado es un voluntario o aun no ha sido creado
             * @param string uid 
             */
            var checkIfUserExist = function(uid){
                var promise = $q.defer();
                root.child('volunteers').child(uid).once('value', function(snap){
                    var volunteer = snap.val();
                    if(volunteer){
                        promise.resolve(volunteer);
                    } else {
                        promise.resolve(false);
                    }
                }, function(err){
                    errAlertS(err);
                    promise.reject(err);
                });
                return promise.promise;
            }

            /**
             * Trae a $scope.selectedDonation la donacion, versión modificada para redireccionar segun status de donación
             * @param string donationId 
             */
            var getSelectedDonation = function(donationId){
                console.log("getSelectedDonation", donationId);
                root.child('donations').child(donationId).once('value', function(snap){
                    $scope.selectedDonation = snap.val();
                    $scope.selectedDonation.$id = snap.key;
                    $scope.$apply();
                    if($scope.selectedDonation.status == 'esperando' || $scope.selectedDonation.status == 'recogiendo'){
                        $state.go('chooseDonation');
                    } else  if($scope.selectedDonation.status == 'recogido' || $scope.selectedDonation.status == 'entregando'){
                        $state.go('chooseCenter');
                    }
                });
            }

            /**
             * Salva al voluntario cuando se registra como voluntario
             */
            $scope.save = function(){
                $log.debug('saving', $scope.volunteer);
                $scope.volunteer.registeredTovolunteer = true;
                $scope.volunteer.updatedAt = moment().valueOf();
                root.child('volunteers').child($scope.volunteer.uid).set($scope.volunteer).then(function(){
                    successAlertS('Gracias por registrarte como voluntario, en cuanto nos sea posible nos pondremos en contacto contigo');
                    $state.go('chooseDonation');
                }, errAlertS);
            }

            /**
             * Login con twitter
             */
            $scope.loginWithTwitter = function(){
                $scope.auth.$signInWithRedirect('twitter').catch(errAlertS);
            }
            
            /**
             * En esta parte detectamos cuando se logea para iniciar el ctrl (solo voluntarios)
             */
            $rootScope.$on('loggedIn', function(event, logged) {
                $log.debug(logged, "loggedIn?")
                if (logged && !initiated) {
                    if(F.user.providerData[0].providerId !== 'twitter.com'){
                        $state.go('home');
                    } else {
                        init(F.user);
                    }
                }
            });
            if (F.user && !initiated) {
                if(F.user.providerData[0].providerId !== 'twitter.com'){
                    $state.go('home');
                } else {
                    init(F.user);
                }
            }
        }
    ]);
'use strict';

angular.module('app')
    .directive('footPage', [
        function(){
            return {
                restrict: 'E',
                scope: true,
                transclude: true,
                templateUrl: 'partials/foot-page.html'
            }
        }
    ]);
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
'use strict';

angular.module('app')
    .directive('menuLinks', [
        "$state",
        function($state){
            return {
                restrict: 'A',
                templateUrl: 'partials/menu-links.html',
                link: function(scope, ele, attrs, ctrl){
                    scope.isOpen = function(state){
                        return $state.includes(state);
                    }
                }
            }
        }
    ]);
'use strict';

angular.module('app')
    .directive('menuSidebarLeft', [
        function(){
            return {
                restrict: 'E',
                scope: true,
                transclude: true,
                templateUrl: 'partials/menu-sidebar-left.html'
            }
        }
    ]);


'use strict';

angular.module('app')
    .directive('partialLoading', [
        function(){
            return {
                restrict: 'A',
                scope: true,
                transclude: true,
                templateUrl: 'partials/partial-loading.html'
            }
        }
    ]);
'use strict';

angular.module('app')
    .directive('searchObjectsBar', [
        function() {
            return {
                restrict: 'A',
                replace: true,
                scope: {
                    search: "="
                },
                transclude: true,
                templateUrl: 'partials/search-objects-bar.html'
            }
        }
    ]);
'use strict';

angular.module('app')
    .directive('titleObjectsBar', [
        function() {
            return {
                restrict: 'A',
                replace: true,
                scope: {
                    objects: "=",
                    title: "="
                },
                transclude: true,
                templateUrl: 'partials/title-objects-bar.html'
            }
        }
    ]);
'use strict';

angular.module('app')
    .factory('AppF', [
        "$state",
        "errAlertS",
        "$q",
        function(
            $state,
            errAlertS,
            $q
        ) {
            var obj = {
                paginate: 5,
                recycleDays: 30,
                inModule: 'site',
                user: false,
                contactFormUrl: "/contacto.php",
                goto: function(state) {
                    $state.go(state);
                },
                getSelected: function(array) {
                    var selected = [];
                    for (var a in array) {
                        if (array[a].selected) selected.push(array[a]);
                    }
                    return selected;
                },
                somethingIsSelected: function(objects) {
                    for (var a in objects) {
                        if (objects[a].selected) return true;
                    }
                    return false;
                },
                getLocation: function(){
                    var promise = $q.defer();
                    if(obj.myPosition){
                        promise.resolve(obj.myPosition);
                    } else {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(function(position){
                                obj.myPosition = {
                                    latitude: position.coords.latitude,
                                    longitude: position.coords.longitude
                                }
                                console.log(position, "ALMENOS")
                                promise.resolve(obj.myPosition);
                            }, function(err){
                                promise.reject(err);
                            });
                        } else {
                            promise.reject("Geolocation no está soportada en su navegador.")
                        }
                    }
                    return promise.promise;
                }
            };

            return obj;
        }
    ]);
'use strict';

Number.prototype.toRad = function () {
    return this * Math.PI / 180;
};

angular.module("app")
    .filter("geoDistance", [
        function () {
            /**
             * @param points Es el listado de coordenadas de los donadores
             * @param myLocations es la coordenada del voluntario
             * @param distance es la distancia en kilometros para el que va recoger
             */
            return function (points, myLocation, distance) {
                var nearestPoints = [];
                distance = parseInt(distance) || 10;

                function dist(meLocation, destination) {
                    var destinationLat = destination.latitude;
                    var destinationLong = destination.longitude;
                    var sourceLat = meLocation.latitude;
                    var sourceLong = meLocation.longitude;
                    var earthRadius = 6371;
                    var latitudeDiff = destinationLat - sourceLat;
                    var dLat = latitudeDiff.toRad();
                    var longitudeDiff = destinationLong - sourceLong;
                    var dLon = longitudeDiff.toRad();
                    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(sourceLat.toRad()) * Math.cos(destinationLat.toRad()) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    var d = earthRadius * c;
                    var m = d * 0.621371;
                    var obj = {
                        kilometers: d,
                        miles: m
                    };
                    return obj;
                }
                for (var t = 0; t < points.length; t++) {
                    points[t].distance = dist(myLocation, points[t]).kilometers;
                    var isInRadio = points[t].distance < (distance * 1000);
                    if (isInRadio) nearestPoints.push(points[t]);
                }
                return nearestPoints;
            }
        }
    ]);
'use strict';

angular.module("app")
    .filter("howManyImages", [
        function(){
            return function(images){
                var howMany = 0;
                if(images){
                    if(images.logo){
                        if(images.portada){
                            howMany = 2;
                        } 
                    } else {
                        if(images.portada){
                            howMany = 1;
                        }
                    }
                } 
                return howMany;
            }
        }
    ])
'use strict';

angular.module('app')
    .filter('randomKeyOfArray', [
        function(){
            return function(array){
                return Math.floor((Math.random() * array.length) + 1) - 1
            }
        }
    ])
'use strict';

angular.module('app')
    .filter('showingWhatPaginate', [
        function(){
            return function(page, paginate, array, total){
                var firstRecord, lastRecord;
                firstRecord = (page > 1) ? ((page-1) * paginate) + 1 : 1;
                if(page > 1){
                    lastRecord = (firstRecord+((array.length<paginate) ? array.length : paginate))-1;
                } else {
                    lastRecord = (array.length<paginate) ? array.length : paginate;
                }
                var final = firstRecord + "-" + lastRecord + " de " + total;
                return final;
            }
        }
    ]);
'use strict';

angular.module("app")
    .filter("shuffleArray", [
        function() {
            return function(array) {
                var m = array.length,
                    t, i;

                // While there remain elements to shuffle
                while (m) {
                    // Pick a remaining element…
                    i = Math.floor(Math.random() * m--);

                    // And swap it with the current element.
                    t = array[m];
                    array[m] = array[i];
                    array[i] = t;
                }

                return array;
            }
        }
    ]);
'use strict';

angular.module("app")
    .service("errAlertS", [
        "$mdToast",
        "$log",
        function($mdToast, $log) {
            return function(err) {
                if (angular.isDefined(err.code)) {
                    switch (err.code) {
                        case "EMAIL_TAKEN":
                            err = "El correo ya está en uso.";
                            break;
                        case "PERMISSION_DENIED":
                            err = "Permiso Denegado: El objeto está repetido o no cumple con las validaciones";
                            break;
                        case "INVALID_EMAIL":
                            err = "El correo no es válido";
                            break;
                        case "auth/user-not-found":
                            err = "Usuario no encontrado";
                            break;
                        case "auth/wrong-password":
                            err = "Password incorrecto";
                            break;
                        case "auth/too-many-requests":
                            err = "Se ha intentado entrar demaciadas veces con un password incorrecto. Hemos bloqueado toda petición de éste dispositivo, favor de intentar más tarde";
                            break;
                        case "auth/network-request-failed":
                            err = "Error de conexión, favor de intentar más tarde";
                            break;
                        case "storage/unauthorized":
                            err = "No autorizado";
                            break;
                        case "storage/canceled":
                            err = "Cancelado";
                            break;
                        case "storage/unknown":
                            err = "Problemas de conexión, favor de intentar más tarde";
                            break;
                        case "storage/invalid-argument":
                            err = "Archivo inválido";
                            break;
                    }
                }
                $log.error(err);

                // create toast settings object
                var toast = {
                    position: "bottom right",
                    hideDelay: 0,
                    template: '<md-toast class="error"><span flex>' + err + '</span><md-button class="md-icon-button" ng-click="closeToast()"><md-icon style="color: white" aria-label="hey" class="material-icons step">clear</md-icon></md-button></md-toast>',
                    controller: "ToastCtrl"
                };

                // show previously created toast
                $mdToast.show(toast)
            }
        }
    ])
'use strict';

angular.module("app")
    .service("infoAlertS", [
    "$mdToast",
    "$log",
    function ($mdToast, $log) {
        return function (msg) {
            $log.info(msg);

            var toast = {
                    position: "bottom right",
                    hideDelay: 5000,
                    template: '<md-toast><span flex>' + msg + '</span><md-button class="md-icon-button" ng-click="closeToast()"><md-icon style="color: white" aria-label="hey" class="material-icons step">clear</md-icon></md-button></md-toast>',
                    controller: "ToastCtrl"
                };

                // show previously created toast
                $mdToast.show(toast);
        }
    }
])
'use strict';

angular.module("app")
    .service("successAlertS", [
    "$mdToast",
    "$log",
    function ($mdToast, $log) {
        return function (msg) {
            $log.log(msg);

            var toast = {
                    position: "bottom right",
                    hideDelay: 5000,
                    template: '<md-toast class="success"><span flex>' + msg + '</span><md-button class="md-icon-button" ng-click="closeToast()"><md-icon style="color: white" aria-label="hey" class="material-icons step">clear</md-icon></md-button></md-toast>',
                    controller: "ToastCtrl"
                };

                // show previously created toast
                $mdToast.show(toast);
        }
    }
])