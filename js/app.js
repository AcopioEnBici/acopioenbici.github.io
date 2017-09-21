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
    .constant('allowedOfflineStates', ['admin.login','admin.register','home','donate','deliver','admin.logout'])
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
                .state('admin.main', {
                    url: '/main',
                    templateUrl: 'partials/admin/main.html',
                    controller: 'AdminMainCtrl'
                })
                .state('admin.logout', {
                    url: '/login',
                    templateUrl: 'partials/admin/logout.html',
                    controller: 'AdminLogoutCtrl'
                })
                .state('admin.register', {
                    url: '/registro',
                    templateUrl: 'partials/admin/register.html',
                    controller: 'AdminRegisterCtrl'
                })
                // cruds
                // .state('admin.cruds', {
                //     url: '/cruds',
                //     templateUrl: 'partials/admin/cruds.html',
                //     controller: 'CrudsCtrl'
                // })

            $urlRouterProvider.otherwise('/inicio');
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
        "loginRedirectPath",
        "AppF",
        "$firebaseObject",
        function($rootScope, $state, $log, $location, $localStorage, $timeout, config, states, loginRedirectPath, F, $firebaseObject) {
            firebase.initializeApp(config);

            var auth = firebase.auth();
            // watch for login status changes and redirect if appropriate
            auth.onAuthStateChanged(check);

            $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
                if (!F.user) {
                    if (!isPermitted(toState.name)) {
                        $log.debug(F.user, loginRedirectPath, $state.current.name, "YES");
                        $localStorage.lastPage = toState.name;
                        $state.go(loginRedirectPath);
                        e.preventDefault();
                    }
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
'use strict';

angular.module('app')
    .controller('DonateCtrl', [
        "$rootScope",
        "$scope",
        "errAlertS",
        "successAlertS",
        "NgMap",
        function($rootScope, $scope, errAlertS, successAlertS, NgMap) {
            var initiated = false;
            var root = firebase.database().ref("/");
            $scope.donator = {};

            var init = function() {
                initiated = true;
                NgMap.getMap().then(function(map) {
                  console.log(map.getCenter());
                  console.log('markers', map.markers);
                  console.log('shapes', map.shapes);
                });
            }

            $scope.save = function(){
                console.log('saving', $scope.donator);
                $scope.donator.createdAt = moment().valueOf();
                $scope.donator.status = 'esperando';
                root.child('donations').push($scope.donator).then(function(){
                    successAlertS('Gracias por registrarte como donador, en cuanto nos sea posible nos pondremos en contacto contigo');
                }, errAlertS);
            }

            $scope.ubicateMe = function(){
                console.log('ubicating me');
                //
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
        function($rootScope, $scope, $http, $sessionStorage, AppF) {
            $rootScope.F = AppF;

            var init = function() {
                
            }

            init();
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
        function($scope, $log, $mdSidenav, $timeout, $rootScope, AppF) {
            $log.debug('inside MenuCtrl');
            // $scope.toggleLeft = buildDelayedToggler('left');
            $scope.toggleLeft = function(){
                $mdSidenav('left')
                .toggle()
                .then(function() {
                    $log.debug("toggle is done");
                });
            }
            $rootScope.F = AppF;

            $scope.close = function() {
                $mdSidenav('left')
                .close()
                .then(function() {
                    $log.debug("close LEFT is done");
                });
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
                    timer = $timeout(function() {
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
                return debounce(function() {
                    // Component lookup should always be available since we are not using `ng-if`
                    $mdSidenav(navID)
                        .toggle()
                        .then(function() {
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
        function($rootScope, $scope, $log, successAlertS, errAlertS, $firebaseAuth, $state, $q, F, $firebaseArray) {
            var initiated = false;
            $scope.volunteer = {};
            var root = firebase.database().ref('/');
            $scope.auth = $firebaseAuth();
            $scope.distanceFromMe = 10;
            $scope.distanceForCenters = 100;
            $scope.selectedDonation = false;
            $scope.selectedCenter = false;

            $scope.save = function(){
                $log.debug('saving', $scope.volunteer);
                $scope.volunteer.registeredTovolunteer = true;
                $scope.volunteer.updatedAt = moment().valueOf();
                root.child('volunteers').child($scope.volunteer.uid).set($scope.volunteer).then(function(){
                    successAlertS('Gracias por registrarte como voluntario, en cuanto nos sea posible nos pondremos en contacto contigo');
                }, errAlertS);
                
            }

            $scope.loginWithTwitter = function(){
                $scope.auth.$signInWithRedirect('twitter').catch(errAlertS);
            }

            $scope.deliverDonation = function(){
                $scope.selectedDonation.status = 'entregado';
                $scope.selectedDonation.deliveredAt = $scope.selectedCenter.$id;
                $scope.deliveredBy = F.user.uid;
                $scope.updatedAt = moment().valueOf();
                $scope.selectedDonation.$save().then(function(){
                    successAlertS('Gracias!! Se entrego la donación correctamente!');
                }, errAlertS);
            }

            $scope.pickupDonation = function(){
                $scope.selectedDonation.status = 'recogido';
                // $scope.selectedDonation.deliveredAt = $scope.selectedCenter.$id;
                $scope.pickedBy = F.user.uid;
                $scope.updatedAt = moment().valueOf();
                $scope.selectedDonation.$save().then(function(){
                    successAlertS('Gracias!! Se entrego la donación correctamente!');
                }, errAlertS);
            }

            $scope.cancelPickup = function(){
                $scope.selectedDonation.status = null;
                $scope.updatedAt = moment().valueOf();
                $scope.selectedDonation.$save().then(function(){
                    successAlertS('Se canceló el acopio de la donación');
                }, errAlertS);
            }

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

            var initMap = function(){ 
                $scope.donationsAvailable = [
                    { latitude: 67.331, longitude: 56.214 },
                    { latitude: 67.331, longitude: 56.214 },
                    { latitude: 67.331, longitude: 56.214 },
                    { latitude: 67.331, longitude: 56.214 },
                    { latitude: 67.331, longitude: 56.214 },
                    { latitude: 67.331, longitude: 56.214 },
                    { latitude: 67.331, longitude: 56.214 },
                    { latitude: 67.331, longitude: 56.214 },
                    { latitude: 67.331, longitude: 56.214 },
                ];
                // $scope.donationsAvailable = $firebaseArray(root.child('donations').orderByChild('status').equalTo('esperando'))

                $scope.centersAvailable = $firebaseArray(root.child('centers').orderByChild('active').equalTo(true));
            }

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
                                        initMap();
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

            $rootScope.$on('loggedIn', function(event, logged) {
                $log.debug(logged, "loggedIn?")
                if (logged && !initiated) init(F.user);
            });

            if (F.user && !initiated) {
                init(F.user);
            }
        }
    ]);
'use strict';

angular.module('app')
    .directive('mapNearPoints', [
        "geoDistanceFilter",
        "NgMap",
        "$document",
        function(geoDistanceFilter, NgMap, $document){
            return {
                restrict: 'E',
                scope: {
                    points: '=',
                    distance: '=',
                    onPointSelect: '='
                },
                templateUrl: 'partials/map-near-points.html',
                link: function(scope, ele, attrs){
                    // scope.currentP = {
                    //     latitude: 19.390519, longitude: -99.4238064
                    // }
                    scope.currentP = {
                        latitude: 32.123, 
                        longitude: 43.21
                    }
                    scope.pointSelected = false;
                    scope.nearesPoints = [];

                    scope.selectPoint = function(point){
                        if(point != scope.onPointSelect) scope.onPointSelect = point;
                        else scope.onPointSelect = false;
                    }

                    var getNearestPoints = function(){
                        scope.nearestPoints = geoDistanceFilter(scope.points, scope.currentP, scope.distance);
                        setTimeout(function(){
                            NgMap.getMap().then(function(map){
                                var center = map.getCenter();
                                google.maps.event.trigger(map, "resize");
                                // map.setCenter(center);
                                // console.log(scope.nearesPoints, scope.points, scope.currentP);
                            }).catch(function(err){
                                console.error(err);
                            });
                        }, 1000)
                    }

                    $document.ready(function(){
                        var getNearestWatcher = scope.$watchGroup(['points','distance'], function(all){
                            if(all[0] && all[1]){
                                if(scope.points.length) {
                                    getNearestPoints();
                                    getNearestWatcher();
                                }
                            }
                        },1);
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
        function($state) {
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
                }
            };

            return obj;
        }
    ]);
'use strict';

Number.prototype.toRad = function() {
   return this * Math.PI / 180;
};

angular.module("app")
    .filter("geoDistance", [
        function() {
           /**
            * @param points Es el listado de coordenadas de los donadores
            * @param myLocations es la coordenada del voluntario
            * @param distance es la distancia en kilometros para el que va recoger
            */
            return function(points, myLocation, distance) {

               distance = parseInt(distance) || 10;

               function dist(meLocation, destination) {
                  var destinationLat = destination.latitude; 
                  var destinationLong = destination.longitude; 
                  var sourceLat = meLocation.latitude; 
                  var sourceLong = meLocation.longitude; 
                  var earthRadius = 6371; 
                  var latitudeDiff = destinationLat-sourceLat;
                  var dLat = latitudeDiff.toRad();  
                  var longitudeDiff = destinationLong-sourceLong;
                  var dLon = longitudeDiff.toRad();  
                  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(sourceLat.toRad()) * Math.cos(destinationLat.toRad()) * Math.sin(dLon/2) * Math.sin(dLon/2);  
                  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                  var d = earthRadius * c;
                  var m = d * 0.621371; 
                  var obj = {
                     kilometers: d,
                     miles: m 
                  };
                  return obj;
               }
               for(var t=0;t < points.length; t++){
                  points[t].distance = dist(myLocation, points[t]).kilometers;
               }
               return points.filter(function(item){
                  return item.distance < distance
               });
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