angular.module('starter.controllers', [])


  .controller('LoginCtrl', function ($scope, LoginService, $ionicPopup, $state, $http, $localstorage) {
    $scope.data = {};

    $scope.login = function () {
      console.log('jupii');
      $scope.user = $http.post('http://localhost:3030/login', {
        username: $scope.data.username,
        password: $scope.data.password
      }).then(function (response) {
        if (response.data.success) {
          console.log('loggin in');
          $localstorage.setObject('fixture', {
            fixture_id: 23,
            sent: false,
            done: false
          });
          $localstorage.set('username', $scope.data.username);
          console.log('localstorage ' + $localstorage.get('username'));
          LoginService.loginUser($scope.data.username, $scope.data.password).success(function (data) {
            $state.go('tab.dash');
          }).error(function (data) {
            var alertPopup = $ionicPopup.alert({
              title: 'Login failed!',
              template: 'Please check your credentials!'
            });
          });
        } else {
          console.log('failed to login');
        }
      });

    }
  })

  .controller('DashCtrl', function ($scope, $http, $ionicPopup, $state, $localstorage) {

    $scope.fixture = $localstorage.getObject('fixture').fixture_id;
    $scope.storage = $localstorage.getObject('fixture');
    console.log('ble ble' + $scope.fixture);
    $scope.kupon = [];
    console.log('stan ' + $state.current);

    var config = {
      headers: {
        'X-Auth-Token': '96d3601f16a8440098e5c37123052c87'
      }
    };

    function makeOptions(mecze) {
      $scope.options = [];
      for (var i = 0, l = mecze.length; i < l; i++) {
        var obj = {
          availableOptions: [
            mecze[i].homeTeamName,
            'Remis',
            mecze[i].awayTeamName
          ],
          selectedOption: mecze[i].awayTeamName //This sets the default value of the select in the ui
        };
        console.log(obj);
        $scope.mecze.fixtures[i].options = obj;
        $scope.options.push(obj);
      }
      console.log($scope.mecze);
    }

    $http.get('http://api.football-data.org/v1/soccerseasons/398/fixtures/?matchday=' + $scope.fixture, config).then(function (response) {
      $scope.mecze = response.data;
      console.log($scope.mecze);
      makeOptions($scope.mecze.fixtures);
    }, function (response) {
      console.log('error fetching data');
    });

    $scope.add = function () {

      for (var i = 0, l = $scope.mecze.fixtures.length; i < l; i++) {
        $scope.kupon.push($scope.mecze.fixtures[i].options.selectedOption);
      }
      console.log($scope.kupon);
      var user = {
        username: $localstorage.get('username'),
        coupon: {
          fix_id: $scope.fixture,
          matches: $scope.kupon,
          done: false
        }
      };

      $http.post('http://localhost:3030/send', user).then(function (response) {
        if (response.data.success) {
          $localstorage.setObject('fixture', {
            fixture_id: $scope.storage.fixture_id,
            sent: true,
            done: false
          });
          $state.go($state.current, {}, {reload: true});
        } else {
          var alertPopup = $ionicPopup.alert({
            title: 'Nie udalo sie przeslac kuponu!',
            template: 'Mozliwe, ze probujesz zhakowac system!'
          });
        }
      });
    };

    $scope.check = function () {
      //var checked = {};
      var user = {
        username: $localstorage.get('username')
      };

      $http.post('http://localhost:3030/coupon/' + $scope.storage.fixture_id, user).then(function (response) {
        var checked = response.data;
        console.log('co tutaj jest');
        console.log(checked);
        var winArray = [];
        var checking = $scope.mecze.fixtures;
        for (var i = 0, l = checking.length; i < l; i++) {
          if (checking[i].result.goalsHomeTeam > checking[i].result.goalsAwayTeam) {
            winArray.push(checking[i].homeTeamName);
          } else if (checking[i].result.goalsHomeTeam < checking[i].result.goalsAwayTeam) {
            winArray.push(checking[i].awayTeamName);
          } else {
            winArray.push('Remis');
          }
        }
        console.log(winArray);
        var points = 0;
        var multi = 1;
        console.log('checking');
        console.log(checking[0]);
        console.log(checked[0]);
        for (var i = 0, l = checking.length; i < l; i++) {
          if (winArray[i] === checked.matches[i]) {
            console.log('weszlo tu');
            points += 20;
            multi *= 1.1;
          } else {
            multi *= 0.9;
          }
        }
        points = points * multi;
        console.log('ilosc punktow' + points);

        $http.put('http://localhost:3030/coupon/' + user.username, {points: points}).then(function (response) {

          if (response.data.success) {
            $localstorage.setObject('fixture', {
              fixture_id: $scope.storage.fixture_id + 1,
              sent: false,
              done: false
            });
            $scope.user = response.data.user;

          }
        });
      });


    }

  })

  .controller('ChatsCtrl', function ($scope, Chats, $http) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    $http.get('http://localhost:3030/stats').then(function (response) {
      $scope.users = response.data;
      console.log($scope.users);
    });

    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
      Chats.remove(chat);
    };
  })

  .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
  })

  .controller('AccountCtrl', function ($scope, $http) {

    var config = {
      headers: {
        'X-Auth-Token': '96d3601f16a8440098e5c37123052c87'
      }
    };
    $http.get('http://api.football-data.org/v1/soccerseasons/398/leagueTable', config).then(function (response) {
      $scope.mecze = response.data;
      console.log($scope.mecze);
    }, function (response) {
      console.log('error fetching data');
    });

    $scope.settings = {
      enableFriends: true
    };
  });
